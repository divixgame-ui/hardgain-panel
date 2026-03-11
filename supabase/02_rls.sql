-- ══════════════════════════════════════════════════════════════════
-- HARDGAIN PANEL — Row Level Security (RLS)
-- Wykonaj po 01_tables.sql
-- ══════════════════════════════════════════════════════════════════

-- ─── HELPER FUNCTIONS ─────────────────────────────────────────────

-- Zwraca agency_id aktualnie zalogowanego użytkownika
CREATE OR REPLACE FUNCTION auth_agency_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT agency_id FROM users WHERE id = auth.uid()
$$;

-- Zwraca client_id aktualnie zalogowanego użytkownika
CREATE OR REPLACE FUNCTION auth_client_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT client_id FROM users WHERE id = auth.uid()
$$;

-- Zwraca rolę aktualnie zalogowanego użytkownika
CREATE OR REPLACE FUNCTION auth_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- ─── WŁĄCZ RLS NA WSZYSTKICH TABELACH ─────────────────────────────

ALTER TABLE agencies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns       ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_threads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- ─── AGENCIES ─────────────────────────────────────────────────────

CREATE POLICY "Superadmin widzi wszystko" ON agencies
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoje dane" ON agencies
  FOR SELECT USING (id = auth_agency_id());

CREATE POLICY "Agencja edytuje swoje dane" ON agencies
  FOR UPDATE USING (id = auth_agency_id());

-- ─── USERS ────────────────────────────────────────────────────────

CREATE POLICY "Superadmin widzi wszystkich" ON users
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoich użytkowników" ON users
  FOR SELECT USING (agency_id = auth_agency_id());

CREATE POLICY "Użytkownik widzi swój profil" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Użytkownik edytuje swój profil" ON users
  FOR UPDATE USING (id = auth.uid());

-- ─── CLIENTS ──────────────────────────────────────────────────────

CREATE POLICY "Superadmin wszystkie clients" ON clients
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoich klientów" ON clients
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swój rekord" ON clients
  FOR SELECT USING (id = auth_client_id());

-- ─── CAMPAIGNS ────────────────────────────────────────────────────

CREATE POLICY "Superadmin wszystkie kampanie" ON campaigns
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoje kampanie" ON campaigns
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje kampanie" ON campaigns
  FOR SELECT USING (client_id = auth_client_id());

-- ─── CAMPAIGN_STATS ───────────────────────────────────────────────

CREATE POLICY "Agencja widzi statystyki swoich kampanii" ON campaign_stats
  FOR ALL USING (
    campaign_id IN (SELECT id FROM campaigns WHERE agency_id = auth_agency_id())
  );

CREATE POLICY "Klient widzi statystyki swoich kampanii" ON campaign_stats
  FOR SELECT USING (
    campaign_id IN (SELECT id FROM campaigns WHERE client_id = auth_client_id())
  );

-- ─── LEADS ────────────────────────────────────────────────────────

CREATE POLICY "Superadmin wszystkie leady" ON leads
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoje leady" ON leads
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje leady" ON leads
  FOR SELECT USING (client_id = auth_client_id());

-- Webhook (service_role) może wstawiać leady bez RLS
-- (service_role bypasses RLS by default)

-- ─── CREATIVES ────────────────────────────────────────────────────

CREATE POLICY "Agencja widzi kreacje" ON creatives
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje kreacje" ON creatives
  FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY "Klient aktualizuje status kreacji" ON creatives
  FOR UPDATE USING (client_id = auth_client_id())
  WITH CHECK (status IN ('approved','revision'));

-- ─── MESSAGES ─────────────────────────────────────────────────────

CREATE POLICY "Agencja widzi wiadomości" ON messages
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje wiadomości" ON messages
  FOR ALL USING (client_id = auth_client_id());

-- ─── TICKETS ──────────────────────────────────────────────────────

CREATE POLICY "Agencja widzi tickety" ON tickets
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje tickety" ON tickets
  FOR ALL USING (client_id = auth_client_id());

-- ─── INVOICES ─────────────────────────────────────────────────────

CREATE POLICY "Agencja widzi faktury" ON invoices
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje faktury" ON invoices
  FOR SELECT USING (client_id = auth_client_id());

-- ─── NPS_SURVEYS ──────────────────────────────────────────────────

CREATE POLICY "Agencja widzi NPS" ON nps_surveys
  FOR ALL USING (agency_id = auth_agency_id());

-- Klient odpowiada na NPS przez token (public, bez auth)
CREATE POLICY "Publiczny dostęp przez token" ON nps_surveys
  FOR SELECT USING (true);  -- filtrowane po tokenie w Edge Function

CREATE POLICY "Klient odpowiada na NPS" ON nps_surveys
  FOR UPDATE USING (client_id = auth_client_id())
  WITH CHECK (responded_at IS NOT NULL);

-- ─── AI_THREADS ───────────────────────────────────────────────────

CREATE POLICY "Agencja widzi swoje wątki AI" ON ai_threads
  FOR ALL USING (agency_id = auth_agency_id());

-- ─── ONBOARDING_STEPS ─────────────────────────────────────────────

CREATE POLICY "Agencja zarządza onboardingiem" ON onboarding_steps
  FOR ALL USING (agency_id = auth_agency_id());

-- ─── CALENDAR_EVENTS ──────────────────────────────────────────────

CREATE POLICY "Agencja widzi swój kalendarz" ON calendar_events
  FOR ALL USING (agency_id = auth_agency_id());
