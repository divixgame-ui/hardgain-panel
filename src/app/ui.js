import { useEffect, useState } from "react";

export const TENANT = {
  name: "Hardgain",
  tagline: "Agency Panel",
  primary: "#ff5c1a",
  accent: "#22d3a0",
  logo: "H",
  font: "'DM Sans', sans-serif",
};

export const ADMIN_ROLES = new Set(["superadmin", "agency_owner"]);
export const SUPABASE_READY = !!(
  process.env.REACT_APP_SUPABASE_URL &&
  !process.env.REACT_APP_SUPABASE_URL.includes("placeholder")
);

const LEAD_STATUS = {
  new: ["Nowy", "badge-accent"],
  contacted: ["Kontakt", "badge-info"],
  qualified: ["Kwalifikacja", "badge-warning"],
  closed_won: ["Wygrany", "badge-success"],
  closed_lost: ["Przegrany", "badge-danger"],
};

let setToastGlobal = null;
let toastTimeout = null;

export function fmt(value) {
  return Number(value || 0).toLocaleString("pl-PL");
}

export function showToast(msg) {
  if (!setToastGlobal) return;
  setToastGlobal({ kind: "message", msg });
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => setToastGlobal(null), 2500);
}

export function showLeadToast(lead) {
  if (!setToastGlobal) return;
  setToastGlobal({ kind: "lead", lead });
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => setToastGlobal(null), 4500);
}

function toastContent(data) {
  if (!data) return null;

  if (data.kind === "lead") {
    const lead = data.lead;
    return (
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          background: "var(--bg-raised)",
          border: "1px solid var(--success-b)",
          borderRadius: 16,
          padding: "16px 20px",
          color: "var(--text-primary)",
          zIndex: 9999,
          boxShadow: "0 12px 48px rgba(0,0,0,.7),0 0 0 1px var(--success-b)",
          minWidth: 280,
          maxWidth: 320,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--success-dim)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              color: "var(--success)",
            }}
          >
            +
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--success)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Nowy lead
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
              {lead.name || "Nieznany"}
            </div>
          </div>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
          {lead.clientName || "Bez klienta"} {lead.phone ? `· ${lead.phone}` : ""}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 28,
        transform: "translateX(-50%)",
        background: "var(--bg-overlay)",
        border: "1px solid var(--border-hi)",
        borderRadius: 12,
        padding: "11px 22px",
        color: "var(--text-primary)",
        fontSize: 13,
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: "var(--shadow-up)",
      }}
    >
      {data.msg}
    </div>
  );
}

export function Toast() {
  const [data, setData] = useState(null);

  useEffect(() => {
    setToastGlobal = setData;
    return () => {
      if (setToastGlobal === setData) setToastGlobal = null;
      clearTimeout(toastTimeout);
    };
  }, []);

  return toastContent(data);
}

export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

      :root {
        --bg-base: #05050a;
        --bg-surface: #0a0a12;
        --bg-raised: #0f0f1a;
        --bg-overlay: #141422;
        --bg-subtle: #1a1a2a;
        --text-primary: #f0f0f8;
        --text-sec: #8888a8;
        --text-muted: #444460;
        --accent: #ff5c1a;
        --accent-hover: #ff7040;
        --accent-glow: rgba(255,92,26,0.15);
        --accent-b: rgba(255,92,26,0.3);
        --success: #22d3a0;
        --success-dim: rgba(34,211,160,0.1);
        --success-b: rgba(34,211,160,0.22);
        --warning: #f59e0b;
        --warning-dim: rgba(245,158,11,0.1);
        --danger: #ef4444;
        --danger-dim: rgba(239,68,68,0.1);
        --info: #60a5fa;
        --info-dim: rgba(96,165,250,0.1);
        --border: rgba(255,255,255,0.06);
        --border-hi: rgba(255,255,255,0.10);
        --shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--border);
        --shadow-up: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--border);
        --sidebar-bg: #070710;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: var(--bg-base);
        color: var(--text-sec);
        font-family: ${TENANT.font};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: 14px;
        line-height: 1.5;
      }
      button, input, textarea, select { font-family: inherit; }
      input, textarea, select {
        background: var(--bg-base);
        border: 1px solid var(--border);
        color: var(--text-primary);
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 14px;
        width: 100%;
        outline: none;
      }
      input::placeholder, textarea::placeholder { color: var(--text-muted); }
      input:focus, textarea:focus, select:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-glow);
      }
      button { cursor: pointer; border: none; transition: all .12s ease; }
      button:active { transform: scale(0.98); }
      a { color: inherit; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--bg-subtle); border-radius: 2px; }

      .mono, .kpi-val { font-family: 'DM Mono', monospace; font-variant-numeric: tabular-nums; }
      .card {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow-card);
      }
      .kpi-card {
        background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-raised) 100%);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 18px;
        position: relative;
        overflow: hidden;
      }
      .kpi-card::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border-hi), transparent);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 10px;
        padding: 9px 18px;
        font-size: 13px;
        font-weight: 700;
      }
      .btn-primary { background: var(--accent); color: #fff; }
      .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
      .btn-secondary {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border-hi);
      }
      .btn-secondary:hover { background: var(--bg-overlay); }
      .btn-ghost {
        background: transparent;
        color: var(--text-sec);
        padding: 7px 12px;
      }
      .btn-ghost:hover { background: var(--bg-overlay); color: var(--text-primary); }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .06em;
      }
      .badge-success { background: var(--success-dim); color: var(--success); border: 1px solid var(--success-b); }
      .badge-warning { background: var(--warning-dim); color: var(--warning); border: 1px solid rgba(245,158,11,.2); }
      .badge-danger { background: var(--danger-dim); color: var(--danger); border: 1px solid rgba(239,68,68,.2); }
      .badge-info { background: var(--info-dim); color: var(--info); border: 1px solid rgba(96,165,250,.2); }
      .badge-neutral { background: rgba(255,255,255,.05); color: var(--text-sec); border: 1px solid var(--border); }
      .badge-accent { background: var(--accent-glow); color: var(--accent); border: 1px solid var(--accent-b); }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: calc(100% - 16px);
        margin: 2px 8px;
        padding: 8px 12px;
        border-radius: 8px;
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-sec);
        text-align: left;
      }
      .nav-item:hover { background: var(--bg-overlay); color: var(--text-primary); }
      .nav-item.active { background: var(--accent-glow); color: var(--accent); border-color: var(--accent-b); }
      .tabs-bar {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        margin-bottom: 20px;
        padding: 4px;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 12px;
      }
      .tab-btn {
        padding: 6px 14px;
        border-radius: 8px;
        background: transparent;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 600;
      }
      .tab-btn.active {
        background: var(--bg-overlay);
        color: var(--text-primary);
      }
      .table-row {
        display: grid;
        padding: 12px 16px;
        align-items: center;
        border-bottom: 1px solid var(--border);
      }
      .table-row:hover { background: var(--bg-raised); }
      .table-header {
        padding: 10px 16px;
        border-bottom: 1px solid var(--border);
        color: var(--text-muted);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .login-wrap {
        min-height: 100vh;
        background: radial-gradient(circle at 50% 0%, rgba(255,92,26,.07) 0%, transparent 60%), var(--bg-base);
        display: grid;
        place-items: center;
        padding: 20px;
      }
      .login-card {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 32px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 24px 80px rgba(0,0,0,.6);
      }
      .form-label {
        display: block;
        margin-bottom: 6px;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      @media (max-width: 768px) {
        .admin-layout { flex-direction: column; }
        .admin-main { margin-left: 0 !important; padding: 16px !important; }
        .sidebar-panel {
          position: sticky !important;
          top: 0;
          width: 100% !important;
          border-right: 0 !important;
          border-bottom: 1px solid var(--border);
        }
        .kpi-grid,
        .two-col-grid,
        .three-col-grid,
        .detail-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  );
}

export function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <GlobalStyles />
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid rgba(255,92,26,.2)",
            borderTop: "3px solid var(--accent)",
            borderRadius: "50%",
            margin: "0 auto 14px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Ładowanie...</div>
      </div>
    </div>
  );
}

