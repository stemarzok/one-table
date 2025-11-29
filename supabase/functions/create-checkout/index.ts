import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId } = await req.json();
    if (!priceId) throw new Error("Price ID is required");
    logStep("Price ID received", { priceId });

    // Fetch user business data for EU invoicing
    const { data: restaurant } = await supabaseClient
      .from('restaurants')
      .select('business_name, legal_representative, business_registration_number, address, city')
      .eq('owner_id', user.id)
      .maybeSingle();

    logStep("Restaurant data fetched", { hasRestaurant: !!restaurant });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
      
      // Update customer with business data if available
      if (restaurant) {
        await stripe.customers.update(customerId, {
          name: restaurant.legal_representative || restaurant.business_name,
          metadata: {
            business_name: restaurant.business_name || '',
            vat_number: restaurant.business_registration_number || '',
            legal_representative: restaurant.legal_representative || '',
          },
          address: {
            line1: restaurant.address || '',
            city: restaurant.city || '',
            country: 'IT',
          }
        });
        logStep("Customer updated with business data");
      }
    } else {
      logStep("Creating new customer with business data");
    }

    // Prepare customer details for checkout
    const customerDetails: any = {
      email: user.email,
    };

    if (restaurant) {
      customerDetails.name = restaurant.legal_representative || restaurant.business_name;
      customerDetails.address = {
        line1: restaurant.address || '',
        city: restaurant.city || '',
        country: 'IT',
      };
    }

    // Create checkout session with trial and EU invoicing data
    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      customer_creation: customerId ? undefined : 'always',
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      metadata: {
        user_id: user.id,
        price_id: priceId,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: user.id,
          price_id: priceId,
          business_name: restaurant?.business_name || '',
          vat_number: restaurant?.business_registration_number || '',
          legal_representative: restaurant?.legal_representative || '',
        }
      },
      customer_update: customerId ? {
        address: 'auto',
        name: 'auto',
      } : undefined,
      tax_id_collection: {
        enabled: true,
      },
      success_url: `${origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
