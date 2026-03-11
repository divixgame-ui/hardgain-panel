// Supabase Edge Function — Meta Lead Ads Webhook
// Deploy: supabase functions deploy meta-webhook
// URL: https://pqowmftxvjudbsqeavhs.supabase.co/functions/v1/meta-webhook
// Ustaw w Meta Business Manager → webhooks → leadgen

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN") || "hardgain-meta-verify";

serve(async (req) => {
  const url = new URL(req.url);

  // ── Weryfikacja webhooka przez Meta ──────────────────────────────
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // ── Odbieranie leadów ─────────────────────────────────────────────
  if (req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const entries = body?.entry || [];

    for (const entry of entries) {
      const pageId = entry.id;
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== "leadgen") continue;

        const leadgenId = change.value?.leadgen_id;
        const adId = change.value?.ad_id;
        const formId = change.value?.form_id;

        if (!leadgenId) continue;

        try {
          await processLead(leadgenId, adId, formId, pageId);
        } catch (err) {
          console.error("Błąd przetwarzania leada:", err);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
});

async function processLead(leadgenId: string, adId: string, _formId: string, _pageId: string) {
  // Znajdź agencję po meta_ad_account_id (przez kampanię)
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, client_id, agency_id")
    .eq("external_id", adId)
    .single();

  if (!campaign) {
    console.warn(`Brak kampanii dla adId: ${adId}`);
    return;
  }

  // Pobierz dane agencji (token Meta)
  const { data: agency } = await supabase
    .from("agencies")
    .select("meta_access_token")
    .eq("id", campaign.agency_id)
    .single();

  if (!agency?.meta_access_token) {
    console.warn(`Brak tokenu Meta dla agencji: ${campaign.agency_id}`);
    return;
  }

  // Pobierz szczegóły leada z Meta Graph API
  const metaRes = await fetch(
    `https://graph.facebook.com/v19.0/${leadgenId}?fields=id,created_time,field_data&access_token=${agency.meta_access_token}`
  );
  const metaLead = await metaRes.json();

  if (metaLead.error) {
    console.error("Meta API error:", metaLead.error);
    return;
  }

  // Parsuj field_data (formularz Meta)
  const fields: Record<string, string> = {};
  let name = "", phone = "", email = "";

  for (const field of metaLead.field_data || []) {
    const value = field.values?.[0] || "";
    fields[field.name] = value;
    if (field.name === "full_name" || field.name === "name") name = value;
    if (field.name === "phone_number" || field.name === "phone") phone = value;
    if (field.name === "email") email = value;
  }

  // Wstaw lead do bazy
  const { error } = await supabase.from("leads").insert({
    client_id:   campaign.client_id,
    campaign_id: campaign.id,
    agency_id:   campaign.agency_id,
    name:        name || "Nieznany",
    phone:       phone,
    email:       email,
    answers:     fields,
    source:      "meta",
    status:      "new",
    hot_until:   new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +60 minut
  });

  if (error) {
    console.error("Błąd zapisu leada:", error);
  } else {
    console.log(`✅ Lead zapisany: ${name} (${phone})`);
  }
}
