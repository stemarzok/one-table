import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    logStep("ERROR: No signature header");
    return new Response(JSON.stringify({ error: "No signature" }), { status: 400 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    logStep("ERROR: Webhook secret not configured");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), { status: 500 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });
        
        // Get customer email
        const customer = await stripe.customers.retrieve(session.customer as string);
        const customerEmail = (customer as any).email;
        
        if (!customerEmail) {
          logStep("ERROR: No customer email found");
          break;
        }

        // Find user by email
        const { data: userData, error: userError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (userError || !userData) {
          logStep("ERROR: User not found", { email: customerEmail, error: userError });
          break;
        }

        const userId = userData.id;
        logStep("User found", { userId, email: customerEmail });

        // If session has subscription, store it
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          const priceId = subscription.items.data[0].price.id;
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

          const { error: upsertError } = await supabaseClient
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              plan_type: planType,
              billing_period: billingPeriod,
              status: subscription.status,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (upsertError) {
            logStep("ERROR: Failed to update subscription", { error: upsertError });
          } else {
            logStep("Subscription created/updated in DB", { userId, subscriptionId: subscription.id });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription event", { type: event.type, subscriptionId: subscription.id });

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as any).email;

        if (!customerEmail) {
          logStep("ERROR: No customer email found");
          break;
        }

        const { data: userData, error: userError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (userError || !userData) {
          logStep("ERROR: User not found", { email: customerEmail });
          break;
        }

        const priceId = subscription.items.data[0].price.id;
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

        const { error: upsertError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userData.id,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            plan_type: planType,
            billing_period: billingPeriod,
            status: subscription.status,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          logStep("ERROR: Failed to update subscription", { error: upsertError });
        } else {
          logStep("Subscription updated in DB", { userId: userData.id, status: subscription.status });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as any).email;

        if (!customerEmail) {
          logStep("ERROR: No customer email found");
          break;
        }

        const { data: userData, error: userError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (userError || !userData) {
          logStep("ERROR: User not found", { email: customerEmail });
          break;
        }

        const { error: deleteError } = await supabaseClient
          .from('subscriptions')
          .delete()
          .eq('user_id', userData.id);

        if (deleteError) {
          logStep("ERROR: Failed to delete subscription", { error: deleteError });
        } else {
          logStep("Subscription deleted from DB", { userId: userData.id });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
});
