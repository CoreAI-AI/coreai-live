import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate unique demo account credentials
    const timestamp = Date.now()
    const demoEmail = `demo-${timestamp}@example.com`
    const demoPassword = "demo123456"

    console.log(`Creating demo user with email: ${demoEmail}`)

    // Create the user account using admin client (bypasses email confirmation)
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm the email
    })

    if (signUpError) {
      console.error('Demo user creation error:', signUpError)
      throw signUpError
    }

    if (!signUpData.user) {
      throw new Error('User creation failed - no user returned')
    }

    console.log(`Demo user created successfully: ${signUpData.user.id}`)

    // Create profile for the demo user using admin client (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: signUpData.user.id,
        display_name: "Demo User",
        email: demoEmail,
      })

    if (profileError) {
      console.error('Demo profile creation error:', profileError)
      throw profileError
    }

    console.log('Demo profile created successfully')

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email: demoEmail,
          password: demoPassword
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in create-demo-user function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create demo user'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})