import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');
  }
  return stripePromise;
}

/* ─── PLANY ─────────────────────────────────────────────────────── */

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 199,
    priceId: process.env.REACT_APP_STRIPE_PRICE_STARTER,
    limits: { clients: 5 },
    features: ['Do 5 klientów', 'Panel klienta', 'Meta Ads sync', 'Leady real-time'],
  },
  pro: {
    name: 'Pro',
    price: 399,
    priceId: process.env.REACT_APP_STRIPE_PRICE_PRO,
    limits: { clients: 15 },
    features: ['Do 15 klientów', 'Google Ads', 'AI Asystent', 'Raporty PDF'],
  },
  agency: {
    name: 'Agency',
    price: 699,
    priceId: process.env.REACT_APP_STRIPE_PRICE_AGENCY,
    limits: { clients: Infinity },
    features: ['Nielimitowani klienci', 'White-label', 'Tworzenie kampanii API', 'inFakt faktury'],
  },
};

/* ─── CHECKOUT ──────────────────────────────────────────────────── */

export async function redirectToCheckout(planKey, agencyId, email) {
  const stripe = await getStripe();
  const plan = PLANS[planKey];
  if (!plan?.priceId) {
    throw new Error(`Brak priceId dla planu: ${planKey}`);
  }

  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: plan.priceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/?checkout=success&agency=${agencyId}`,
    cancelUrl: `${window.location.origin}/?checkout=cancelled`,
    customerEmail: email,
    clientReferenceId: agencyId,
  });

  if (error) throw error;
}
