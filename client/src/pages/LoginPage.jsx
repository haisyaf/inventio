import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Boxes, Eye, EyeOff, ArrowLeft, Package } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post("/auth/login", { email, password });
      login(
        { userId: data.userId, tenantId: data.tenantId, tenantSlug: data.tenantSlug, role: data.role },
        data.token
      );
      navigate(`/${data.tenantSlug}/dashboard`);
    } catch (err) {
      setError(err.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

{/* nav */}
<nav style={S.nav}>
  <div style={S.navInner}>

    <Link to="/" style={S.back}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = "#475569";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = "#94A3B8";
  }}
>
  <ArrowLeft size={14} strokeWidth={2} />
  Kembali
</Link>

    <Link to="/" className="login-nav-logo">
      <div className="login-nav-logo-mark">
        <img src="/inventioicon.png" alt="Inventio" />
      </div>

      <span className="login-nav-logo-text">
        Inventio
      </span>
    </Link>

    <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
      Belum punya akun?{" "}
      <Link
        to="/register"
        style={{
          color: "#2563EB",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Daftar
      </Link>
    </p>

  </div>
</nav>
      {/*
      <div
        className="login-bg-orb"
        style={{
          width: 700,
          height: 700,
          top: -250,
          right: -200,
          background:
            "radial-gradient(circle, rgba(37, 99, 235,0.14) 0%, transparent 100%)",
        }}
      />
      <div
        className="login-bg-orb"
        style={{
          width: 500,
          height: 500,
          bottom: -200,
          left: -150,
          background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
        }}
      />
*/}
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <img src="/inventioicon.png" alt="Inventio Icon" />
            <Boxes size={20} color="white" strokeWidth={2} />
          </div>
          <span className="login-logo-text">Inventio</span>
        </div>

        <h2 className="login-heading">Selamat datang kembali</h2>
        <p className="login-subheading">
          Masuk ke dashboard manajemen inventaris Anda
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pw-input-wrap">
              <input
                className="form-input"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 8, height: 41, fontSize: 14 }}
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          Inventio — Sistem Manajemen Inventaris untuk UMKM Indonesia
        </p>
      </div>
    </div>
  );
}

const S = {
  nav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    zIndex: 100,

    background: "#F7F6F2",
    backdropFilter: "blur(14px)",

    borderBottom: "1px solid #E2E8F0",
  },

  navInner: {
    maxWidth: 1100,

    margin: "0 auto",

    padding: "0 28px",

    height: 56,

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back: {
    display: "flex",
    alignItems: "center",
    gap: 6,

    color: "#94A3B8",

    textDecoration: "none",

    fontSize: 13,
    fontWeight: 500,
  },

  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 9,

    textDecoration: "none",
  },

  logoMark: {
    width: 28,
    height: 28,

    background:
      "linear-gradient(135deg,#2563EB,#3B82F6)",

    borderRadius: 7,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontFamily: "var(--font-display)",

    fontWeight: 700,

    fontSize: 15.5,

    color: "#0F172A",

    letterSpacing: "-0.3px",
  },
};