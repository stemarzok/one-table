import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Optionally accept a Checkout Session ID from the frontend to ensure
    // we read the latest subscription just created after checkout
    let sessionId: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        sessionId = body?.sessionId ?? null;
        logStep("Session ID from body", { sessionId });
      } catch {
        // Ignore JSON parse errors and fallback to email-based lookup
        logStep("No JSON body or invalid JSON");
      }
    }

    let customerId: string | null = null;
    let activeSub: any = null;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });

      if (session.subscription) {
        activeSub = session.subscription as any;
        customerId = (activeSub.customer as string) || null;
        logStep("Active subscription from session", {
          subscriptionId: activeSub.id,
          status: activeSub.status,
        });
      } else {
        logStep("No subscription found on session, will fallback to email lookup");
      }
    }

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No customer found");
        return new Response(JSON.stringify({ 
          subscribed: false,
          inTrial: false 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      customerId = customers.data[0].id;
      logStep("Customer found", { customerId });
    }

    if (!activeSub) {
      // Check for active or trialing subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });

      activeSub = subscriptions.data.find(
        (sub: any) => sub.status === "active" || sub.status === "trialing"
      );
    }

    if (!activeSub) {
      logStep("No active subscription");
      
      // Update local subscription table
      await supabaseClient
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ 
        subscribed: false,
        inTrial: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const isTrialing = activeSub.status === "trialing";
    
    // Safely parse trial_end - Stripe returns null if no trial
    let trialEnd: Date | null = null;
    if (activeSub.trial_end && typeof activeSub.trial_end === 'number') {
      trialEnd = new Date(activeSub.trial_end * 1000);
    }
    
    const currentPeriodEnd = new Date(activeSub.current_period_end * 1000);
    const priceId = activeSub.items.data[0].price.id;
    
    // Determine plan type based on price
    let planType = "base";
    let billingPeriod = "monthly";
    
    if (priceId === "price_1SX3euQuOzpnYfR6YW0yjYmD") {
      planType = "base";
      billingPeriod = "monthly";
    } else if (priceId === "price_1SX3fGQuOzpnYfR6O6XnEAC4") {
      planType = "base";
      billingPeriod = "yearly";
    } else if (priceId === "price_1SX3fRQuOzpnYfR6h6iH18TY") {
      planType = "pro";
      billingPeriod = "monthly";
    } else if (priceId === "price_1SX3fbQuOzpnYfR6b39kAGmY") {
      planType = "pro";
      billingPeriod = "yearly";
    }

    logStep("Active subscription found", { 
      subscriptionId: activeSub.id,
      status: activeSub.status,
      planType,
      billingPeriod,
      isTrialing 
    });

    // Update or insert subscription in database
    const { error: upsertError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: activeSub.id,
        plan_type: planType,
        billing_period: billingPeriod,
        status: activeSub.status,
        trial_end: trialEnd?.toISOString() || null,
        current_period_start: new Date(activeSub.current_period_start * 1000).toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        cancel_at_period_end: activeSub.cancel_at_period_end,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      logStep("Error updating subscription", { error: upsertError });
    }

    const trialDaysRemaining = isTrialing && trialEnd 
      ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return new Response(JSON.stringify({
      subscribed: true,
      inTrial: isTrialing,
      trialDaysRemaining,
      planType,
      billingPeriod,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: activeSub.cancel_at_period_end
    }), {
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
