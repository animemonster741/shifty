import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const loginSchema = z.object({
  employeeId: z.string().trim().min(1).max(64).regex(/^[A-Za-z0-9_\-.]+$/),
  password: z.string().min(1).max(200),
  action: z.literal('login'),
})

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const parsed = loginSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return json({ error: 'Invalid credentials' }, 401)
    }
    const { employeeId, password } = parsed.data

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const internalEmail = `${employeeId}@internal.noc.local`

    // Verify the password server-side BEFORE returning any identifying info.
    // This prevents email/employee-ID enumeration via the login endpoint.
    const { data: signIn, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: internalEmail,
      password,
    })

    if (signInError || !signIn?.session) {
      return json({ error: 'Invalid credentials' }, 401)
    }

    // Return only the email (already known to a legitimate caller) so the
    // client can establish its own session via signInWithPassword.
    return json({ email: internalEmail })
  } catch (_error) {
    return json({ error: 'Invalid credentials' }, 401)
  }
})
