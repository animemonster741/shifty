import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  const { employeeId, password, fullName } = await req.json()
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { autoRefreshToken: false, persistSession: false } })
  const userId = '86d5b498-522d-4188-8b03-07fb0fb22379'
  const { data: u } = await admin.auth.admin.getUserById(userId)
  const newEmail = `${employeeId}@internal.noc.local`
  const { data: upd, error: updErr } = await admin.auth.admin.updateUserById(userId, { email: newEmail, password, email_confirm: true })
  if (fullName) await admin.from('profiles').update({ full_name: fullName }).eq('id', userId)
  await admin.from('user_roles').update({ role: 'admin' }).eq('user_id', userId)
  return new Response(JSON.stringify({ before: { email: u.user?.email, confirmed: u.user?.email_confirmed_at }, after: { email: upd.user?.email }, error: updErr?.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
