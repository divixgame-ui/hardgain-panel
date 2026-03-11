import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Brak zmiennych środowiskowych — tryb demo');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

/* ─── AUTH HELPERS ─────────────────────────────────────────────── */

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/* ─── USER PROFILE ─────────────────────────────────────────────── */

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*, agencies(*), clients(*)')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/* ─── REALTIME LEADS ───────────────────────────────────────────── */

export function subscribeToLeads(agencyId, onInsert) {
  const channelName = agencyId ? `leads-${agencyId}` : 'leads-all';
  const config = { event: 'INSERT', schema: 'public', table: 'leads' };

  if (agencyId) {
    config.filter = `agency_id=eq.${agencyId}`;
  }

  return supabase
    .channel(channelName)
    .on('postgres_changes', config, (payload) => onInsert(payload.new))
    .subscribe();
}
