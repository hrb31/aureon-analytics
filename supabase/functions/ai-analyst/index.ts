import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert analytics consultant for Aureon Analytics, a SaaS metrics platform.
You have access to real-time business data that will be provided with each question.

When answering questions:
1. Reference specific numbers from the provided data
2. Identify drivers, risks, and implications
3. Use consultancy-style reasoning (e.g., "This indicates...", "The key driver is...", "Risk factor:")
4. Keep responses concise but insightful (2-4 paragraphs max)
5. Highlight actionable recommendations when relevant
6. Use bullet points for lists of insights
7. Format numbers with proper formatting (e.g., $1.2M, 15.3%)

If the data doesn't contain enough information to fully answer a question, acknowledge the limitation and provide what insights you can.

Always maintain a professional, consultancy tone - think McKinsey or Bain style insights.`;

async function fetchMetricsData(supabaseClient: any) {
  const [kpiResult, revenueResult, acquisitionResult, healthResult, planResult] = await Promise.all([
    supabaseClient.from("v_kpi_summary").select("*").single(),
    supabaseClient.from("v_revenue_over_time").select("*").order("month", { ascending: false }).limit(12),
    supabaseClient.from("v_acquisition_performance").select("*"),
    supabaseClient.from("v_customer_health").select("*"),
    supabaseClient.from("v_revenue_by_plan").select("*"),
  ]);

  const kpi = kpiResult.data || {};
  const revenueData = revenueResult.data || [];
  const acquisitionData = acquisitionResult.data || [];
  const healthData = healthResult.data || [];
  const planData = planResult.data || [];

  // Calculate at-risk customers
  const atRiskCustomers = healthData.filter((c: any) => c.risk_level === "high" || c.risk_level === "medium");

  return `
## Current Business Metrics

### Key Performance Indicators
- **MRR (Monthly Recurring Revenue):** $${(kpi.mrr || 0).toLocaleString()}
- **ARR (Annual Recurring Revenue):** $${(kpi.arr || 0).toLocaleString()}
- **Total Revenue:** $${(kpi.total_revenue || 0).toLocaleString()}
- **Total Customers:** ${kpi.total_customers || 0}
- **Active Customers:** ${kpi.active_customers || 0}
- **New Customers (this period):** ${kpi.new_customers || 0}
- **Churned Customers:** ${kpi.churned_customers || 0}
- **Churn Rate:** ${((kpi.churn_rate || 0) * 100).toFixed(1)}%
- **Customer Acquisition Cost (CAC):** $${(kpi.cac || 0).toLocaleString()}

### Revenue by Plan
${planData.map((p: any) => `- **${p.plan_name}:** $${(p.monthly_revenue || 0).toLocaleString()}/month (${p.customer_count} customers, ${((p.percentage || 0) * 100).toFixed(1)}% of revenue)`).join("\n")}

### Revenue Trend (Last 12 Months)
${revenueData.slice(0, 6).map((r: any) => `- ${r.month}: $${(r.revenue || 0).toLocaleString()} (${r.invoice_count} invoices, ${r.paid_count} paid)`).join("\n")}

### Acquisition Channel Performance
${acquisitionData.map((a: any) => `- **${a.channel_name}:** ${a.total_conversions} conversions, ${((a.conversion_rate || 0) * 100).toFixed(1)}% rate, $${(a.cost_per_acquisition || 0).toFixed(0)} CPA`).join("\n")}

### Customer Health Overview
- **Total Customers Tracked:** ${healthData.length}
- **At-Risk Customers (Medium/High Risk):** ${atRiskCustomers.length}
- **High Risk:** ${healthData.filter((c: any) => c.risk_level === "high").length}
- **Medium Risk:** ${healthData.filter((c: any) => c.risk_level === "medium").length}
- **Low Risk:** ${healthData.filter((c: any) => c.risk_level === "low").length}

### At-Risk Customer Details
${atRiskCustomers.slice(0, 5).map((c: any) => `- **${c.company}** (${c.plan_name}): Health Score ${c.health_score}, ${c.risk_level} risk`).join("\n")}
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Create Supabase client to fetch metrics
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch current metrics data
    const metricsContext = await fetchMetricsData(supabaseClient);

    // Build the messages array with system prompt and metrics context
    const systemMessage = {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\n${metricsContext}`,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [systemMessage, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please check your Lovable AI credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Analyst error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
