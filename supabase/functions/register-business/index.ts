import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const BusinessRegistrationSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2, { message: "Il nome deve essere almeno 2 caratteri" })
    .max(100, { message: "Il nome deve essere meno di 100 caratteri" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Il nome contiene caratteri non validi" }),
  lastName: z.string()
    .trim()
    .min(2, { message: "Il cognome deve essere almeno 2 caratteri" })
    .max(100, { message: "Il cognome deve essere meno di 100 caratteri" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Il cognome contiene caratteri non validi" }),
  applicantEmail: z.string()
    .trim()
    .email({ message: "Inserisci un indirizzo email valido" })
    .max(255, { message: "L'email deve essere meno di 255 caratteri" }),
  password: z.string()
    .min(8, { message: "La password deve essere almeno 8 caratteri" })
    .max(128, { message: "La password deve essere meno di 128 caratteri" })
    .regex(/[A-Z]/, { message: "Deve contenere almeno una lettera maiuscola" })
    .regex(/[a-z]/, { message: "Deve contenere almeno una lettera minuscola" })
    .regex(/[0-9]/, { message: "Deve contenere almeno un numero" }),
  applicantRole: z.string()
    .trim()
    .max(100, { message: "Il ruolo deve essere meno di 100 caratteri" })
    .optional(),
  businessName: z.string()
    .trim()
    .min(2, { message: "Il nome azienda deve essere almeno 2 caratteri" })
    .max(200, { message: "Il nome azienda deve essere meno di 200 caratteri" }),
  vatNumber: z.string()
    .trim()
    .min(5, { message: "La partita IVA deve essere almeno 5 caratteri" })
    .max(50, { message: "La partita IVA deve essere meno di 50 caratteri" })
    .regex(/^[A-Z]{0,2}[0-9A-Z]+$/, { message: "Formato partita IVA non valido" }),
  legalRepresentative: z.string()
    .trim()
    .min(2, { message: "Il rappresentante legale deve essere almeno 2 caratteri" })
    .max(200, { message: "Il rappresentante legale deve essere meno di 200 caratteri" }),
  businessEmail: z.string()
    .trim()
    .email({ message: "Inserisci un indirizzo email aziendale valido" })
    .max(255, { message: "L'email aziendale deve essere meno di 255 caratteri" }),
  businessPhone: z.string()
    .trim()
    .regex(/^\+?[0-9\s()-]{8,20}$/, { message: "Inserisci un numero di telefono valido" }),
  country: z.string()
    .trim()
    .min(2, { message: "Il paese deve essere almeno 2 caratteri" })
    .max(100, { message: "Il paese deve essere meno di 100 caratteri" }),
  city: z.string()
    .trim()
    .min(2, { message: "La città deve essere almeno 2 caratteri" })
    .max(100, { message: "La città deve essere meno di 100 caratteri" }),
  street: z.string()
    .trim()
    .min(2, { message: "L'indirizzo deve essere almeno 2 caratteri" })
    .max(300, { message: "L'indirizzo deve essere meno di 300 caratteri" }),
  province: z.string()
    .trim()
    .max(100, { message: "La provincia deve essere meno di 100 caratteri" })
    .optional(),
  postalCode: z.string()
    .trim()
    .max(20, { message: "Il CAP deve essere meno di 20 caratteri" })
    .optional(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Parse and validate input
    const rawBody = await req.json()
    const validationResult = BusinessRegistrationSchema.safeParse(rawBody)
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      console.error('Validation error:', validationResult.error.errors)
      return new Response(
        JSON.stringify({ 
          error: firstError.message,
          field: firstError.path.join('.')
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

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
    } = validationResult.data

    console.log('Registration request validated for:', applicantEmail)

    // 1. Create user account with Admin Client (bypasses email confirmation requirement)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: applicantEmail,
      password: password,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        name: `${firstName} ${lastName}`,
        role: applicantRole || 'owner'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      throw new Error(`Auth error: ${authError.message}`)
    }
    if (!authData.user) {
      throw new Error("Failed to create user account")
    }

    const userId = authData.user.id
    const fullAddress = `${street}, ${city}, ${country}${postalCode ? ', ' + postalCode : ''}${province ? ', ' + province : ''}`

    console.log('User created:', userId)

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
        is_active: true,
        is_verified: true,
        verification_status: 'approved'
      })
      .select()
      .single()

    if (restaurantError) {
      console.error('Restaurant error:', restaurantError)
      throw new Error(`Restaurant error: ${restaurantError.message}`)
    }
    if (!restaurantData) {
      throw new Error("Failed to create restaurant")
    }

    console.log('Restaurant created:', restaurantData.id)

    // 3. Create business role using service role (bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('business_roles')
      .insert({
        user_id: userId,
        restaurant_id: restaurantData.id,
        role: 'owner'
      })

    if (roleError) {
      console.error('Role error:', roleError)
      throw new Error(`Role error: ${roleError.message}`)
    }

    console.log('Business registration complete for:', applicantEmail)

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
