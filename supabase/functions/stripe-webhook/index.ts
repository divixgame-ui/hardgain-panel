// Supabase Edge Function — Stripe Webhook
// Deploy: supabase functions deploy stripe-webhook
// Ustaw w Stripe Dashboard: https://dashboard.stripe.com/webhooks
// URL: https://pqowmftxvjudbsqeavhs.supabase.co/functions/v1/stripe-webhook
// Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const PLAN_MAP: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_STARTER") || ""]: "starter",
  [Deno.env.get("STRIPE_PRICE_PRO") || ""]: "pro",
  [Deno.env.get("STRIPE_PRICE_AGENCY") || ""]: "agency",
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const agencyId = session.client_reference_id;
        if (!agencyId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PLAN_MAP[priceId] || "starter";

        await supabase.rpc("activate_agency_subscription", {
          p_agency_id: agencyId,
          p_stripe_sub_id: subscription.id,
          p_stripe_cust_id: session.customer as string,
          p_plan: plan,
        });

        console.log(`✅ Agencja ${agencyId} aktywowana — plan: ${plan}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.rpc("cancel_agency_subscription", {
          p_stripe_sub_id: sub.id,
        });
        console.log(`❌ Subskrypcja ${sub.id} anulowana`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;
        const plan = PLAN_MAP[priceId] || "starter";
        await supabase
          .from("agencies")
          .update({ plan, stripe_sub_id: sub.id })
          .eq("stripe_sub_id", sub.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from("agencies")
          .update({ status: "suspended" })
          .eq("stripe_customer_id", invoice.customer as string);
        console.log(`⚠️ Płatność nieudana — klient: ${invoice.customer}`);
        break;
      }
    }
  } catch (err) {
    console.error("Handler error:", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
