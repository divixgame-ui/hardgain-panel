import { supabase } from "../../lib/supabase";

const CLIENT_COLORS = ["#ff5c1a", "#22d3a0", "#60a5fa", "#f59e0b", "#a78bfa", "#34d399"];
const DAY_MS = 24 * 60 * 60 * 1000;

function applyAgencyScope(query, agencyId) {
  return agencyId ? query.eq("agency_id", agencyId) : query;
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item?.[key] || 0), 0);
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function buildLastDays(count) {
  const today = startOfDay(new Date());
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getTime() - (count - index - 1) * DAY_MS);
    return { key: formatDateKey(date), label: date.toLocaleDateString("pl-PL", { weekday: "short" }) };
  });
}

function buildLastMonths(count) {
  const now = new Date();
  const months = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("pl-PL", { month: "short" }),
    });
  }
  return months;
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function decorateClients(clients) {
  return clients.map((client, index) => ({
    ...client,
    avatar: initials(client.name),
    color: CLIENT_COLORS[index % CLIENT_COLORS.length],
  }));
}

function mapEvents(events, clientsById) {
  return events.map((event) => ({
    ...event,
    clientName: clientsById.get(event.client_id)?.name || "Bez klienta",
  }));
}

function buildCampaignRows(campaigns, statsByCampaign, clientsById) {
  return campaigns.map((campaign) => {
    const stats = statsByCampaign.get(campaign.id) || [];
    const spend = sum(stats, "spend");
    const leads = sum(stats, "leads");
    const conversions = sum(stats, "conversions");
    const cpl = leads > 0 ? spend / leads : 0;

    return {
      ...campaign,
      clientName: clientsById.get(campaign.client_id)?.name || "Bez klienta",
      clientColor: clientsById.get(campaign.client_id)?.color || "var(--accent)",
      spend,
      leads,
      conversions,
      cpl,
      startLabel: campaign.start_date || campaign.created_at?.slice(0, 10) || "—",
    };
  });
}

function buildLeadRows(leads, clientsById, campaignsById) {
  return leads.map((lead) => ({
    ...lead,
    clientName: clientsById.get(lead.client_id)?.name || "Bez klienta",
    clientColor: clientsById.get(lead.client_id)?.color || "var(--accent)",
    campaignName: campaignsById.get(lead.campaign_id)?.name || "Bez kampanii",
    dateLabel: lead.created_at ? new Date(lead.created_at).toLocaleString("pl-PL") : "—",
  }));
}

function buildClientSummaries(clients, campaigns, stats, leads, events) {
  const campaignsByClient = new Map();
  const statsByCampaign = new Map();
  const leadsByClient = new Map();
  const eventsByClient = new Map();
  const dayWindow = buildLastDays(7);

  campaigns.forEach((campaign) => {
    const list = campaignsByClient.get(campaign.client_id) || [];
    list.push(campaign);
    campaignsByClient.set(campaign.client_id, list);
  });

  stats.forEach((row) => {
    const list = statsByCampaign.get(row.campaign_id) || [];
    list.push(row);
    statsByCampaign.set(row.campaign_id, list);
  });

  leads.forEach((lead) => {
    const list = leadsByClient.get(lead.client_id) || [];
    list.push(lead);
    leadsByClient.set(lead.client_id, list);
  });

  events.forEach((event) => {
    const list = eventsByClient.get(event.client_id) || [];
    list.push(event);
    eventsByClient.set(event.client_id, list);
  });

  return clients.map((client) => {
    const clientCampaigns = campaignsByClient.get(client.id) || [];
    const clientCampaignIds = clientCampaigns.map((campaign) => campaign.id);
    const clientStats = clientCampaignIds.flatMap((id) => statsByCampaign.get(id) || []);
    const clientLeads = leadsByClient.get(client.id) || [];
    const clientEvents = eventsByClient.get(client.id) || [];
    const spend = sum(clientStats, "spend");
    const conversions = sum(clientStats, "conversions");
    const leadsCount = clientLeads.length || sum(clientStats, "leads");
    const cpl = leadsCount > 0 ? spend / leadsCount : 0;
    const sevenDay = dayWindow.map((day) => {
      const dayStats = clientStats.filter((row) => row.date === day.key);
      return {
        day: day.label,
        leads: sum(dayStats, "leads"),
        spend: sum(dayStats, "spend"),
      };
    });

    return {
      ...client,
      campaigns: clientCampaigns,
      leads: clientLeads,
      events: clientEvents,
      metrics: {
        spend,
        conversions,
        leads: leadsCount,
        cpl,
        activeCampaigns: clientCampaigns.filter((campaign) => campaign.status === "active").length,
      },
      sevenDay,
    };
  });
}

