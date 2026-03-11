-- ══════════════════════════════════════════════════════════════════
-- HARDGAIN PANEL — Auth trigger + superadmin setup
-- Wykonaj po 02_rls.sql
-- ══════════════════════════════════════════════════════════════════

-- ─── TRIGGER: po rejestracji → wstaw do users ─────────────────────
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

-- ─── TRIGGER: aktualizuj last_login ───────────────────────────────
CREATE OR REPLACE FUNCTION handle_user_login()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users SET last_login = now() WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- ─── SUPERADMIN: Jan (jan@hardgain.pl) ───────────────────────────
-- WAŻNE: Najpierw zarejestruj Jana przez Supabase Auth (Dashboard → Authentication → Users → Add user)
-- Następnie uruchom poniższe, wstawiając jego UUID:

-- Przykład (podmień UUID na rzeczywiste ID z Auth):
-- INSERT INTO users (id, email, name, role) VALUES (
--   'UUID-JANA-Z-AUTH',
--   'jan@hardgain.pl',
--   'Jan',
--   'superadmin'
-- ) ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- ─── STORAGE BUCKETS ──────────────────────────────────────────────
-- Wykonaj w Supabase Dashboard → Storage → New bucket:
-- 1. "agency-assets"  → Public: true  (logo agencji, kreacje)
-- 2. "client-assets"  → Public: false (prywatne pliki klientów)

-- Polityki storage dla agency-assets:
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
