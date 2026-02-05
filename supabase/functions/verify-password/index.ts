import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { validateRequest, passwordSchema } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check rate limit first
  const rateLimitResult = await checkRateLimit(req, "verify-password");
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(corsHeaders, rateLimitResult.error);
  }

  // Validate input
  const validation = await validateRequest(req, passwordSchema, corsHeaders);
  if (!validation.success) {
    return validation.response;
  }

  try {
    const { password } = validation.data;

    const DEMO_PASSWORD = Deno.env.get("DEMO_PASSWORD");

    if (!DEMO_PASSWORD) {
      console.error("DEMO_PASSWORD not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isValid = password === DEMO_PASSWORD;

    return new Response(
      JSON.stringify({ success: isValid }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error verifying password:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid request" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
