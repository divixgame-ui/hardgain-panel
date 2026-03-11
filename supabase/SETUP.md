# Hardgain Panel — Setup Supabase

## KROK 1 — Tabele i RLS (Supabase Dashboard)

1. Wejdź na https://supabase.com/dashboard/project/pqowmftxvjudbsqeavhs
2. SQL Editor → New query
3. Wklej i uruchom kolejno:
   - `01_tables.sql`
   - `02_rls.sql`
   - `03_auth_trigger.sql`
   - `04_stripe_webhook.sql`

## KROK 2 — Stwórz konto superadmin (Jan)

1. Supabase Dashboard → Authentication → Users → Add user
2. Email: jan@hardgain.pl, hasło: (silne)
3. Skopiuj UUID użytkownika
4. SQL Editor → uruchom:
```sql
INSERT INTO users (id, email, name, role)
VALUES ('WKLEJ-UUID-JANA', 'jan@hardgain.pl', 'Jan', 'superadmin')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';
```

## KROK 3 — Deploy Edge Functions

Zainstaluj Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase link --project-ref pqowmftxvjudbsqeavhs
```

Ustaw sekrety:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_STARTER=price_xxx
supabase secrets set STRIPE_PRICE_PRO=price_xxx
supabase secrets set STRIPE_PRICE_AGENCY=price_xxx
supabase secrets set META_APP_ID=xxx
supabase secrets set META_APP_SECRET=xxx
supabase secrets set META_VERIFY_TOKEN=hardgain-meta-verify
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx
supabase secrets set RESEND_API_KEY=re_xxx
```

Deploy functions:
```bash
supabase functions deploy stripe-webhook
supabase functions deploy meta-webhook
supabase functions deploy sync-meta-campaigns
```

## KROK 4 — Stripe Webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://pqowmftxvjudbsqeavhs.supabase.co/functions/v1/stripe-webhook`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
4. Skopiuj "Signing secret" → wklej jako STRIPE_WEBHOOK_SECRET

## KROK 5 — Meta Webhook

1. Meta Business Manager → Webhooks → Add webhook
2. URL: `https://pqowmftxvjudbsqeavhs.supabase.co/functions/v1/meta-webhook`
3. Verify token: `hardgain-meta-verify`
4. Subscribe to: `leadgen`

## KROK 6 — Vercel Env Variables

W Vercel Dashboard → Settings → Environment Variables dodaj:
```
REACT_APP_SUPABASE_URL=https://pqowmftxvjudbsqeavhs.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_6Sk2EZ9TnvO0SY9eNdpiWw_zLip6MNa
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxx
REACT_APP_STRIPE_PRICE_STARTER=price_xxx
REACT_APP_STRIPE_PRICE_PRO=price_xxx
REACT_APP_STRIPE_PRICE_AGENCY=price_xxx
REACT_APP_META_APP_ID=xxx
```
