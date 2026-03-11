import { useEffect, useState } from "react";
import AdminApp from "./features/admin/AdminApp";
import { getSession, getUserProfile, signIn, signOut, supabase } from "./lib/supabase";
import {
  ADMIN_ROLES,
  GlobalStyles,
  LoadingScreen,
  SUPABASE_READY,
  TENANT,
  Toast,
} from "./app/ui";

const DEMO_USERS = [
  {
    id: "admin-demo",
    role: "superadmin",
    name: "Jan",
    email: "jan@hardgain.pl",
    password: "admin123",
  },
  {
    id: "client-demo",
    role: "client",
    name: "FitZone Studio",
    email: "fitzone@gmail.com",
    password: "klient1",
  },
];

function normalizeRole(role) {
  if (!role) return "client";
  if (role === "admin") return "superadmin";
  return role;
}

function roleLabel(role) {
  if (role === "superadmin") return "Superadmin";
  if (role === "agency_owner") return "Agency Owner";
  return "Client";
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(nextEmail = email, nextPassword = password, demo = false) {
    setLoading(true);
    setError("");

    try {
      if (SUPABASE_READY && !demo) {
        const { session } = await signIn(nextEmail, nextPassword);
        const profile = await getUserProfile(session.user.id);
        onLogin({ ...profile, id: session.user.id, role: normalizeRole(profile.role) });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const demoUser = DEMO_USERS.find(
          (user) => user.email === nextEmail && user.password === nextPassword
        );
        if (!demoUser) throw new Error("Nieprawidłowy email lub hasło");
        onLogin(demoUser);
      }
    } catch (err) {
      setError(err.message || "Nie udało się zalogować");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="login-wrap">
      <GlobalStyles />
      <Toast />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg,${TENANT.primary},#c43a00)`,
              color: "var(--text-primary)",
              fontWeight: 800,
              fontSize: 22,
              marginBottom: 20,
            }}
          >
            {TENANT.logo}
          </div>
          <div style={{ fontSize: 26, color: "var(--text-primary)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            {TENANT.name} Panel
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
            Faza 1: panel agencyjny na realnym backendzie
          </div>
        </div>

        <div className="login-card">
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleLogin();
              }}
            />
          </div>

          {error ? (
            <div
              style={{
                color: "var(--danger)",
                background: "var(--danger-dim)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          ) : null}

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleLogin()} disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </div>

        {!SUPABASE_READY ? (
          <div className="card" style={{ marginTop: 12, padding: "14px 16px" }}>
            <div className="form-label" style={{ marginBottom: 10 }}>Demo lokalne</div>
            <div style={{ display: "grid", gap: 6 }}>
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  className="btn btn-secondary"
                  style={{ justifyContent: "space-between" }}
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(user.password);
                    handleLogin(user.email, user.password, true);
                  }}
                >
                  <span>{user.name}</span>
                  <span>{roleLabel(user.role)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ClientPlaceholder({ user, onLogout }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "grid", placeItems: "center", padding: 20 }}>
      <GlobalStyles />
      <Toast />
      <div className="card" style={{ maxWidth: 520, padding: 32 }}>
        <div style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
          Portal klienta w przygotowaniu
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7, marginBottom: 22 }}>
          Zalogowano jako klient: <span style={{ color: "var(--text-primary)" }}>{user.name || user.email}</span>.
          W tej iteracji produkcyjnej uruchomiony jest tylko panel agencyjny. Docelowe ekrany klienta wrócą po pełnym spięciu fazy 2.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onLogout}>Wyloguj</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(SUPABASE_READY);

  useEffect(() => {
    if (!SUPABASE_READY) {
      setLoading(false);
      return undefined;
    }

    let alive = true;

    async function restore() {
      try {
        const session = await getSession();
        if (session && alive) {
          const profile = await getUserProfile(session.user.id);
          setUser({ ...profile, id: session.user.id, role: normalizeRole(profile.role) });
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    restore();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }

      if (event === "SIGNED_IN" && session) {
        const profile = await getUserProfile(session.user.id);
        setUser({ ...profile, id: session.user.id, role: normalizeRole(profile.role) });
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    if (SUPABASE_READY) {
      await signOut();
    }
    setUser(null);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <>
      <GlobalStyles />
      {ADMIN_ROLES.has(user.role) ? (
        <AdminApp user={user} onLogout={handleLogout} />
      ) : (
        <ClientPlaceholder user={user} onLogout={handleLogout} />
      )}
    </>
  );
}