export function KPI({ label, value, icon, accent = "var(--accent)", sub }) {
  return (
    <div className="kpi-card">
      <div style={{ position: "absolute", top: 14, right: 16, opacity: 0.12, fontSize: 20 }}>{icon}</div>
      <div className="kpi-val" style={{ color: accent, fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-sec)", marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

export function SectionHeader({ title, sub, btn, onBtn }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ fontSize: 22, color: "var(--text-primary)", fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</h2>
        {sub ? <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{sub}</p> : null}
      </div>
      {btn ? (
        <button className="btn btn-primary" onClick={onBtn}>
          {btn}
        </button>
      ) : null}
    </div>
  );
}

export function Tabs({ tabs, active, onSelect }) {
  return (
    <div className="tabs-bar">
      {tabs.map(([key, label, icon]) => (
        <button
          key={key}
          className={`tab-btn${active === key ? " active" : ""}`}
          onClick={() => onSelect(key)}
        >
          {icon ? <span>{icon}</span> : null}
          {label}
        </button>
      ))}
    </div>
  );
}

export function Sidebar({ nav, view, setView, onLogout, user }) {
  return (
    <aside
      className="sidebar-panel"
      style={{
        width: 220,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        inset: "0 auto 0 0",
      }}
    >
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: `linear-gradient(135deg,${TENANT.primary},#c43a00)`,
              display: "grid",
              placeItems: "center",
              color: "var(--text-primary)",
              fontWeight: 700,
            }}
          >
            {TENANT.logo}
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 700 }}>{TENANT.name}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {TENANT.tagline}
            </div>
          </div>
        </div>
      </div>
      <nav style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
        {nav.map(([key, icon, label]) => (
          <button
            key={key}
            className={`nav-item${view === key ? " active" : ""}`}
            onClick={() => setView(key)}
          >
            <span style={{ width: 16, textAlign: "center", flexShrink: 0 }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
        <div
          style={{
            margin: "0 8px 6px",
            padding: "10px 12px",
            background: "var(--bg-raised)",
            borderRadius: 10,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--accent-glow)",
              border: "1px solid var(--accent-b)",
              display: "grid",
              placeItems: "center",
              color: "var(--accent)",
              fontWeight: 800,
            }}
          >
            {(user?.name || "J").charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>{user?.name || "Jan"}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 10 }}>{user?.role || "user"}</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width: "calc(100% - 16px)", margin: "0 8px", justifyContent: "flex-start" }} onClick={onLogout}>
          Wyloguj
        </button>
      </div>
    </aside>
  );
}

export function HotTimer({ hotUntil }) {
  if (!hotUntil) {
    return <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>-</span>;
  }

  const minutes = Math.max(0, Math.ceil((new Date(hotUntil).getTime() - Date.now()) / 60000));

  if (minutes === 0) {
    return <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>po czasie</span>;
  }

  return (
    <span className="mono" style={{ color: minutes <= 60 ? "var(--accent)" : "var(--warning)", fontSize: 11, fontWeight: 700 }}>
      {minutes} min
    </span>
  );
}

export function LeadBadge({ status }) {
  const [label, klass] = LEAD_STATUS[status] || [status || "Nieznany", "badge-neutral"];
  return <span className={`badge ${klass}`}>{label}</span>;
}

