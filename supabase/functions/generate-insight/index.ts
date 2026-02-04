import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    // Use service role client to bypass RLS for analytics queries
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch current KPIs
    const { data: kpiData, error: kpiError } = await supabase
      .from("v_kpi_summary")
      .select("*")
      .single();

    // Fetch revenue by plan
    const { data: planData } = await supabase
      .from("v_revenue_by_plan")
      .select("*")
      .order("monthly_revenue", { ascending: false });

    // Fetch revenue trends
    const { data: revenueData } = await supabase
      .from("v_revenue_over_time")
      .select("*")
      .order("month", { ascending: false })
      .limit(3);

    // Build context for AI
    const metricsContext = `
Current Business Metrics:
- Total Revenue: $${kpiData?.total_revenue?.toLocaleString() ?? 0}
- MRR: $${kpiData?.mrr?.toLocaleString() ?? 0}
- ARR: $${kpiData?.arr?.toLocaleString() ?? 0}
- Total Customers: ${kpiData?.total_customers ?? 0}
- Active Customers: ${kpiData?.active_customers ?? 0}
- Churned Customers: ${kpiData?.churned_customers ?? 0}
- Churn Rate: ${kpiData?.churn_rate ?? 0}%
- CAC: $${kpiData?.cac ?? 0}

Revenue by Plan:
${planData?.map((p) => `- ${p.plan_name}: $${p.monthly_revenue?.toLocaleString() ?? 0} (${p.customer_count} customers, ${p.percentage}%)`).join("\n") ?? "No plan data"}

Recent Monthly Revenue:
${revenueData?.map((r) => `- ${r.month}: $${r.revenue?.toLocaleString() ?? 0} (${r.paid_count} paid invoices)`).join("\n") ?? "No revenue data"}
`;

    const systemPrompt = `You are a business analytics AI assistant. Analyze the provided metrics and generate ONE concise, actionable insight.

Requirements:
- Keep it under 50 words
- Focus on the most significant trend, anomaly, or opportunity
- Be specific with numbers and percentages
- Suggest a clear action or highlight why this matters
- Don't use bullet points or lists
- Write in a direct, professional tone`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Based on these metrics, provide a key business insight:\n\n${metricsContext}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const insight = aiResponse.choices?.[0]?.message?.content ?? "";

    // Extract a potential highlight value (percentage or dollar amount)
    const percentMatch = insight.match(/(\d+(?:\.\d+)?%)/);
    const dollarMatch = insight.match(/\$[\d,]+(?:\.\d{2})?/);
    const highlightValue = percentMatch?.[0] ?? dollarMatch?.[0] ?? null;

    return new Response(
      JSON.stringify({ insight, highlightValue }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-insight error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
