-- HARDGAIN PANEL — full bootstrap for a fresh Supabase project
-- Run this file in Supabase SQL Editor when the project has no app schema yet.
-- It combines:
-- 01_tables.sql
-- 02_rls.sql
-- 03_auth_trigger.sql
-- 04_stripe_webhook.sql

-- ══════════════════════════════════════════════════════════════════
-- 01_tables.sql
-- ══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE agencies (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 text NOT NULL,
  logo_url             text,
  primary_color        text DEFAULT '#f97316',
  domain               text,
  plan                 text DEFAULT 'starter' CHECK (plan IN ('starter','pro','agency')),
  stripe_sub_id        text,
  stripe_customer_id   text,
  meta_access_token    text,
  meta_business_id     text,
  meta_ad_account_id   text,
  google_ads_token     text,
  google_customer_id   text,
  infakt_api_key       text,
  status               text DEFAULT 'active' CHECK (status IN ('active','suspended','cancelled')),
  onboarding_completed boolean DEFAULT false,
  created_at           timestamptz DEFAULT now()
);

CREATE TABLE users (
  id         uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email      text NOT NULL,
  name       text,
  avatar_url text,
  role       text NOT NULL CHECK (role IN ('superadmin','agency_owner','client')),
  agency_id  uuid REFERENCES agencies ON DELETE CASCADE,
  client_id  uuid,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

CREATE TABLE clients (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         uuid REFERENCES agencies NOT NULL,
  name              text NOT NULL,
  email             text,
  phone             text,
  logo_url          text,
  industry          text DEFAULT 'fitness' CHECK (industry IN ('fitness','dental','ecommerce','local','b2b')),
  meta_account_id   text,
  google_account_id text,
  status            text DEFAULT 'active' CHECK (status IN ('active','trial','offboarded')),
  created_at        timestamptz DEFAULT now(),
  onboarded_at      timestamptz,
  offboarded_at     timestamptz
);

ALTER TABLE users ADD CONSTRAINT users_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients ON DELETE SET NULL;

CREATE TABLE campaigns (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    uuid REFERENCES clients NOT NULL,
  agency_id    uuid REFERENCES agencies NOT NULL,
  platform     text NOT NULL CHECK (platform IN ('meta','google','tiktok')),
  name         text NOT NULL,
  status       text CHECK (status IN ('active','paused','stopped')),
  budget_daily numeric,
  start_date   date,
  end_date     date,
  external_id  text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE campaign_stats (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id   uuid REFERENCES campaigns NOT NULL,
  date          date NOT NULL,
  impressions   integer DEFAULT 0,
  clicks        integer DEFAULT 0,
  spend         numeric DEFAULT 0,
  leads         integer DEFAULT 0,
  cpl           numeric,
  conversions   integer DEFAULT 0,
  cpm           numeric,
  ctr           numeric,
  UNIQUE(campaign_id, date)
);

CREATE TABLE leads (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    uuid REFERENCES clients NOT NULL,
  campaign_id  uuid REFERENCES campaigns,
  agency_id    uuid REFERENCES agencies NOT NULL,
  name         text,
  phone        text,
  email        text,
  answers      jsonb DEFAULT '{}',
  source       text DEFAULT 'meta' CHECK (source IN ('meta','google','manual','tiktok')),
  status       text DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed_won','closed_lost')),
  hot_until    timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE creatives (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     uuid REFERENCES clients NOT NULL,
  agency_id     uuid REFERENCES agencies NOT NULL,
  name          text,
  type          text CHECK (type IN ('image','video','banner')),
  file_url      text,
  thumbnail_url text,
  status        text DEFAULT 'draft' CHECK (status IN ('draft','review','approved','revision','rejected')),
  client_note   text,
  meta_ad_id    text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE messages (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id  uuid REFERENCES agencies NOT NULL,
  client_id  uuid REFERENCES clients NOT NULL,
  sender_id  uuid REFERENCES users NOT NULL,
  content    text NOT NULL,
  read_at    timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tickets (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   uuid REFERENCES clients NOT NULL,
  agency_id   uuid REFERENCES agencies NOT NULL,
  title       text NOT NULL,
  description text,
  priority    text DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status      text DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  resolved_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE invoices (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id    uuid REFERENCES agencies NOT NULL,
  client_id    uuid REFERENCES clients,
  amount       numeric NOT NULL,
  status       text DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue')),
  infakt_id    text,
  pdf_url      text,
  period_start date,
  period_end   date,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE nps_surveys (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     uuid REFERENCES clients NOT NULL,
  agency_id     uuid REFERENCES agencies NOT NULL,
  trigger_type  text NOT NULL CHECK (trigger_type IN ('30d','90d','offboarding')),
  score         integer CHECK (score BETWEEN 1 AND 10),
  comment       text,
  token         text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  sent_at       timestamptz DEFAULT now(),
  responded_at  timestamptz
);

CREATE TABLE ai_threads (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id  uuid REFERENCES agencies NOT NULL,
  client_id  uuid REFERENCES clients,
  mode       text NOT NULL CHECK (mode IN ('agency_analytics','client_support')),
  messages   jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE onboarding_steps (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id    uuid REFERENCES agencies NOT NULL,
  step         text NOT NULL CHECK (step IN ('logo','meta_oauth','google_oauth','first_client')),
  required     boolean DEFAULT true,
  completed_at timestamptz,
  UNIQUE(agency_id, step)
);

CREATE TABLE calendar_events (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id  uuid REFERENCES agencies NOT NULL,
  client_id  uuid REFERENCES clients,
  title      text NOT NULL,
  date       date NOT NULL,
  time       text,
  type       text CHECK (type IN ('call','meeting','onboarding','report')),
  duration   integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_leads_agency_id     ON leads(agency_id);
CREATE INDEX idx_leads_client_id     ON leads(client_id);
CREATE INDEX idx_leads_created_at    ON leads(created_at DESC);
CREATE INDEX idx_leads_status        ON leads(status);
CREATE INDEX idx_campaigns_agency    ON campaigns(agency_id);
CREATE INDEX idx_campaigns_client    ON campaigns(client_id);
CREATE INDEX idx_campaign_stats_date ON campaign_stats(date DESC);
CREATE INDEX idx_messages_client     ON messages(client_id);
CREATE INDEX idx_tickets_agency      ON tickets(agency_id);
CREATE INDEX idx_users_agency        ON users(agency_id);
CREATE INDEX idx_clients_agency      ON clients(agency_id);

-- ══════════════════════════════════════════════════════════════════
-- 02_rls.sql
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auth_agency_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT agency_id FROM users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth_client_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT client_id FROM users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

ALTER TABLE agencies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_threads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin widzi wszystko" ON agencies
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoje dane" ON agencies
  FOR SELECT USING (id = auth_agency_id());

CREATE POLICY "Agencja edytuje swoje dane" ON agencies
  FOR UPDATE USING (id = auth_agency_id());

CREATE POLICY "Superadmin widzi wszystkich" ON users
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoich użytkowników" ON users
  FOR SELECT USING (agency_id = auth_agency_id());

CREATE POLICY "Użytkownik widzi swój profil" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Użytkownik edytuje swój profil" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Superadmin wszystkie clients" ON clients
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoich klientów" ON clients
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swój rekord" ON clients
  FOR SELECT USING (id = auth_client_id());

CREATE POLICY "Superadmin wszystkie kampanie" ON campaigns
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoje kampanie" ON campaigns
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje kampanie" ON campaigns
  FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY "Agencja widzi statystyki swoich kampanii" ON campaign_stats
  FOR ALL USING (
    campaign_id IN (SELECT id FROM campaigns WHERE agency_id = auth_agency_id())
  );

CREATE POLICY "Klient widzi statystyki swoich kampanii" ON campaign_stats
  FOR SELECT USING (
    campaign_id IN (SELECT id FROM campaigns WHERE client_id = auth_client_id())
  );

CREATE POLICY "Superadmin wszystkie leady" ON leads
  FOR ALL USING (auth_role() = 'superadmin');

CREATE POLICY "Agencja widzi swoje leady" ON leads
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje leady" ON leads
  FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY "Agencja widzi kreacje" ON creatives
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje kreacje" ON creatives
  FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY "Klient aktualizuje status kreacji" ON creatives
  FOR UPDATE USING (client_id = auth_client_id())
  WITH CHECK (status IN ('approved','revision'));

CREATE POLICY "Agencja widzi wiadomości" ON messages
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje wiadomości" ON messages
  FOR ALL USING (client_id = auth_client_id());

CREATE POLICY "Agencja widzi tickety" ON tickets
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje tickety" ON tickets
  FOR ALL USING (client_id = auth_client_id());

CREATE POLICY "Agencja widzi faktury" ON invoices
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Klient widzi swoje faktury" ON invoices
  FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY "Agencja widzi NPS" ON nps_surveys
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Publiczny dostęp przez token" ON nps_surveys
  FOR SELECT USING (true);

CREATE POLICY "Klient odpowiada na NPS" ON nps_surveys
  FOR UPDATE USING (client_id = auth_client_id())
  WITH CHECK (responded_at IS NOT NULL);

CREATE POLICY "Agencja widzi swoje wątki AI" ON ai_threads
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Agencja zarządza onboardingiem" ON onboarding_steps
  FOR ALL USING (agency_id = auth_agency_id());

CREATE POLICY "Agencja widzi swój kalendarz" ON calendar_events
  FOR ALL USING (agency_id = auth_agency_id());

-- ══════════════════════════════════════════════════════════════════
-- 03_auth_trigger.sql
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, agency_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agency_owner'),
    (NEW.raw_user_meta_data->>'agency_id')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION handle_user_login()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users SET last_login = now() WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

INSERT INTO storage.buckets (id, name, public) VALUES ('agency-assets', 'agency-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('client-assets', 'client-assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Agencja uploaduje do swoich assetów" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'agency-assets' AND
    auth_role() IN ('agency_owner', 'superadmin')
  );

CREATE POLICY "Publiczny odczyt agency-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'agency-assets');

CREATE POLICY "Agencja zarządza client-assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'client-assets' AND
    auth_role() IN ('agency_owner', 'superadmin')
  );

-- ══════════════════════════════════════════════════════════════════
-- 04_stripe_webhook.sql
-- ══════════════════════════════════════════════════════════════════

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

  INSERT INTO onboarding_steps (agency_id, step, required) VALUES
    (p_agency_id, 'logo',         true),
    (p_agency_id, 'meta_oauth',   true),
    (p_agency_id, 'first_client', true)
  ON CONFLICT (agency_id, step) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION cancel_agency_subscription(p_stripe_sub_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE agencies SET status = 'cancelled'
  WHERE stripe_sub_id = p_stripe_sub_id;
END;
$$;
