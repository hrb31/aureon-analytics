

# Security Hardening Plan

## Overview
This plan addresses the three security areas you've identified: API key exposure, rate limiting, and input validation. After analyzing the codebase, here's what needs to be done.

---

## 1. API Key Exposure

### Current State
- **Good**: Sensitive keys (LOVABLE_API_KEY, DEMO_PASSWORD, SUPABASE_SERVICE_ROLE_KEY) are stored as Supabase secrets and only accessed in edge functions
- **Good**: Frontend only uses the publishable anon key, which is designed to be public
- **Issue Found**: `src/hooks/useAIInsight.ts` has hardcoded Supabase URL and anon key instead of using environment variables

### What Needs to Change

| File | Issue | Fix |
|------|-------|-----|
| `src/hooks/useAIInsight.ts` | Hardcoded URL and anon key | Use `import.meta.env.VITE_SUPABASE_*` variables |

### Technical Notes
The Supabase anon key is a **publishable key** - it's designed to be exposed in frontend code and is protected by Row Level Security (RLS) policies. This is similar to how Stripe's publishable key works. No additional protection is needed for this key, but we should use environment variables for consistency.

---

## 2. Rate Limiting

### Current State
- Edge functions have **no rate limiting** implemented
- Only the Lovable AI gateway has built-in rate limiting (429 responses are handled)
- The `verify-password` function is particularly vulnerable to brute-force attacks

### What Needs to Change

We'll implement rate limiting at the edge function level using a simple in-memory approach with Supabase for persistence:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `verify-password` | 5 requests | per minute |
| `ai-analyst` | 20 requests | per minute |
| `generate-insight` | 30 requests | per minute |
| `generate-title` | 60 requests | per minute |

### Implementation Approach

Create a shared rate limiting utility and a `rate_limits` table in Supabase:

```text
+-------------------+
| rate_limits table |
+-------------------+
| id (uuid)         |
| identifier (text) | -- IP or user ID
| endpoint (text)   |
| count (int)       |
| window_start (ts) |
+-------------------+
```

Each edge function will:
1. Extract client IP from request headers
2. Check/increment rate limit counter
3. Return 429 if limit exceeded
4. Process request if within limits

---

## 3. Input Validation

### Current State
- **No Zod validation** in the codebase (only has react-hook-form but Zod is unused)
- Edge functions have minimal validation (only checking if required fields exist)
- Client-side validation is basic (checking for empty strings)

### What Needs to Change

| Location | Current | Fix |
|----------|---------|-----|
| Edge Functions | Basic null checks | Add Zod schemas for all inputs |
| Frontend forms | Empty string checks | Add Zod validation with proper error messages |
| Conversation titles | `.slice(0, 30)` only | Add sanitization + length + character validation |
| AI messages | No validation | Add content length limits |

### Validation Rules to Implement

| Field | Max Length | Allowed Characters | Notes |
|-------|-----------|-------------------|-------|
| Email | 255 | Standard email format | Already handled by Supabase Auth |
| Password | 128 | Any | Already handled by Supabase Auth |
| Conversation title | 50 | Alphanumeric + spaces + basic punctuation | Strip HTML/scripts |
| AI message content | 10,000 | Any text | Prevent massive payloads |
| First message (for title gen) | 500 | Any text | Truncate before sending to AI |

---

## 4. RLS Policy Fixes (Bonus)

The linter detected 4 "always true" RLS policies that should be fixed:

| Table | Policy | Current | Should Be |
|-------|--------|---------|-----------|
| `ai_conversations` | INSERT | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| `ai_conversations` | UPDATE | `USING (true)` | Should add user_id column and check ownership |
| `ai_conversations` | DELETE | `USING (true)` | Should add user_id column and check ownership |
| `ai_messages` | INSERT | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |

**Note**: Properly fixing the UPDATE/DELETE policies requires adding a `user_id` column to the AI tables to track ownership. This is a larger change that should be considered separately.

---

## Implementation Order

1. **Fix hardcoded URL in useAIInsight.ts** (quick fix)
2. **Create rate_limits table + rate limiting utility** 
3. **Add rate limiting to verify-password** (highest priority - auth endpoint)
4. **Add rate limiting to other edge functions**
5. **Add Zod validation to edge functions**
6. **Add Zod validation to frontend forms**
7. **(Optional) Fix RLS policies with user_id tracking**

---

## Files to Create/Modify

### New Files
- `supabase/functions/_shared/rate-limit.ts` - Shared rate limiting utility
- `supabase/functions/_shared/validation.ts` - Shared Zod schemas

### Modified Files
- `src/hooks/useAIInsight.ts` - Use environment variables
- `supabase/functions/verify-password/index.ts` - Add rate limiting + input validation
- `supabase/functions/ai-analyst/index.ts` - Add rate limiting + input validation  
- `supabase/functions/generate-insight/index.ts` - Add rate limiting
- `supabase/functions/generate-title/index.ts` - Add rate limiting + input validation
- `src/hooks/useConversations.ts` - Add Zod validation for title updates

### Database Migration
- Create `rate_limits` table for persistent rate limiting

---

## Estimated Effort
- API key fix: 5 minutes
- Rate limiting infrastructure: 30-45 minutes
- Input validation (edge functions): 30 minutes
- Input validation (frontend): 20 minutes
- RLS policy fixes (if including user_id): 1 hour additional

