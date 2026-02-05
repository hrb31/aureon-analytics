import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Password validation schema
export const passwordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

// AI message validation schema
export const aiMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(10000, "Message content must be less than 10,000 characters"),
});

// AI analyst request validation schema
export const aiAnalystRequestSchema = z.object({
  messages: z
    .array(aiMessageSchema)
    .min(1, "At least one message is required")
    .max(100, "Too many messages in conversation"),
});

// Generate title request validation schema
export const generateTitleRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message must be less than 500 characters")
    .transform((val) => val.slice(0, 500)), // Truncate just in case
});

// Conversation title validation schema
export const conversationTitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(50, "Title must be less than 50 characters")
  .transform((val) => {
    // Sanitize: remove HTML tags and script content
    return val
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[<>]/g, "") // Remove any remaining angle brackets
      .trim()
      .slice(0, 50);
  });

/**
 * Validate request body against a schema
 * Returns the validated data or an error response
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  corsHeaders: Record<string, string>
): Promise<{ success: true; data: T } | { success: false; response: Response }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return {
        success: false,
        response: new Response(
          JSON.stringify({
            error: "Validation failed",
            details: errors,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
    };
  }
}

/**
 * Sanitize a string for safe storage/display
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove remaining angle brackets
    .trim()
    .slice(0, maxLength);
}
