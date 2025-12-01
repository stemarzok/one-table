import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      firstName,
      lastName,
      applicantEmail,
      password,
      applicantRole,
      businessName,
      vatNumber,
      legalRepresentative,
      businessEmail,
      businessPhone,
      country,
      city,
      street,
      province,
      postalCode
    } = await req.json()

    // 1. Create user account with Admin Client (bypasses email confirmation requirement)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: applicantEmail,
      password: password,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        name: `${firstName} ${lastName}`,
        role: applicantRole
      }
    })

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`)
    }
    if (!authData.user) {
      throw new Error("Failed to create user account")
    }

    const userId = authData.user.id
    const fullAddress = `${street}, ${city}, ${country}${postalCode ? ', ' + postalCode : ''}${province ? ', ' + province : ''}`

    // 2. Create restaurant using service role (bypasses RLS)
    const { data: restaurantData, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .insert({
        owner_id: userId,
        name: businessName,
        business_name: businessName,
        business_registration_number: vatNumber,
        legal_representative: legalRepresentative,
        email: businessEmail,
        phone: businessPhone,
        address: fullAddress,
        city: city,
        is_verified: true,
        verification_status: 'approved'
      })
      .select()
      .single()

    if (restaurantError) {
      throw new Error(`Restaurant error: ${restaurantError.message}`)
    }
    if (!restaurantData) {
      throw new Error("Failed to create restaurant")
    }

    // 3. Create business role using service role (bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('business_roles')
      .insert({
        user_id: userId,
        restaurant_id: restaurantData.id,
        role: 'owner'
      })

    if (roleError) {
      throw new Error(`Role error: ${roleError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: userId,
        restaurantId: restaurantData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Registration failed'
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})