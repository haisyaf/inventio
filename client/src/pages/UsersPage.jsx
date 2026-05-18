import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { Users, Mail, Send, ShieldCheck, User, Lock } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [sentInvites, setSentInvites] = useState([]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/invites", { email: email.trim() });
      setSentInvites((prev) => [
        { email: email.trim(), sentAt: new Date() },
        ...prev,
      ]);
      setToast({ message: `Undangan dikirim ke ${email.trim()}`, type: "success" });
      setEmail("");
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = user?.role === "ADMIN" ? "Administrator" : "Member";
  const initials = (user?.role ?? "U").charAt(0).toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pengguna</h1>
        <p className="page-subtitle">Kelola akses tim dan kirim undangan anggota baru</p>
      </div>

      {/* Current user card */}
      <div className="table-wrapper" style={{ marginBottom: 20 }}>
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            <User size={15} strokeWidth={1.8} />
            Profil Akun Anda
          </span>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
          <div className="sidebar-avatar" style={{ width: 52, height: 52, fontSize: 18, borderRadius: 14, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
              {roleLabel}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Tenant ID:{" "}
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, background: "var(--border-light)", padding: "1px 6px", borderRadius: 5 }}>
                {user?.tenantId ?? "—"}
              </span>
            </div>
          </div>
          <div className="users-role-badge" data-role={user?.role}>
            {isAdmin ? <ShieldCheck size={13} strokeWidth={2} /> : <User size={13} strokeWidth={2} />}
            {roleLabel}
          </div>
        </div>
      </div>

      {/* Invite section */}
      {isAdmin ? (
        <div className="table-wrapper" style={{ marginBottom: 20 }}>
          <div className="table-toolbar">
            <span className="table-toolbar-title">
              <Mail size={15} strokeWidth={1.8} />
              Undang Anggota Baru
            </span>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
              Kirim undangan melalui email. Penerima akan mendapatkan link untuk membuat akun dengan peran <strong>Member</strong> di tim Anda.
            </p>
            <form onSubmit={handleInvite} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Alamat Email</label>
                <div className="search-input-wrap" style={{ padding: "8px 11px" }}>
                  <Mail size={14} strokeWidth={1.8} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !email.trim()}
                style={{ flexShrink: 0 }}
              >
                {submitting ? (
                  "Mengirim…"
                ) : (
                  <>
                    <Send size={13} strokeWidth={2} />
                    Kirim Undangan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sent invites log */}
          {sentInvites.length > 0 && (
            <>
              <div style={{ borderTop: "1px solid var(--border-light)" }} />
              <div className="table-toolbar">
                <span className="table-toolbar-title">
                  Undangan Terkirim Sesi Ini
                  <span className="table-count-badge">{sentInvites.length}</span>
                </span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Waktu Kirim</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sentInvites.map((inv, i) => (
                    <tr key={i}>
                      <td className="td-primary">{inv.email}</td>
                      <td className="td-muted">
                        {inv.sentAt.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <span className="badge badge-green">Terkirim</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      ) : (
        /* Non-admin blocked state */
        <div className="table-wrapper">
          <div className="empty-state" style={{ padding: "52px 32px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Lock size={24} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="empty-state-title">Akses Terbatas</div>
            <div className="empty-state-desc">
              Hanya Administrator yang dapat mengundang anggota baru atau mengelola pengguna.
            </div>
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="users-info-grid">
        <div className="users-info-card">
          <div className="users-info-icon" style={{ background: "#EFF6FF" }}>
            <Mail size={16} color="#2563EB" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Undangan via Email</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Link undangan dikirim langsung ke email penerima
            </div>
          </div>
        </div>
        <div className="users-info-card">
          <div className="users-info-icon" style={{ background: "#ECFDF5" }}>
            <ShieldCheck size={16} color="#059669" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Peran Member</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Anggota yang diundang mendapat akses read terbatas
            </div>
          </div>
        </div>
        <div className="users-info-card">
          <div className="users-info-icon" style={{ background: "#FFF7ED" }}>
            <Users size={16} color="#EA580C" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Batas Pengguna</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Jumlah maksimal anggota bergantung pada paket langganan
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
