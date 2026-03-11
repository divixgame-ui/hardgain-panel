import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { subscribeToLeads } from "../../lib/supabase";
import {
  buildAdminSnapshot,
  createCalendarEvent,
  listAgencyCampaigns,
  listAgencyClients,
  listAgencyLeads,
  listCalendarEvents,
  listCampaignStats,
} from "./data";
import {
  fmt,
  HotTimer,
  KPI,
  LeadBadge,
  SectionHeader,
  Sidebar,
  Tabs,
  Toast,
  showLeadToast,
  showToast,
} from "../../app/ui";

const ADMIN_NAV = [
  ["dashboard", "◈", "Dashboard"],
  ["clients", "◉", "Klienci"],
  ["campaigns", "▶", "Kampanie"],
  ["leads", "◎", "Leady"],
  ["calendar", "◷", "Kalendarz"],
];

async function loadAdminRaw(agencyId) {
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

  return { clients, campaigns, campaignStats, leads, events };
}

function useAdminData(user) {
  const agencyId = user.role === "agency_owner" ? user.agency_id : user.agency_id || null;
  const [raw, setRaw] = useState({ clients: [], campaigns: [], campaignStats: [], leads: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const next = await loadAdminRaw(agencyId);
        if (!cancelled) setRaw(next);
      } catch (err) {
        if (!cancelled) setError(err.message || "Nie udało się pobrać danych");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [agencyId]);

  useEffect(() => {
    const channel = subscribeToLeads(agencyId, (lead) => {
      setRaw((current) => {
        if (current.leads.some((item) => item.id === lead.id)) return current;
        return { ...current, leads: [lead, ...current.leads] };
      });

      const clientName =
        raw.clients.find((client) => client.id === lead.client_id)?.name || "Bez klienta";
      showLeadToast({ ...lead, clientName });
    });

    return () => {
      channel?.unsubscribe?.();
    };
  }, [agencyId, raw.clients]);

  return {
    loading,
    error,
    raw,
    snapshot: buildAdminSnapshot(raw),
    setRaw,
    agencyId,
  };
}

function EmptyState({ title, body }) {
  return (
    <div className="card" style={{ padding: 28, textAlign: "center" }}>
      <div style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{body}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function DashboardView({ snapshot, onOpenClient }) {
  const { dashboard } = snapshot;

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Dashboard"
        sub={`${dashboard.activeClients} aktywnych klientów · ${dashboard.todayEvents.length} spotkań dziś`}
      />

      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 20 }}>
        <KPI label="Łączne leady" value={dashboard.totalLeads} icon="👤" />
        <KPI label="Budżet wydany" value={`${fmt(dashboard.totalSpend)} zł`} accent="#F7C59F" icon="💰" />
        <KPI label="Aktywne kampanie" value={dashboard.activeCampaigns} accent="var(--success)" icon="▶" />
        <KPI label="Śr. CPL" value={`${dashboard.averageCpl.toFixed(1)} zł`} accent="#A78BFA" icon="⚡" />
        <KPI label="Konwersje" value={dashboard.totalConversions} accent="#34D399" icon="✓" />
      </div>

      <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <ChartCard title="Leady i wydatki · ostatnie 7 dni">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dashboard.dayStats}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)" />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10 }}
              />
              <Area type="monotone" dataKey="leads" stroke="var(--accent)" strokeWidth={2} fill="url(#leadGradient)" />
              <Area type="monotone" dataKey="spend" stroke="var(--success)" strokeWidth={2} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trend miesięczny">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dashboard.monthStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10 }}
              />
              <Bar dataKey="leads" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="three-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-header">Ranking klientów</div>
          {dashboard.ranking.length === 0 ? (
            <EmptyState title="Brak klientów" body="Dodaj pierwszego klienta, aby zobaczyć ranking." />
          ) : (
            dashboard.ranking.map((client, index) => (
              <div
                key={client.id}
                className="table-row"
                style={{ gridTemplateColumns: "24px 36px 1fr auto", gap: 10, cursor: "pointer" }}
                onClick={() => onOpenClient(client.id)}
              >
                <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>#{index + 1}</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `${client.color}20`,
                    color: client.color,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                >
                  {client.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 12 }}>{client.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 10 }}>{client.industry}</div>
                </div>
                <span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {client.metrics.leads}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-header">Gorące leady</div>
          {dashboard.hotLeads.length === 0 ? (
            <EmptyState title="Brak gorących leadów" body="Nowe leady pojawią się tutaj automatycznie." />
          ) : (
            dashboard.hotLeads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="table-row" style={{ gridTemplateColumns: "1fr auto", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 12 }}>{lead.name || "Nieznany"}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 10 }}>
                    {lead.clientName} · {lead.campaignName}
                  </div>
                </div>
                <HotTimer hotUntil={lead.hot_until} />
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-header">Najbliższe spotkania</div>
          {dashboard.upcomingEvents.length === 0 ? (
            <EmptyState title="Brak spotkań" body="Dodaj pierwsze wydarzenie w kalendarzu." />
          ) : (
            dashboard.upcomingEvents.map((event) => (
              <div key={event.id} className="table-row" style={{ gridTemplateColumns: "1fr auto", gap: 10 }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 12 }}>{event.title}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 10 }}>
                    {event.clientName} · {event.date} {event.time || ""}
                  </div>
                </div>
                <span className="badge badge-neutral">{event.type || "event"}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ClientsView({ clients, onOpenClient }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter((client) => {
    const value = search.toLowerCase();
    return (
      !value ||
      client.name.toLowerCase().includes(value) ||
      (client.email || "").toLowerCase().includes(value) ||
      (client.industry || "").toLowerCase().includes(value)
    );
  });

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Baza klientów" sub={`${clients.length} klientów w panelu`} />
      <div style={{ maxWidth: 340, marginBottom: 18 }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Szukaj po nazwie, emailu, branży..."
        />
      </div>
      <div className="three-col-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {filtered.map((client) => (
          <div
            key={client.id}
            className="card"
            style={{ padding: 18, cursor: "pointer" }}
            onClick={() => onOpenClient(client.id)}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: `${client.color}20`,
                  color: client.color,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
              >
                {client.avatar}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 14 }}>{client.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{client.email || "Brak emaila"}</div>
              </div>
              <span className={`badge ${client.status === "active" ? "badge-success" : "badge-warning"}`}>{client.status}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
              <MetricTile label="Leady" value={client.metrics.leads} color="var(--accent)" />
              <MetricTile label="CPL" value={`${client.metrics.cpl.toFixed(1)} zł`} color="var(--success)" />
              <MetricTile label="Spend" value={`${fmt(client.metrics.spend)} zł`} color="#F7C59F" />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{client.industry || "Branża nieustawiona"}</span>
              <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{client.phone || "Brak telefonu"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricTile({ label, value, color }) {
  return (
    <div style={{ background: "var(--bg-base)", borderRadius: 10, padding: "10px 12px" }}>
      <div className="mono" style={{ color, fontWeight: 700, fontSize: 14 }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function CampaignsView({ campaigns }) {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Kampanie" sub={`${campaigns.filter((campaign) => campaign.status === "active").length} aktywnych`} />
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-header" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 90px 90px 90px 1fr", gap: 10 }}>
          <span>Kampania</span>
          <span>Status</span>
          <span>Leady</span>
          <span>CPL</span>
          <span>Spend</span>
          <span>Klient</span>
        </div>
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="table-row"
            style={{ gridTemplateColumns: "2fr 1fr 90px 90px 90px 1fr", gap: 10 }}
          >
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 12 }}>{campaign.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 10 }}>Od {campaign.startLabel}</div>
            </div>
            <span className={`badge ${campaign.status === "active" ? "badge-success" : "badge-neutral"}`}>
              {campaign.status || "—"}
            </span>
            <span className="mono" style={{ color: "var(--accent)" }}>{campaign.leads}</span>
            <span className="mono" style={{ color: "var(--success)" }}>{campaign.cpl.toFixed(1)} zł</span>
            <span className="mono" style={{ color: "#F7C59F" }}>{fmt(campaign.spend)} zł</span>
            <span style={{ color: campaign.clientColor, fontWeight: 700, fontSize: 11 }}>{campaign.clientName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadsView({ leads }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const filtered = leads.filter((lead) => {
    const value = search.toLowerCase();
    const matchesFilter = filter === "all" || lead.status === filter;
    const matchesSearch =
      !value ||
      (lead.name || "").toLowerCase().includes(value) ||
      (lead.phone || "").includes(search) ||
      (lead.clientName || "").toLowerCase().includes(value) ||
      (lead.campaignName || "").toLowerCase().includes(value);
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Wszystkie leady" sub={`${leads.length} rekordów`} />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Szukaj po nazwie, telefonie, kampanii..."
          style={{ flex: "1 1 240px", minWidth: 200 }}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["all", "new", "contacted", "qualified", "closed_won", "closed_lost"].map((status) => (
            <button
              key={status}
              className={`tab-btn${filter === status ? " active" : ""}`}
              style={{ background: filter === status ? "var(--bg-overlay)" : "transparent", border: "1px solid var(--border)" }}
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "Wszystkie" : status}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((lead) => (
          <div key={lead.id} className="card" style={{ overflow: "hidden" }}>
            <div
              style={{ padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
              onClick={() => setExpanded((current) => (current === lead.id ? null : lead.id))}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: "var(--accent-glow)",
                  color: "var(--accent)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
              >
                {(lead.name || "?").charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 13 }}>{lead.name || "Nieznany"}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
                  {lead.phone || "Brak telefonu"} · {lead.campaignName}
                </div>
              </div>
              <HotTimer hotUntil={lead.hot_until} />
              <span style={{ color: lead.clientColor, fontWeight: 700, fontSize: 11 }}>{lead.clientName}</span>
              <LeadBadge status={lead.status} />
            </div>

            {expanded === lead.id ? (
              <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-base)" }}>
                <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  <LeadDetailCard label="Data" value={lead.dateLabel} />
                  <LeadDetailCard label="Email" value={lead.email || "Brak"} />
                  <LeadDetailCard label="Źródło" value={lead.source || "—"} />
                </div>
                {lead.answers && Object.keys(lead.answers).length ? (
                  <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }} className="detail-grid">
                    {Object.entries(lead.answers).slice(0, 6).map(([key, value]) => (
                      <LeadDetailCard key={key} label={key} value={String(value)} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadDetailCard({ label, value }) {
  return (
    <div style={{ background: "var(--bg-surface)", borderRadius: 10, border: "1px solid var(--border)", padding: "10px 12px" }}>
      <div style={{ color: "var(--text-muted)", fontSize: 10, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function CalendarView({ clients, events, onCreate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    title: "",
    date: "",
    time: "09:00",
    type: "call",
    duration: 30,
  });

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Kalendarz"
        sub={`${events.length} wydarzeń w systemie`}
        btn="+ Dodaj spotkanie"
        onBtn={() => setShowAdd(true)}
      />

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-header" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 110px 80px", gap: 10 }}>
          <span>Wydarzenie</span>
          <span>Klient</span>
          <span>Data</span>
          <span>Typ</span>
        </div>
        {events.map((event) => (
          <div key={event.id} className="table-row" style={{ gridTemplateColumns: "2fr 1fr 110px 80px", gap: 10 }}>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 12 }}>{event.title}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 10 }}>{event.time || "—"} · {event.duration || 30} min</div>
            </div>
            <div style={{ color: "var(--text-primary)", fontSize: 12 }}>{event.clientName}</div>
            <div className="mono" style={{ color: "var(--text-sec)" }}>{event.date}</div>
            <span className="badge badge-neutral">{event.type || "event"}</span>
          </div>
        ))}
      </div>

      {showAdd ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.75)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 900,
          }}
          onClick={() => setShowAdd(false)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: 28 }} onClick={(event) => event.stopPropagation()}>
            <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800, marginBottom: 18 }}>Nowe spotkanie</div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="form-label">Klient</label>
                <select value={form.client_id} onChange={(event) => setForm((current) => ({ ...current, client_id: event.target.value }))}>
                  <option value="">— wybierz —</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Tytuł</label>
                <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="form-label">Data</label>
                  <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Godzina</label>
                  <input type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="form-label">Typ</label>
                  <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                    <option value="call">call</option>
                    <option value="meeting">meeting</option>
                    <option value="onboarding">onboarding</option>
                    <option value="report">report</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Czas</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(event) => setForm((current) => ({ ...current, duration: Number(event.target.value) }))}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowAdd(false)}>
                Anuluj
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1.4, justifyContent: "center" }}
                onClick={async () => {
                  if (!form.client_id || !form.title || !form.date) {
                    showToast("Uzupełnij klienta, tytuł i datę");
                    return;
                  }
                  await onCreate(form);
                  setShowAdd(false);
                  setForm({ client_id: "", title: "", date: "", time: "09:00", type: "call", duration: 30 });
                }}
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClientDetailView({ client, snapshot, onBack }) {
  const [tab, setTab] = useState("overview");
  const campaigns = snapshot.campaigns.filter((campaign) => campaign.client_id === client.id);
  const leads = snapshot.leads.filter((lead) => lead.client_id === client.id);
  const events = snapshot.events.filter((event) => event.client_id === client.id);

  return (
    <div style={{ padding: 28 }}>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Wróć do klientów
      </button>

      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: `${client.color}20`,
            color: client.color,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          {client.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 22 }}>{client.name}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
            {client.industry || "Brak branży"} · {client.email || "Brak emaila"}
          </div>
        </div>
        <span className={`badge ${client.status === "active" ? "badge-success" : "badge-warning"}`}>{client.status}</span>
      </div>

      <Tabs
        tabs={[
          ["overview", "Wyniki", "◈"],
          ["campaigns", "Kampanie", "▶"],
          ["leads", "Leady", "◎"],
          ["schedule", "Spotkania", "📅"],
        ]}
        active={tab}
        onSelect={setTab}
      />

      {tab === "overview" ? (
        <div>
          <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
            <KPI label="Leady" value={client.metrics.leads} icon="👤" />
            <KPI label="CPL" value={`${client.metrics.cpl.toFixed(1)} zł`} accent="var(--success)" icon="⚡" />
            <KPI label="Spend" value={`${fmt(client.metrics.spend)} zł`} accent="#F7C59F" icon="💰" />
            <KPI label="Konwersje" value={client.metrics.conversions} accent="#34D399" icon="✓" />
          </div>

          <ChartCard title="Leady i wydatki · ostatnie 7 dni">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={client.sevenDay}>
                <defs>
                  <linearGradient id="clientLeadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={client.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={client.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)" />
                <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10 }} />
                <Area type="monotone" dataKey="leads" stroke={client.color} strokeWidth={2} fill="url(#clientLeadGradient)" />
                <Area type="monotone" dataKey="spend" stroke="var(--success)" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      ) : null}

      {tab === "campaigns" ? <CampaignsView campaigns={campaigns} /> : null}
      {tab === "leads" ? <LeadsView leads={leads} /> : null}
      {tab === "schedule" ? <CalendarView clients={[client]} events={events} onCreate={async () => {}} /> : null}
    </div>
  );
}

function AdminMain({ user, onLogout }) {
  const { loading, error, snapshot, setRaw, raw, agencyId } = useAdminData(user);
  const [view, setView] = useState("dashboard");
  const [focusClientId, setFocusClientId] = useState(null);
  const focusedClient = snapshot.clients.find((client) => client.id === focusClientId) || null;

  if (loading) {
    return (
      <div style={{ padding: 28 }}>
        <EmptyState title="Ładowanie danych" body="Panel pobiera dane z Supabase." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 28 }}>
        <EmptyState title="Błąd ładowania" body={error} />
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar nav={ADMIN_NAV} view={view} setView={(next) => { setView(next); setFocusClientId(null); }} onLogout={onLogout} user={user} />
      <main className="admin-main" style={{ marginLeft: 220, flex: 1 }}>
        {focusClientId && focusedClient ? (
          <ClientDetailView client={focusedClient} snapshot={snapshot} onBack={() => setFocusClientId(null)} />
        ) : null}
        {!focusClientId && view === "dashboard" ? <DashboardView snapshot={snapshot} onOpenClient={setFocusClientId} /> : null}
        {!focusClientId && view === "clients" ? <ClientsView clients={snapshot.clients} onOpenClient={setFocusClientId} /> : null}
        {!focusClientId && view === "campaigns" ? <CampaignsView campaigns={snapshot.campaigns} /> : null}
        {!focusClientId && view === "leads" ? <LeadsView leads={snapshot.leads} /> : null}
        {!focusClientId && view === "calendar" ? (
          <CalendarView
            clients={snapshot.clients}
            events={snapshot.events}
            onCreate={async (form) => {
              const payload = {
                agency_id: agencyId,
                client_id: form.client_id,
                title: form.title,
                date: form.date,
                time: form.time,
                type: form.type,
                duration: form.duration,
              };

              const created = await createCalendarEvent(payload);
              setRaw((current) => ({ ...current, events: [...current.events, created] }));
              showToast("Spotkanie zapisane");
            }}
          />
        ) : null}
      </main>
      <Toast />
    </div>
  );
}

export default function AdminApp({ user, onLogout }) {
  return <AdminMain user={user} onLogout={onLogout} />;
}

