// Supabase Edge Function — Sync kampanii z Meta Ads API
// Deploy: supabase functions deploy sync-meta-campaigns
// Uruchamiane: manualnie lub przez cron (co 6h)
// URL: https://pqowmftxvjudbsqeavhs.supabase.co/functions/v1/sync-meta-campaigns

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Opcjonalnie: ogranicz do konkretnej agencji
  const url = new URL(req.url);
  const agencyId = url.searchParams.get("agency_id");

  let query = supabase
    .from("agencies")
    .select("id, meta_access_token, meta_ad_account_id")
    .not("meta_access_token", "is", null)
    .not("meta_ad_account_id", "is", null)
    .eq("status", "active");

  if (agencyId) query = query.eq("id", agencyId);

  const { data: agencies, error } = await query;
  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  const results = [];

  for (const agency of agencies || []) {
    try {
      const count = await syncAgency(agency);
      results.push({ agency_id: agency.id, synced: count });
    } catch (err: any) {
      results.push({ agency_id: agency.id, error: err.message });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function syncAgency(agency: { id: string; meta_access_token: string; meta_ad_account_id: string }) {
  // Pobierz kampanie z Meta
  const url = `https://graph.facebook.com/v19.0/act_${agency.meta_ad_account_id}/campaigns?fields=id,name,status,daily_budget,start_time,stop_time&access_token=${agency.meta_access_token}&limit=100`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);

  const campaigns = data.data || [];

  // Pobierz klientów agencji (pierwszego jako default dla nowych kampanii)
  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("agency_id", agency.id)
    .eq("status", "active")
    .limit(1);

  const defaultClientId = clients?.[0]?.id;
  if (!defaultClientId) return 0;

  let synced = 0;

  for (const camp of campaigns) {
    const { error } = await supabase.from("campaigns").upsert({
      agency_id:   agency.id,
      client_id:   defaultClientId,
      platform:    "meta",
      name:        camp.name,
      status:      camp.status?.toLowerCase() === "active" ? "active" : "paused",
      budget_daily: camp.daily_budget ? camp.daily_budget / 100 : null, // Meta w centach
      start_date:  camp.start_time?.split("T")[0] || null,
      end_date:    camp.stop_time?.split("T")[0] || null,
      external_id: camp.id,
    }, { onConflict: "external_id", ignoreDuplicates: false });

    if (!error) synced++;
  }

  // Sync statystyk (ostatnie 30 dni)
  await syncStats(agency);

  return synced;
}

async function syncStats(agency: { id: string; meta_access_token: string; meta_ad_account_id: string }) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const until = new Date().toISOString().split("T")[0];

  const url = `https://graph.facebook.com/v19.0/act_${agency.meta_ad_account_id}/insights?fields=campaign_id,impressions,clicks,spend,actions,cpm,ctr&time_increment=1&time_range={"since":"${since}","until":"${until}"}&access_token=${agency.meta_access_token}&limit=500`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error || !data.data) return;

  for (const row of data.data) {
    const leads = row.actions?.find((a: any) => a.action_type === "lead")?.value || 0;
    const spend = parseFloat(row.spend || 0);
    const leadsNum = parseInt(leads);

    // Znajdź campaign_id w naszej bazie
    const { data: camp } = await supabase
      .from("campaigns")
      .select("id")
      .eq("external_id", row.campaign_id)
      .single();

    if (!camp) continue;

    await supabase.from("campaign_stats").upsert({
      campaign_id: camp.id,
      date:        row.date_start,
      impressions: parseInt(row.impressions || 0),
      clicks:      parseInt(row.clicks || 0),
      spend:       spend,
      leads:       leadsNum,
      cpl:         leadsNum > 0 ? spend / leadsNum : null,
      cpm:         parseFloat(row.cpm || 0),
      ctr:         parseFloat(row.ctr || 0),
    }, { onConflict: "campaign_id,date" });
  }
}
