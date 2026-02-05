import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { validateRequest, generateTitleRequestSchema, sanitizeString } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check rate limit first
  const rateLimitResult = await checkRateLimit(req, "generate-title");
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(corsHeaders, rateLimitResult.error);
  }

  // Validate input
  const validation = await validateRequest(req, generateTitleRequestSchema, corsHeaders);
  if (!validation.success) {
    return validation.response;
  }

  try {
    const { message } = validation.data;
    
    // Sanitize the message before sending to AI
    const sanitizedMessage = sanitizeString(message, 500);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Generate a very short, concise title (2-4 words max, under 25 characters) for a conversation that starts with the user's message. The title should capture the main topic. Do not use quotes or punctuation. Just return the title, nothing else.`,
          },
          {
            role: "user",
            content: sanitizedMessage,
          },
        ],
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      // Fall back to truncated message
      const fallbackTitle = sanitizedMessage.slice(0, 25).trim() + (sanitizedMessage.length > 25 ? "..." : "");
      return new Response(JSON.stringify({ title: fallbackTitle }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let title = data.choices?.[0]?.message?.content?.trim() || sanitizedMessage.slice(0, 25);
    
    // Clean up and truncate
    title = title.replace(/^["']|["']$/g, "").trim();
    if (title.length > 30) {
      title = title.slice(0, 27) + "...";
    }

    return new Response(JSON.stringify({ title }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate title error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
