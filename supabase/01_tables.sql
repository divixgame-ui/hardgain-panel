-- ══════════════════════════════════════════════════════════════════
-- HARDGAIN PANEL — Schemat bazy danych
-- Wykonaj w Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- Włącz UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── AGENCJE ──────────────────────────────────────────────────────
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

-- ─── UŻYTKOWNICY ──────────────────────────────────────────────────
CREATE TABLE users (
  id         uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email      text NOT NULL,
  name       text,
  avatar_url text,
  role       text NOT NULL CHECK (role IN ('superadmin','agency_owner','client')),
  agency_id  uuid REFERENCES agencies ON DELETE CASCADE,
  client_id  uuid,                        -- wypełniane po stworzeniu clients
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- ─── KLIENCI AGENCJI ──────────────────────────────────────────────
CREATE TABLE clients (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id        uuid REFERENCES agencies NOT NULL,
  name             text NOT NULL,
  email            text,
  phone            text,
  logo_url         text,
  industry         text DEFAULT 'fitness' CHECK (industry IN ('fitness','dental','ecommerce','local','b2b')),
  meta_account_id  text,
  google_account_id text,
  status           text DEFAULT 'active' CHECK (status IN ('active','trial','offboarded')),
  created_at       timestamptz DEFAULT now(),
  onboarded_at     timestamptz,
  offboarded_at    timestamptz
);

-- FK users → clients (po stworzeniu clients)
ALTER TABLE users ADD CONSTRAINT users_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients ON DELETE SET NULL;

-- ─── KAMPANIE ─────────────────────────────────────────────────────
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

-- ─── STATYSTYKI KAMPANII ──────────────────────────────────────────
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

-- ─── LEADY ────────────────────────────────────────────────────────
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

-- ─── KREACJE ──────────────────────────────────────────────────────
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

-- ─── WIADOMOŚCI (CHAT) ────────────────────────────────────────────
CREATE TABLE messages (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id  uuid REFERENCES agencies NOT NULL,
  client_id  uuid REFERENCES clients NOT NULL,
  sender_id  uuid REFERENCES users NOT NULL,
  content    text NOT NULL,
  read_at    timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── ZGŁOSZENIA (TICKETY) ─────────────────────────────────────────
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

-- ─── FAKTURY ──────────────────────────────────────────────────────
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

-- ─── NPS SURVEYS ──────────────────────────────────────────────────
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

-- ─── AI WĄTKI ─────────────────────────────────────────────────────
CREATE TABLE ai_threads (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id  uuid REFERENCES agencies NOT NULL,
  client_id  uuid REFERENCES clients,
  mode       text NOT NULL CHECK (mode IN ('agency_analytics','client_support')),
  messages   jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── ONBOARDING STEPS ─────────────────────────────────────────────
CREATE TABLE onboarding_steps (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id    uuid REFERENCES agencies NOT NULL,
  step         text NOT NULL CHECK (step IN ('logo','meta_oauth','google_oauth','first_client')),
  required     boolean DEFAULT true,
  completed_at timestamptz,
  UNIQUE(agency_id, step)
);

-- ─── CALENDAR EVENTS ──────────────────────────────────────────────
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

-- ─── INDEKSY ──────────────────────────────────────────────────────
CREATE INDEX idx_leads_agency_id    ON leads(agency_id);
CREATE INDEX idx_leads_client_id    ON leads(client_id);
CREATE INDEX idx_leads_created_at   ON leads(created_at DESC);
CREATE INDEX idx_leads_status       ON leads(status);
CREATE INDEX idx_campaigns_agency   ON campaigns(agency_id);
CREATE INDEX idx_campaigns_client   ON campaigns(client_id);
CREATE INDEX idx_campaign_stats_date ON campaign_stats(date DESC);
CREATE INDEX idx_messages_client    ON messages(client_id);
CREATE INDEX idx_tickets_agency     ON tickets(agency_id);
CREATE INDEX idx_users_agency       ON users(agency_id);
CREATE INDEX idx_clients_agency     ON clients(agency_id);
