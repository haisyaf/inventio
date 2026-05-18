import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import Toast from "../components/Toast";
import {
  Crown, CheckCircle2, XCircle, Zap, CreditCard, QrCode,
  CalendarDays, RefreshCw, ExternalLink, AlertCircle,
  Copy, Check, Clock, Loader2, ArrowLeft,
  Landmark, Bell, Lock,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────
function formatRupiah(val) {
  if (!val || val === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
function featureLabel(key, val) {
  const LABELS = { forecast: "Forecast AI", addUser: "Undang Anggota", max_warehouses: "Maks. Gudang", max_products: "Maks. Produk", max_users: "Maks. Pengguna" };
  const label = LABELS[key] || key;
  if (typeof val === "boolean") return { label, value: val ? "✓" : "✗", positive: val };
  return { label, value: String(val), positive: true };
}

const STATUS_CFG = {
  ACTIVE:   { label: "Aktif",         cls: "badge-green", icon: CheckCircle2 },
  PAST_DUE: { label: "Jatuh Tempo",   cls: "badge-amber", icon: AlertCircle },
  CANCELED: { label: "Dibatalkan",    cls: "badge-red",   icon: XCircle },
  UNPAID:   { label: "Belum Dibayar", cls: "badge-red",   icon: XCircle },
};

const BANKS = [
  { id: "bca",     label: "BCA",     color: "#0061AB" },
  { id: "bni",     label: "BNI",     color: "#F47920" },
  { id: "bri",     label: "BRI",     color: "#00529C" },
  { id: "mandiri", label: "Mandiri", color: "#003D7A" },
  { id: "permata", label: "Permata", color: "#E30613" },
];

const PAYMENT_METHODS = [
  { id: "snap",          label: "Snap",          icon: CreditCard,  desc: "Kartu, transfer, dompet digital" },
  { id: "qris",          label: "QRIS",          icon: QrCode,      desc: "GoPay, OVO, Dana, ShopeePay" },
  { id: "bank_transfer", label: "Transfer Bank", icon: Landmark,    desc: "Virtual Account BCA, BNI, BRI, dll" },
];

// ── Countdown timer ───────────────────────────────────────────────────
function useCountdown(expiryISO) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!expiryISO) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiryISO) - Date.now()) / 1000));
      setSecs(diff);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiryISO]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return { secs, display: `${m}:${s}` };
}