export function buildAdminSnapshot(raw) {
  const clients = decorateClients(raw.clients || []);
  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const campaigns = raw.campaigns || [];
  const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const stats = raw.campaignStats || [];
  const events = mapEvents(raw.events || [], clientsById);
  const leadRows = buildLeadRows(raw.leads || [], clientsById, campaignsById);
  const campaignRows = buildCampaignRows(campaigns, groupByCampaign(stats), clientsById);
  const clientSummaries = buildClientSummaries(clients, campaigns, stats, leadRows, events);
  const lastDays = buildLastDays(7);
  const lastMonths = buildLastMonths(3);
  const todayKey = formatDateKey(new Date());

  const dayStats = lastDays.map((day) => {
    const matches = stats.filter((row) => row.date === day.key);
    return {
      day: day.label,
      leads: sum(matches, "leads"),
      spend: sum(matches, "spend"),
    };
  });

  const monthStats = lastMonths.map((month) => {
    const matches = stats.filter((row) => String(row.date || "").startsWith(month.key));
    return {
      month: month.label,
      leads: sum(matches, "leads"),
      spend: sum(matches, "spend"),
    };
  });

  const hotLeads = leadRows
    .filter((lead) => lead.hot_until && new Date(lead.hot_until).getTime() > Date.now())
    .sort((a, b) => new Date(a.hot_until) - new Date(b.hot_until));

  return {
    clients: clientSummaries,
    campaigns: campaignRows,
    leads: leadRows,
    events,
    dashboard: {
      totalLeads: leadRows.length,
      totalSpend: sum(stats, "spend"),
      activeCampaigns: campaignRows.filter((campaign) => campaign.status === "active").length,
      totalConversions: sum(stats, "conversions"),
      averageCpl: leadRows.length > 0 ? sum(stats, "spend") / leadRows.length : 0,
      activeClients: clientSummaries.filter((client) => client.status === "active").length,
      todayEvents: events.filter((event) => event.date === todayKey),
      upcomingEvents: [...events]
        .filter((event) => event.date >= todayKey)
        .sort((a, b) => `${a.date}${a.time || ""}`.localeCompare(`${b.date}${b.time || ""}`))
        .slice(0, 4),
      hotLeads,
      dayStats,
      monthStats,
      ranking: [...clientSummaries].sort((a, b) => b.metrics.leads - a.metrics.leads).slice(0, 5),
    },
  };
}

function groupByCampaign(stats) {
  const grouped = new Map();
  stats.forEach((row) => {
    const list = grouped.get(row.campaign_id) || [];
    list.push(row);
    grouped.set(row.campaign_id, list);
  });
  return grouped;
}

export function formatAdminLoadError(error) {
  const rawMessage = error?.message || String(error || "");

  if (rawMessage.includes("schema cache") || rawMessage.includes("Could not find the table")) {
    return "Supabase odpowiada, ale brakuje tabel aplikacji. Uruchom skrypty z katalogu `supabase/` w SQL Editor projektu.";
  }

  if (rawMessage.includes("Failed to fetch")) {
    return "Frontend nie może połączyć się z Supabase. Sprawdź `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` i czy projekt jest dostępny z Vercel.";
  }

  return rawMessage;
}

export async function listAgencyClients(agencyId) {
  let query = supabase.from("clients").select("*").order("created_at", { ascending: false });
  query = applyAgencyScope(query, agencyId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listAgencyCampaigns(agencyId) {
  let query = supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  query = applyAgencyScope(query, agencyId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listAgencyLeads(agencyId) {
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  query = applyAgencyScope(query, agencyId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listCalendarEvents(agencyId) {
  let query = supabase.from("calendar_events").select("*").order("date", { ascending: true });
  query = applyAgencyScope(query, agencyId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createCalendarEvent(payload) {
  const { data, error } = await supabase
    .from("calendar_events")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listCampaignStats(agencyId, campaignIds) {
  if (!campaignIds.length) return [];

  const since = formatDateKey(new Date(Date.now() - 90 * DAY_MS));
  let query = supabase
    .from("campaign_stats")
    .select("*")
    .in("campaign_id", campaignIds)
    .gte("date", since)
    .order("date", { ascending: true });

  if (agencyId) {
    query = query;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function loadAdminDashboard(agencyId) {
  const clients = await listAgencyClients(agencyId);
  const campaigns = await listAgencyCampaigns(agencyId);
  const campaignStats = await listCampaignStats(
    agencyId,
    campaigns.map((campaign) => campaign.id)
  );
  const [leads, events] = await Promise.all([
    listAgencyLeads(agencyId),
    listCalendarEvents(agencyId),
  ]);

  return buildAdminSnapshot({ clients, campaigns, campaignStats, leads, events });
}

export async function getClientDetail(clientId, agencyId) {
  const snapshot = await loadAdminDashboard(agencyId);
  return snapshot.clients.find((client) => client.id === clientId) || null;
}
