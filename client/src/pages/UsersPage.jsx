import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import {
  Users, Mail, Send, ShieldCheck, User, Lock,
  Clock, CheckCircle2, XCircle, RefreshCw,
} from "lucide-react";

function getInviteStatus(invite) {
  if (invite.used) return "used";
  if (new Date() > new Date(invite.expiresAt)) return "expired";
  return "pending";
}

function StatusBadge({ invite }) {
  const status = getInviteStatus(invite);
  if (status === "used") {
    return (
      <span className="badge badge-indigo" style={{ gap: 5 }}>
        <CheckCircle2 size={10} strokeWidth={2.5} />
        Terpakai
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="badge badge-gray" style={{ gap: 5 }}>
        <XCircle size={10} strokeWidth={2} />
        Kadaluarsa
      </span>
    );
  }
  return (
    <span className="badge badge-green" style={{ gap: 5 }}>
      <Clock size={10} strokeWidth={2.5} />
      Menunggu
    </span>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [invites, setInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  const loadInvites = useCallback(async () => {
    if (!isAdmin) return;
    setInvitesLoading(true);
    try {
      const data = await api.get("/invites");
      setInvites(data);
    } catch {
      setInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/invites", { email: email.trim() });
      setToast({ message: `Undangan dikirim ke ${email.trim()}`, type: "success" });
      setEmail("");
      loadInvites();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = user?.role === "ADMIN" ? "Administrator" : "Member";
  const initials = user?.role === "ADMIN" ? "A" : "M";

  const pendingCount = invites.filter(i => getInviteStatus(i) === "pending").length;
  const usedCount = invites.filter(i => getInviteStatus(i) === "used").length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pengguna</h1>
        <p className="page-subtitle">Kelola akses tim dan undang anggota baru</p>
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
          <div
            className="sidebar-avatar"
            style={{ width: 52, height: 52, fontSize: 18, borderRadius: 14, flexShrink: 0 }}
          >
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: 16,
              fontWeight: 700, color: "var(--text)", marginBottom: 2,
            }}>
              {roleLabel}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Tenant ID:{" "}
              <span style={{
                fontFamily: "ui-monospace, monospace", fontSize: 12,
                background: "var(--border-light)", padding: "1px 6px", borderRadius: 5,
              }}>
                {user?.tenantId ?? "—"}
              </span>
            </div>
          </div>
          <div className="users-role-badge" data-role={user?.role}>
            {isAdmin
              ? <ShieldCheck size={13} strokeWidth={2} />
              : <User size={13} strokeWidth={2} />}
            {roleLabel}
          </div>
        </div>
      </div>

      {isAdmin ? (
        <>
          {/* Invite form */}
          <div className="table-wrapper" style={{ marginBottom: 20 }}>
            <div className="table-toolbar">
              <span className="table-toolbar-title">
                <Mail size={15} strokeWidth={1.8} />
                Undang Anggota Baru
              </span>
            </div>
            <div style={{ padding: "20px 22px" }}>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
                Kirim undangan melalui email. Penerima mendapat link untuk buat akun dengan peran{" "}
                <strong>Member</strong>.
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
                  {submitting ? "Mengirim…" : (
                    <><Send size={13} strokeWidth={2} /> Kirim Undangan</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Invite history table */}
          <div className="table-wrapper" style={{ marginBottom: 20 }}>
            <div className="table-toolbar">
              <span className="table-toolbar-title">
                <Users size={15} strokeWidth={1.8} />
                Riwayat Undangan
                {invites.length > 0 && (
                  <span className="table-count-badge">{invites.length}</span>
                )}
              </span>
              <div className="table-toolbar-actions">
                {pendingCount > 0 && (
                  <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                    {pendingCount} menunggu
                  </span>
                )}
                {usedCount > 0 && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginLeft: 8 }}>
                    {usedCount} diterima
                  </span>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={loadInvites}
                  disabled={invitesLoading}
                  style={{ gap: 5 }}
                >
                  <RefreshCw size={12} strokeWidth={2} style={{ opacity: invitesLoading ? 0.4 : 1 }} />
                  Refresh
                </button>
              </div>
            </div>

            {invitesLoading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : invites.length === 0 ? (
              <div className="empty-state">
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "var(--accent-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12,
                }}>
                  <Mail size={22} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
                </div>
                <div className="empty-state-title">Belum ada undangan</div>
                <div className="empty-state-desc">Kirim undangan pertama di atas</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Dikirim</th>
                    <th>Kadaluarsa</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => {
                    const expired = new Date() > new Date(inv.expiresAt);
                    return (
                      <tr key={inv.id}>
                        <td className="td-primary">{inv.email}</td>
                        <td><StatusBadge invite={inv} /></td>
                        <td className="td-muted">
                          {new Date(inv.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td>
                          <span style={{
                            fontSize: 12.5,
                            color: expired && !inv.used
                              ? "var(--danger)"
                              : "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}>
                            {new Date(inv.expiresAt).toLocaleString("id-ID", {
                              day: "numeric", month: "short",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="table-wrapper">
          <div className="empty-state" style={{ padding: "52px 32px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "var(--border-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <Lock size={24} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="empty-state-title">Akses Terbatas</div>
            <div className="empty-state-desc">
              Hanya Administrator yang dapat mengundang atau mengelola pengguna.
            </div>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="users-info-grid">
        <div className="users-info-card">
          <div className="users-info-icon" style={{ background: "var(--accent-light)" }}>
            <Mail size={16} color="var(--accent)" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              Undangan via Email
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Link undangan dikirim langsung ke email penerima
            </div>
          </div>
        </div>
        <div className="users-info-card">
          <div className="users-info-icon" style={{ background: "var(--accent-light)" }}>
            <ShieldCheck size={16} color="var(--accent)" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              Peran Member
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Anggota yang diundang mendapat akses terbatas
            </div>
          </div>
        </div>
        <div className="users-info-card">
          <div className="users-info-icon" style={{ background: "var(--warning-light)" }}>
            <Clock size={16} color="var(--warning)" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              Berlaku 24 Jam
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Link undangan kadaluarsa setelah 24 jam dari waktu kirim
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