// ── Copy button ───────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handle} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", display: "flex", alignItems: "center", gap: 4, color: copied ? "#059669" : "#2563EB", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-body)", transition: "color 0.15s" }}>
      {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
      {copied ? "Disalin!" : "Salin"}
    </button>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────
function PlanCard({ plan, currentPlanId, hasActiveSubscription, onSelect }) {
  const isCurrent = currentPlanId === plan.id;
  const isLocked = hasActiveSubscription && !isCurrent;
  const features = plan.features ? Object.entries(plan.features) : [];
  return (
    <div className={`sub-plan-card${isCurrent ? " current" : ""}${isLocked ? " locked" : ""}`}
      style={{ opacity: isLocked ? 0.55 : 1, transition: "opacity 0.2s" }}>
      {isCurrent && (
        <div className="sub-plan-current-badge">
          <CheckCircle2 size={10} strokeWidth={2.5} /> Paket Aktif
        </div>
      )}
      {isLocked && (
        <div className="sub-plan-current-badge" style={{ background: "var(--border)", color: "var(--text-secondary)" }}>
          <Lock size={10} strokeWidth={2.5} /> Terkunci
        </div>
      )}
      <div className="sub-plan-name">{plan.name}</div>
      <div className="sub-plan-price">
        {formatRupiah(plan.price)}
        {plan.price > 0 && <span className="sub-plan-period">/bulan</span>}
      </div>
      {plan.description && <p className="sub-plan-desc">{plan.description}</p>}
      <div className="sub-plan-features">
        {features.map(([key, val]) => {
          const { label, value, positive } = featureLabel(key, val);
          return (
            <div key={key} className="sub-plan-feature-row">
              <span className="sub-plan-feature-icon" style={{ color: positive ? "#059669" : "#94A3B8" }}>
                {typeof val === "boolean" ? (val ? <CheckCircle2 size={13} strokeWidth={2.5}/> : <XCircle size={13} strokeWidth={2}/>) : <Zap size={13} strokeWidth={2}/>}
              </span>
              <span className="sub-plan-feature-label">{label}</span>
              {typeof val !== "boolean" && <span className="sub-plan-feature-val">{value}</span>}
            </div>
          );
        })}
      </div>
      <button
        className={`btn${isCurrent ? " btn-secondary" : isLocked ? " btn-secondary" : " btn-primary"}`}
        style={{ width: "100%", marginTop: "auto", cursor: isLocked ? "not-allowed" : "pointer" }}
        onClick={() => !isCurrent && !isLocked && onSelect(plan)}
        disabled={isCurrent || isLocked}
        title={isLocked ? "Batalkan langganan aktif untuk mengganti paket" : undefined}
      >
        {isCurrent ? "Paket Aktif" : isLocked ? "Tidak Tersedia" : plan.price === 0 ? "Pilih Gratis" : "Pilih Paket"}
      </button>
    </div>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────
function CheckoutModal({ plan, onClose, onSuccess }) {
  const [step, setStep]         = useState("method");  // method | paying | success | error
  const [method, setMethod]     = useState("snap");
  const [bank, setBank]         = useState("bca");
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Payment result data
  const [orderId, setOrderId]   = useState(null);
  const [snapUrl, setSnapUrl]   = useState(null);
  const [qrData, setQrData]     = useState(null);   // { qrUrl, qrString, expiryTime }
  const [vaData, setVaData]     = useState(null);   // { vaNumbers, bank, orderId }

  // Status polling
  const pollRef      = useRef(null);
  const attemptRef   = useRef(0);
  const [pollStatus, setPollStatus] = useState(null); // PAID | PENDING | EXPIRED | FAILED | null
  const [checking, setChecking]     = useState(false);

  const { secs: expirySecs, display: expiryDisplay } = useCountdown(qrData?.expiryTime);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const checkStatus = useCallback(async (id) => {
    if (!id) return;
    setChecking(true);
    try {
      const res = await api.get(`/subscriptions/payment/${id}`);
      const status = res.payment?.status;
      setPollStatus(status);
      if (status === "PAID") { stopPolling(); setStep("success"); onSuccess?.(); }
      else if (status === "EXPIRED" || status === "FAILED" || status === "CANCELED") {
        stopPolling();
        setStep("error");
        setErrorMsg("Pembayaran gagal atau kedaluwarsa. Silakan coba lagi.");
      }
    } catch { /* network error, ignore and retry */ }
    finally { setChecking(false); }
  }, [stopPolling, onSuccess]);

  const startPolling = useCallback((id, intervalMs = 5000) => {
    attemptRef.current = 0;
    stopPolling();
    pollRef.current = setInterval(() => {
      attemptRef.current += 1;
      if (attemptRef.current > 72) { stopPolling(); return; } // 6 min max
      checkStatus(id);
    }, intervalMs);
  }, [stopPolling, checkStatus]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handlePay = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (plan.price === 0) {
        await api.post("/subscriptions/checkout-snap", { planId: plan.id });
        setStep("success"); onSuccess?.(); return;
      }

      if (method === "snap") {
        const res = await api.post("/subscriptions/checkout-snap", { planId: plan.id });
        setOrderId(res.orderId);
        setSnapUrl(res.redirectUrl);
        window.open(res.redirectUrl, "_blank", "noopener,noreferrer");
        setStep("paying");
        startPolling(res.orderId, 5000);

      } else if (method === "qris") {
        const res = await api.post("/subscriptions/checkout-qris", { planId: plan.id });
        setOrderId(res.orderId);
        setQrData({ qrUrl: res.qrUrl, qrString: res.qrString, expiryTime: res.expiryTime });
        setStep("paying");
        startPolling(res.orderId, 5000);

      } else if (method === "bank_transfer") {
        const res = await api.post("/subscriptions/checkout", { planId: plan.id, paymentType: "bank_transfer", bank });
        setOrderId(res.orderId);
        setVaData({ vaNumbers: res.vaNumbers || [], bank: res.bank || bank, orderId: res.orderId });
        setStep("paying");
        startPolling(res.orderId, 10000);
      }
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    stopPolling();
    setStep("method");
    setOrderId(null); setSnapUrl(null); setQrData(null); setVaData(null);
    setPollStatus(null); setErrorMsg("");
  };

  const vaNumber = vaData?.vaNumbers?.[0];
  const bankInfo = BANKS.find(b => b.id === (vaData?.bank || bank));

  return (
    <div style={CM.overlay} onClick={e => e.target === e.currentTarget && step !== "paying" && onClose()}>
      <div style={CM.modal}>
        {/* Header */}
        <div style={CM.header}>
          {step === "paying" && (
            <button onClick={handleBack} style={CM.backBtn}>
              <ArrowLeft size={14} strokeWidth={2} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={CM.headerTitle}>
              {step === "method" && `Berlangganan ${plan.name}`}
              {step === "paying" && method === "snap" && "Selesaikan Pembayaran"}
              {step === "paying" && method === "qris" && "Scan QR Code"}
              {step === "paying" && method === "bank_transfer" && "Transfer Bank"}
              {step === "success" && "Pembayaran Berhasil!"}
              {step === "error" && "Pembayaran Gagal"}
            </div>
            <div style={CM.headerSub}>
              {plan.name} — {formatRupiah(plan.price)}{plan.price > 0 ? "/bulan" : ""}
            </div>
          </div>
          {step !== "paying" && (
            <button onClick={onClose} style={CM.closeBtn}>✕</button>
          )}
        </div>

        {/* Body */}
        <div style={CM.body}>

          {/* ── METHOD SELECTION ── */}
          {step === "method" && (
            <>
              {/* Price summary */}
              <div style={CM.priceSummary}>
                <span style={CM.priceSummaryLabel}>Total pembayaran</span>
                <span style={CM.priceSummaryVal}>
                  {formatRupiah(plan.price)}
                  {plan.price > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)", marginLeft: 4 }}>/bulan</span>}
                </span>
              </div>

              {plan.price > 0 && (
                <>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10 }}>Metode Pembayaran</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {PAYMENT_METHODS.map(m => {
                      const Icon = m.icon;
                      const sel = method === m.id;
                      return (
                        <button key={m.id} onClick={() => setMethod(m.id)} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px", borderRadius: 10,
                          border: sel ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                          background: sel ? "var(--accent-light)" : "var(--surface)",
                          cursor: "pointer", textAlign: "left", width: "100%",
                          fontFamily: "var(--font-body)", transition: "all 0.15s",
                          boxShadow: "none",
                        }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: sel ? "var(--accent-muted)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={17} color={sel ? "var(--accent)" : "var(--text-secondary)"} strokeWidth={1.8} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: sel ? "var(--accent)" : "var(--text)" }}>{m.label}</div>
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{m.desc}</div>
                          </div>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", border: sel ? "2px solid var(--accent)" : "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bank selector for bank_transfer */}
                  {method === "bank_transfer" && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Pilih Bank</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7 }}>
                        {BANKS.map(b => (
                          <button key={b.id} onClick={() => setBank(b.id)} style={{
                            padding: "8px 6px", borderRadius: 8, border: bank === b.id ? `1.5px solid ${b.color}` : "1px solid var(--border)",
                            background: bank === b.id ? `${b.color}12` : "var(--surface)",
                            cursor: "pointer", fontFamily: "var(--font-body)",
                            fontSize: 11.5, fontWeight: 700, color: bank === b.id ? b.color : "var(--text-secondary)",
                            transition: "all 0.15s",
                          }}>{b.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {errorMsg && (
                <div style={{ background: "var(--danger-light)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>
                  {errorMsg}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: "100%", height: 42, fontSize: 14 }}
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? <><Loader2 size={14} style={{ animation: "spin 0.65s linear infinite" }} /> Memproses…</> : (
                  plan.price === 0 ? "Aktifkan Gratis" :
                  method === "snap" ? <><ExternalLink size={13} strokeWidth={2} /> Bayar via Snap</> :
                  method === "qris" ? <><QrCode size={13} strokeWidth={2} /> Generate QRIS</> :
                  <><Landmark size={13} strokeWidth={2} /> Dapatkan No. VA</>
                )}
              </button>
            </>
          )}

          {/* ── PAYING: SNAP ── */}
          {step === "paying" && method === "snap" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CreditCard size={28} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
                Halaman pembayaran Midtrans telah dibuka di tab baru.<br />Selesaikan pembayaran di sana, lalu status akan otomatis diperbarui.
              </p>
              <div style={{ background: "var(--bg)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Status</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: pollStatus === "PAID" ? "var(--success)" : "var(--warning)" }}>
                  {checking ? <Loader2 size={13} style={{ animation: "spin 0.65s linear infinite" }} /> : <Clock size={13} strokeWidth={2} />}
                  {pollStatus === "PAID" ? "Dibayar" : "Menunggu pembayaran…"}
                </span>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: "100%", gap: 6, marginBottom: 10 }}
                onClick={() => window.open(snapUrl, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink size={13} strokeWidth={2} /> Buka Kembali Halaman Bayar
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => checkStatus(orderId)} disabled={checking}>
                {checking ? "Memeriksa…" : "Periksa Status Manual"}
              </button>
            </div>
          )}

          {/* ── PAYING: QRIS ── */}
          {step === "paying" && method === "qris" && (
            <div style={{ textAlign: "center" }}>
              {qrData?.qrUrl ? (
                <img src={qrData.qrUrl} alt="QRIS QR Code" style={{ width: 200, height: 200, borderRadius: 12, border: "1px solid var(--border)", margin: "0 auto 14px", display: "block" }} />
              ) : (
                <div style={{ width: 200, height: 200, margin: "0 auto 14px", background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode size={64} strokeWidth={1} style={{ color: "var(--text-muted)" }} />
                </div>
              )}

              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                Scan menggunakan GoPay, OVO, Dana, ShopeePay, atau aplikasi perbankan
              </div>

              {qrData?.expiryTime && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: expirySecs < 60 ? "var(--danger-light)" : "var(--warning-light)", color: expirySecs < 60 ? "var(--danger)" : "var(--warning)", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                  <Clock size={13} strokeWidth={2} />
                  Berakhir dalam {expiryDisplay}
                </div>
              )}

              {qrData?.qrString && (
                <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "ui-monospace,monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{qrData.qrString.slice(0, 40)}…</span>
                  <CopyBtn text={qrData.qrString} />
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
                {checking ? <Loader2 size={13} style={{ animation: "spin 0.65s linear infinite", color: "var(--accent)" }} /> : <Loader2 size={13} style={{ color: "var(--text-muted)" }} />}
                Menunggu konfirmasi pembayaran…
              </div>

              <button className="btn btn-secondary btn-sm" onClick={() => checkStatus(orderId)} disabled={checking}>
                {checking ? "Memeriksa…" : "Periksa Status Sekarang"}
              </button>

              {orderId && (
                <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
                  Order ID: <span style={{ fontFamily: "ui-monospace,monospace" }}>{orderId}</span>
                </div>
              )}
            </div>
          )}

          {/* ── PAYING: BANK TRANSFER ── */}
          {step === "paying" && method === "bank_transfer" && vaData && (
            <div>
              {/* Bank header */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${bankInfo?.color || "#475569"}14`, border: `1px solid ${bankInfo?.color || "#475569"}30`, borderRadius: 10, padding: "8px 18px" }}>
                  <Landmark size={18} color={bankInfo?.color || "var(--text-secondary)"} strokeWidth={1.8} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: bankInfo?.color || "var(--text)" }}>
                    {BANKS.find(b => b.id === vaData.bank)?.label || vaData.bank?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* VA number */}
              {vaNumber ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Nomor Virtual Account</div>
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "1px" }}>
                      {vaNumber.va_number}
                    </span>
                    <CopyBtn text={vaNumber.va_number} />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 16, fontSize: 13, color: "var(--text-secondary)", textAlign: "center", padding: 16, background: "var(--bg)", borderRadius: 8 }}>
                  Hubungi bank Anda untuk virtual account
                </div>
              )}

              {/* Amount */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Total Transfer (tepat)</div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{formatRupiah(plan.price)}</span>
                  <CopyBtn text={String(plan.price)} />
                </div>
              </div>

              {/* Steps */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Cara Pembayaran</div>
                {[
                  "Buka aplikasi mobile banking / ATM",
                  `Pilih menu Transfer ke Virtual Account ${BANKS.find(b => b.id === vaData.bank)?.label || ""}`,
                  `Masukkan nomor VA: ${vaNumber?.va_number || "—"}`,
                  `Konfirmasi jumlah: ${formatRupiah(plan.price)}`,
                  "Selesaikan transaksi dan simpan bukti bayar",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 12.5, color: "var(--text-secondary)" }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-light)", color: "var(--accent)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <span style={{ lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-muted)", marginBottom: 10 }}>
                {checking ? <Loader2 size={13} style={{ animation: "spin 0.65s linear infinite", color: "var(--accent)" }} /> : <Clock size={13} strokeWidth={2} />}
                Menunggu konfirmasi transfer…
              </div>

              <button className="btn btn-secondary btn-sm" onClick={() => checkStatus(orderId)} disabled={checking} style={{ width: "100%" }}>
                {checking ? "Memeriksa…" : "Periksa Pembayaran"}
              </button>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--success-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", animation: "successPop 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
                <CheckCircle2 size={36} color="var(--success)" strokeWidth={1.8} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Langganan Aktif!</div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
                Paket <strong>{plan.name}</strong> berhasil diaktifkan. Nikmati semua fitur premium Inventio.
              </p>
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>
                Mulai Menggunakan
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {step === "error" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--danger-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <XCircle size={36} color="var(--danger)" strokeWidth={1.8} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Pembayaran Gagal</div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>{errorMsg}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Tutup</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBack}>Coba Lagi</button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes successPop { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}

const CM = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.48)",
    backdropFilter: "blur(2px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: 20, animation: "fadeIn 0.15s ease",
  },
  modal: {
    background: "var(--surface)", borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-modal)", width: "100%", maxWidth: 460,
    maxHeight: "90vh", overflowY: "auto",
    animation: "slideUp 0.22s cubic-bezier(0.16,1,0.3,1)",
  },
  header: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "18px 20px 14px",
    borderBottom: "1px solid var(--border-light)",
  },
  headerTitle: {
    fontFamily: "var(--font-display)", fontSize: 15.5, fontWeight: 600,
    color: "var(--text)", lineHeight: 1.3,
  },
  headerSub: { fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 },
  backBtn: {
    background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7,
    width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0, marginTop: 2,
  },
  closeBtn: {
    background: "var(--bg)", border: "none", borderRadius: 7,
    width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "var(--text-secondary)", fontSize: 14, flexShrink: 0,
  },
  body: { padding: "18px 20px 20px" },
  priceSummary: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "var(--bg)", borderRadius: "var(--radius)", padding: "13px 15px", marginBottom: 18,
  },
  priceSummaryLabel: { color: "var(--text-secondary)", fontSize: 13 },
  priceSummaryVal: {
    fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text)",
  },
};

// ── Expiry banner ─────────────────────────────────────────────────────
function ExpiryBanner({ subscription }) {
  if (!subscription?.endDate) return null;
  const endDate = new Date(subscription.endDate);
  const now = new Date();
  const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "var(--danger-light)", border: "1px solid rgba(220,38,38,0.2)",
        borderRadius: "var(--radius-lg)", padding: "14px 18px", marginBottom: 20,
        animation: "fadeIn 0.25s ease",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(220,38,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bell size={17} color="var(--danger)" strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 3 }}>
            Langganan Telah Berakhir
          </div>
          <div style={{ fontSize: 13, color: "#991B1B", lineHeight: 1.55 }}>
            Paket <strong>{subscription.plan?.name}</strong> berakhir pada {formatDate(subscription.endDate)}. Pilih paket baru untuk melanjutkan akses fitur premium.
          </div>
        </div>
      </div>
    );
  }

  if (diffDays <= 7) {
    return (
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "var(--warning-light)", border: "1px solid rgba(217,119,6,0.25)",
        borderRadius: "var(--radius-lg)", padding: "14px 18px", marginBottom: 20,
        animation: "fadeIn 0.25s ease",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(217,119,6,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bell size={17} color="var(--warning)" strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--warning)", marginBottom: 3 }}>
            Langganan Segera Berakhir
          </div>
          <div style={{ fontSize: 13, color: "#92400E", lineHeight: 1.55 }}>
            Paket <strong>{subscription.plan?.name}</strong> berakhir dalam <strong>{diffDays} hari</strong> ({formatDate(subscription.endDate)}). Perpanjang sekarang agar tidak terputus.
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Main page ─────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const location = useLocation();
  const autoChecked = useRef(false);

  const [plans, setPlans]           = useState([]);
  const [subscription, setSub]      = useState(null);
  const [loadingPlans, setLdPlans]  = useState(true);
  const [loadingSub, setLdSub]      = useState(true);
  const [selectedPlan, setSelected] = useState(null);
  const [toast, setToast]           = useState(null);

  const loadData = useCallback(async () => {
    setLdPlans(true); setLdSub(true);
    try { const d = await api.get("/plans"); setPlans(d.plans || []); } catch { setPlans([]); } finally { setLdPlans(false); }
    try { const d = await api.get("/subscriptions/me"); setSub(d.subscription); } catch { setSub(null); } finally { setLdSub(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-open checkout when redirected from register with a paid plan
  useEffect(() => {
    if (autoChecked.current) return;
    const planId = location.state?.autoCheckoutPlanId;
    if (!planId || plans.length === 0) return;
    const plan = plans.find(p => p.id === planId);
    if (plan && plan.price > 0) {
      setSelected(plan);
      autoChecked.current = true;
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [plans, location.state]);

  const subStatus = subscription ? STATUS_CFG[subscription.status] : null;
  const currentPlanId = subscription?.plan?.id;
  const hasActiveSubscription = subscription?.status === "ACTIVE" && (subscription?.plan?.price ?? 0) > 0;
  const isExpired = subscription?.endDate && new Date(subscription.endDate) < new Date();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Langganan</h1>
        <p className="page-subtitle">Kelola paket langganan dan akses fitur premium</p>
      </div>

      {/* Expiry notification banner */}
      {!loadingSub && subscription && <ExpiryBanner subscription={subscription} />}

      {/* Current subscription */}
      <div className="table-wrapper" style={{ marginBottom: 24 }}>
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            <Crown size={15} strokeWidth={1.8} /> Langganan Aktif
          </span>
          <button className="btn btn-ghost btn-sm" onClick={loadData}>
            <RefreshCw size={13} strokeWidth={2} /> Refresh
          </button>
        </div>
        {loadingSub ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : subscription ? (
          <div style={{ padding: "20px 22px" }}>
            <div className="sub-current-grid">
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Paket</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                  {subscription.plan?.name ?? "—"}
                </div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Status</div>
                {subStatus && (() => {
                  const Icon = subStatus.icon;
                  return (
                    <span className={`badge ${subStatus.cls}`} style={{ fontSize: 12.5 }}>
                      <Icon size={11} strokeWidth={2.5} /> {subStatus.label}
                    </span>
                  );
                })()}
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>
                  <CalendarDays size={11} style={{ display: "inline", marginRight: 3 }} /> Mulai
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{formatDate(subscription.startDate)}</div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>
                  <CalendarDays size={11} style={{ display: "inline", marginRight: 3 }} /> Berakhir
                </div>
                <div style={{
                  fontSize: 13.5, fontWeight: 500,
                  color: isExpired ? "var(--danger)" : "var(--text)",
                }}>
                  {formatDate(subscription.endDate)}
                  {isExpired && <span style={{ fontSize: 11, marginLeft: 6, fontWeight: 600, color: "var(--danger)" }}>Kedaluwarsa</span>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Crown size={36} style={{ color: "var(--text-muted)", marginBottom: 10, opacity: 0.4 }} />
            <div className="empty-state-title">Belum ada langganan aktif</div>
            <div className="empty-state-desc">Pilih paket di bawah untuk memulai</div>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="page-header" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
          {hasActiveSubscription ? "Paket Tersedia" : "Pilih Paket"}
        </h2>
        {hasActiveSubscription && (
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
            Anda sudah berlangganan paket aktif. Hubungi dukungan untuk mengubah paket.
          </p>
        )}
      </div>

      {loadingPlans ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : plans.length === 0 ? (
        <div className="table-wrapper">
          <div className="empty-state"><div className="empty-state-title">Tidak ada paket tersedia</div></div>
        </div>
      ) : (
        <div className="sub-plans-grid">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanId={currentPlanId}
              hasActiveSubscription={hasActiveSubscription}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {/* Checkout modal */}
      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onClose={() => setSelected(null)}
          onSuccess={() => {
            setSelected(null);
            setToast({ message: `Paket ${selectedPlan.name} berhasil diaktifkan!`, type: "success" });
            loadData();
          }}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
