-- ══════════════════════════════════════════════════════════════════
-- HARDGAIN PANEL — Stripe webhook helper
-- Supabase Edge Function będzie wywoływać te funkcje
-- ══════════════════════════════════════════════════════════════════

-- Funkcja aktywująca agencję po opłacie Stripe
CREATE OR REPLACE FUNCTION activate_agency_subscription(
  p_agency_id       uuid,
  p_stripe_sub_id   text,
  p_stripe_cust_id  text,
  p_plan            text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE agencies SET
    stripe_sub_id      = p_stripe_sub_id,
    stripe_customer_id = p_stripe_cust_id,
    plan               = p_plan,
    status             = 'active'
  WHERE id = p_agency_id;

  -- Stwórz kroki onboardingu
  INSERT INTO onboarding_steps (agency_id, step, required) VALUES
    (p_agency_id, 'logo',         true),
    (p_agency_id, 'meta_oauth',   true),
    (p_agency_id, 'first_client', true)
  ON CONFLICT (agency_id, step) DO NOTHING;
END;
$$;

-- Funkcja anulująca subskrypcję
CREATE OR REPLACE FUNCTION cancel_agency_subscription(p_stripe_sub_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE agencies SET status = 'cancelled'
  WHERE stripe_sub_id = p_stripe_sub_id;
END;
$$;
