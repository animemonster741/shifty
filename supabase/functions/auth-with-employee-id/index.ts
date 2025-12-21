import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { employeeId, password, action } = await req.json()

    if (!employeeId || !password) {
      return new Response(
        JSON.stringify({ error: 'Employee ID and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Generate internal email from employee ID
    const internalEmail = `${employeeId}@internal.noc.local`

    if (action === 'login') {
      // Verify the employee ID exists in profiles first
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('employee_id', employeeId)
        .maybeSingle()

      if (profileError) {
        console.error('Profile lookup error:', profileError)
        return new Response(
          JSON.stringify({ error: 'Error looking up employee ID' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'Employee ID not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user by ID from auth to verify email matches
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id)

      if (userError || !userData?.user) {
        return new Response(
          JSON.stringify({ error: 'User account not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return the email for client-side login
      return new Response(
        JSON.stringify({ email: userData.user.email }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
