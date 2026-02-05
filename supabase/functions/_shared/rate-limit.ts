import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "verify-password": { maxRequests: 5, windowMinutes: 1 },
  "ai-analyst": { maxRequests: 20, windowMinutes: 1 },
  "generate-insight": { maxRequests: 30, windowMinutes: 1 },
  "generate-title": { maxRequests: 60, windowMinutes: 1 },
};

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Check if request is rate limited
 * Returns true if the request should be allowed, false if rate limited
 */
export async function checkRateLimit(
  req: Request,
  endpoint: string
): Promise<{ allowed: boolean; error?: string }> {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    console.warn(`No rate limit config for endpoint: ${endpoint}`);
    return { allowed: true };
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase configuration for rate limiting");
    // Allow request if we can't check rate limit
    return { allowed: true };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const identifier = getClientIP(req);

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      // Allow request if rate limit check fails
      return { allowed: true };
    }

    if (!data) {
      return {
        allowed: false,
        error: `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowMinutes} minute(s).`,
      };
    }

    return { allowed: true };
  } catch (err) {
    console.error("Rate limit error:", err);
    // Allow request if rate limit check fails
    return { allowed: true };
  }
}

/**
 * Create a 429 Too Many Requests response
 */
export function rateLimitResponse(corsHeaders: Record<string, string>, message?: string): Response {
  return new Response(
    JSON.stringify({ 
      error: message || "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED"
    }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
