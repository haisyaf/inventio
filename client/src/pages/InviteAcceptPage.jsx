import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Boxes, Eye, EyeOff, CheckCircle2, XCircle, Loader } from "lucide-react";

export default function InviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [verifyState, setVerifyState] = useState("loading"); // loading | valid | invalid
  const [inviteEmail, setInviteEmail] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifyState("invalid");
      return;
    }
    fetch(`/api/invites/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Invalid");
        return data;
      })
      .then((data) => {
        setInviteEmail(data.email);
        setVerifyState("valid");
      })
      .catch(() => setVerifyState("invalid"));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: name.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal membuat akun");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.page}>
      <div
        style={{
          ...S.orb,
          width: 700, height: 700,
          top: -250, right: -200,
          background: "radial-gradient(circle, rgba(5,150,105,0.14) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          ...S.orb,
          width: 500, height: 500,
          bottom: -200, left: -150,
          background: "radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)",
        }}
      />

      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoMark}>
            <Boxes size={20} color="white" strokeWidth={2} />
          </div>
          <span style={S.logoText}>Inventio</span>
        </div>

        {/* States */}
        {verifyState === "loading" && (
          <div style={S.stateBox}>
            <Loader size={32} strokeWidth={1.5} style={{ color: "var(--accent)", animation: "spin 0.65s linear infinite" }} />
            <p style={S.stateText}>Memverifikasi undangan…</p>
          </div>
        )}

        {verifyState === "invalid" && (
          <div style={S.stateBox}>
            <div style={{ ...S.stateIcon, background: "var(--danger-light)" }}>
              <XCircle size={26} strokeWidth={1.5} style={{ color: "var(--danger)" }} />
            </div>
            <h2 style={{ ...S.heading, marginBottom: 8 }}>Undangan Tidak Valid</h2>
            <p style={S.subheading}>
              Link undangan ini sudah kadaluarsa, telah digunakan, atau tidak valid.
            </p>
            <Link to="/login" style={S.backLink}>Kembali ke halaman masuk</Link>
          </div>
        )}

        {verifyState === "valid" && !success && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={S.inviteBadge}>
                <CheckCircle2 size={13} strokeWidth={2.5} />
                Undangan valid untuk <strong>{inviteEmail}</strong>
              </div>
              <h2 style={S.heading}>Buat Akun Anda</h2>
              <p style={S.subheading}>
                Lengkapi data di bawah untuk bergabung sebagai <strong>Member</strong>.
              </p>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Siti Rahayu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={inviteEmail}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
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
                    minLength={6}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                  Minimal 6 karakter
                </p>
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting || !name.trim() || !password}
                style={{ width: "100%", marginTop: 8, height: 42, fontSize: 14 }}
              >
                {submitting ? "Membuat akun…" : "Buat Akun & Bergabung"}
              </button>
            </form>
          </>
        )}

        {success && (
          <div style={S.stateBox}>
            <div style={{ ...S.stateIcon, background: "var(--accent-light)" }}>
              <CheckCircle2 size={26} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <h2 style={{ ...S.heading, marginBottom: 8 }}>Akun Berhasil Dibuat</h2>
            <p style={S.subheading}>
              Akun Anda sudah aktif. Anda akan diarahkan ke halaman masuk dalam beberapa detik…
            </p>
            <Link to="/login" style={S.backLink}>Masuk sekarang</Link>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100dvh",
    background: "linear-gradient(150deg, #081520 0%, #0D2030 45%, #091820 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(70px)",
    pointerEvents: "none",
  },
  card: {
    background: "rgba(255,255,255,0.99)",
    borderRadius: 20,
    padding: "36px 38px",
    width: "100%",
    maxWidth: 420,
    position: "relative",
    zIndex: 1,
    boxShadow: "0 24px 64px rgba(10,28,20,0.18), 0 8px 20px rgba(10,28,20,0.08)",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 28,
  },
  logoMark: {
    width: 38, height: 38,
    background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontWeight: 700, fontSize: 21,
    color: "var(--text)", letterSpacing: "-0.4px",
  },
  stateBox: {
    display: "flex", flexDirection: "column",
    alignItems: "center", textAlign: "center",
    padding: "16px 0 8px",
    gap: 14,
  },
  stateIcon: {
    width: 64, height: 64, borderRadius: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  stateText: {
    fontFamily: "var(--font-body)",
    fontSize: 14, color: "var(--text-secondary)",
  },
  inviteBadge: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: "var(--accent-light)",
    border: "1px solid var(--accent-border)",
    color: "var(--accent)",
    fontSize: 12, fontWeight: 500,
    fontFamily: "var(--font-body)",
    padding: "5px 12px", borderRadius: 20,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  heading: {
    fontFamily: "var(--font-display)",
    fontSize: 20, fontWeight: 700,
    color: "var(--text)", letterSpacing: "-0.4px",
    marginBottom: 5,
  },
  subheading: {
    fontFamily: "var(--font-body)",
    fontSize: 13.5, color: "var(--text-secondary)",
    marginBottom: 24, lineHeight: 1.6,
  },
  backLink: {
    fontFamily: "var(--font-body)",
    fontSize: 13.5, fontWeight: 500,
    color: "var(--accent)", textDecoration: "none",
    marginTop: 4,
  },
};
