import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import {
  Package, CheckCircle2, XCircle, Zap,
  Eye, EyeOff, Building2, User, Mail, Lock,
  ChevronRight, ArrowLeft,
} from "lucide-react";

function formatRupiah(val) {
  if (!val || val === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(val);
}

function toSlug(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
}

function featureLabel(key, val) {
  const LABELS = {
    forecast: "Forecast AI", addUser: "Undang Anggota",
    max_warehouses: "Maks. Gudang", max_products: "Maks. Produk",
    max_users: "Maks. Pengguna",
  };
  return {
    label: LABELS[key] || key,
    positive: typeof val === "boolean" ? val : true,
    value: typeof val === "boolean" ? null : String(val),
  };
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(searchParams.get("plan") || null);

  const [form, setForm] = useState({
    tenantName: "", tenantSlug: "",
    userName: "", userEmail: "",
    password: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/plans")
      .then(d => {
        const p = d.plans || [];
        setPlans(p);
        if (!selectedPlanId && p.length > 0) setSelectedPlanId(p[0].id);
      })
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleTenantName = (val) => {
    setForm(f => ({ ...f, tenantName: val, tenantSlug: toSlug(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (!form.tenantSlug) {
      setError("Nama bisnis tidak valid");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post("/tenants/register", {
        tenantName: form.tenantName,
        tenantSlug: form.tenantSlug,
        userName: form.userName,
        userEmail: form.userEmail,
        password: form.password,
        planId: selectedPlanId,
      });

      login({ userId: data.userId, tenantId: data.tenantId, tenantSlug: data.tenantSlug, role: "ADMIN" }, data.token);

      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      if (selectedPlan && selectedPlan.price > 0) {
        navigate(`/${data.tenantSlug}/subscription`, { state: { autoCheckoutPlanId: selectedPlanId } });
      } else {
        navigate(`/${data.tenantSlug}/dashboard`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div style={S.page}>
      <style>{`
        .rp-plan-opt:hover { border-color: #BFDBFE !important; background: #EFF6FF !important; }
        .rp-input-wrap:focus-within { border-color: #2563EB !important; }
        .rp-input::placeholder { color: #CBD5E1; }
        .rp-input:focus { outline: none; }
        .rp-submit:hover:not(:disabled) { background: rgb(15, 69, 185) !important; }
        .rp-eye:hover { color: #475569 !important; }
        .rp-back:hover { color: #475569 !important; }
      `}</style>

      {/* subtle dot bg */}
      <div style={S.dots} />

      {/* nav */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <Link to="/" className="rp-back" style={S.back}>
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
          <p style={{fontSize:13,color:"#94A3B8",margin:0}}>
            Sudah punya akun?{" "}
            <Link to="/login" style={{color:"#2563EB",textDecoration:"none",fontWeight:600}}>Masuk</Link>
          </p>
        </div>
      </nav>

      {/* main split */}
      <div style={S.main}>

        {/* LEFT: plan selection */}
        <div style={S.planCol}>
          <div style={S.planColInner}>
            <h2 style={S.planColTitle}>Pilih Paket</h2>
            <p style={S.planColSub}>Mulai gratis, upgrade kapan saja</p>

            {plansLoading ? (
              <div style={{padding:"32px 0",textAlign:"center",color:"#94A3B8",fontSize:13}}>
                Memuat paket...
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const features = plan.features ? Object.entries(plan.features) : [];
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className="rp-plan-opt"
                      style={{
                        background: isSelected ? "#EFF6FF" : "#FFFFFF",
                        border: isSelected ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                        boxShadow: "none",
                        borderRadius: 12, padding: "14px 15px",
                        cursor: "pointer", textAlign: "left", width: "100%",
                        transition: "all 0.18s", fontFamily: "var(--font-body)",
                      }}
                    >
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:6}}>
                        <div>
                          <div style={{fontFamily:"var(--font-display)",fontSize:14,fontWeight:700,color:"#0F172A",marginBottom:2}}>
                            {plan.name}
                          </div>
                          <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                            <span style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:800,color:isSelected?"#2563EB":"#0F172A"}}>
                              {formatRupiah(plan.price)}
                            </span>
                            {plan.price > 0 && <span style={{fontSize:11,color:"#94A3B8"}}>/bulan</span>}
                          </div>
                        </div>
                        {/* radio */}
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          border: isSelected ? "2px solid #2563EB" : "2px solid #CBD5E1",
                          background: "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: 2, transition: "all 0.15s",
                        }}>
                          {isSelected && <div style={{width:8,height:8,borderRadius:"50%",background:"#2563EB"}} />}
                        </div>
                      </div>

                      {plan.description && (
                        <p style={{fontSize:11.5,color:"#64748B",marginBottom:7,lineHeight:1.5}}>{plan.description}</p>
                      )}

                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        {features.slice(0, 5).map(([key, val]) => {
                          const { label, positive, value } = featureLabel(key, val);
                          return (
                            <div key={key} style={{display:"flex",alignItems:"center",gap:7,fontSize:11.5}}>
                              <span style={{color:positive?"#059669":"#CBD5E1",flexShrink:0,display:"flex"}}>
                                {typeof val === "boolean"
                                  ? (val ? <CheckCircle2 size={11} strokeWidth={2.5}/> : <XCircle size={11} strokeWidth={2}/>)
                                  : <Zap size={11} strokeWidth={2}/>}
                              </span>
                              <span style={{flex:1,color:"#64748B"}}>{label}</span>
                              {value && <span style={{fontSize:10.5,fontWeight:700,color:"#475569",fontFamily:"ui-monospace,monospace"}}>{value}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedPlan && selectedPlan.price > 0 && (
              <div style={{marginTop:14,padding:"11px 13px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:9}}>
                <p style={{fontSize:12,color:"#3730A3",lineHeight:1.55,margin:0}}>
                  <strong>Paket berbayar:</strong> Setelah daftar, halaman pembayaran akan langsung terbuka.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: form */}
        <div style={S.formCol}>
          <div style={S.formCard}>
            <div style={{marginBottom:22}}>
              <h1 style={S.formTitle}>Buat Akun Bisnis</h1>
              <p style={S.formSub}>
                {selectedPlan
                  ? <>Paket dipilih: <strong style={{color:"#2563EB"}}>{selectedPlan.name}</strong> — {formatRupiah(selectedPlan.price)}{selectedPlan.price > 0 ? "/bulan" : ""}</>
                  : "Lengkapi data bisnis Anda"}
              </p>
            </div>

            {error && (
              <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:9,padding:"10px 13px",marginBottom:16,fontSize:13,color:"#DC2626"}}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Tenant name */}
              <div style={{marginBottom:14}}>
                <label style={S.label}>Nama Bisnis</label>
                <div className="rp-input-wrap" style={S.inputWrap}>
                  <Building2 size={14} color="#94A3B8" strokeWidth={1.8} style={{flexShrink:0}} />
                  <input
                    className="rp-input"
                    type="text"
                    placeholder="Toko Maju Jaya"
                    value={form.tenantName}
                    onChange={e => handleTenantName(e.target.value)}
                    required
                    style={S.input}
                  />
                </div>
                {form.tenantSlug && (
                  <div style={{marginTop:5,fontSize:11.5,color:"#94A3B8"}}>
                    Slug: <span style={{color:"#2563EB",fontWeight:500}}>{form.tenantSlug}</span>
                  </div>
                )}
              </div>

              {/* Name + Email */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div>
                  <label style={S.label}>Nama Admin</label>
                  <div className="rp-input-wrap" style={S.inputWrap}>
                    <User size={14} color="#94A3B8" strokeWidth={1.8} style={{flexShrink:0}} />
                    <input
                      className="rp-input"
                      type="text"
                      placeholder="Nama Anda"
                      value={form.userName}
                      onChange={e => setField("userName", e.target.value)}
                      required
                      style={S.input}
                    />
                  </div>
                </div>
                <div>
                  <label style={S.label}>Email</label>
                  <div className="rp-input-wrap" style={S.inputWrap}>
                    <Mail size={14} color="#94A3B8" strokeWidth={1.8} style={{flexShrink:0}} />
                    <input
                      className="rp-input"
                      type="email"
                      placeholder="email@bisnis.com"
                      value={form.userEmail}
                      onChange={e => setField("userEmail", e.target.value)}
                      required
                      style={S.input}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
                <div>
                  <label style={S.label}>Password</label>
                  <div className="rp-input-wrap" style={S.inputWrap}>
                    <Lock size={14} color="#94A3B8" strokeWidth={1.8} style={{flexShrink:0}} />
                    <input
                      className="rp-input"
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 6 karakter"
                      value={form.password}
                      onChange={e => setField("password", e.target.value)}
                      required
                      style={{...S.input, flex:1}}
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowPw(p => !p)} style={S.eyeBtn}>
                      {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={S.label}>Konfirmasi Password</label>
                  <div className="rp-input-wrap" style={S.inputWrap}>
                    <Lock size={14} color="#94A3B8" strokeWidth={1.8} style={{flexShrink:0}} />
                    <input
                      className="rp-input"
                      type={showCpw ? "text" : "password"}
                      placeholder="Ulangi password"
                      value={form.confirmPassword}
                      onChange={e => setField("confirmPassword", e.target.value)}
                      required
                      style={{...S.input, flex:1}}
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowCpw(p => !p)} style={S.eyeBtn}>
                      {showCpw ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="rp-submit"
                disabled={loading}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  width:"100%", padding:"13px 24px", borderRadius:10,
                  background: loading ? "#3B82F6" : "#2563EB",
                  border:"none", color:"white",
                  fontFamily:"var(--font-body)", fontSize:15, fontWeight:600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition:"all 0.15s",
                }}
              >
                {loading ? "Mendaftarkan..." : (
                  <>
                    {selectedPlan?.price > 0 ? "Daftar & Lanjut ke Pembayaran" : "Daftar Gratis"}
                    <ChevronRight size={16} strokeWidth={2.5}/>
                  </>
                )}
              </button>
            </form>

            <p style={{marginTop:18,fontSize:12,color:"#94A3B8",textAlign:"center",lineHeight:1.6}}>
              Dengan mendaftar, Anda menyetujui{" "}
              <span style={{color:"#2563EB",cursor:"pointer"}}>Syarat & Ketentuan</span>{" "}
              dan <span style={{color:"#2563EB",cursor:"pointer"}}>Kebijakan Privasi</span> Inventio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    background: "#F7F6F2", minHeight: "100vh",
    color: "#0F172A", fontFamily: "var(--font-body)",
    position: "relative", overflowX: "hidden",
  },
  dots: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #CBD5E1 1px, transparent 1px)`,
    backgroundSize: "28px 28px",
    opacity: 0.4,
  },
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(247,246,242,0.94)", backdropFilter: "blur(14px)",
    borderBottom: "1px solid #E2E8F0",
  },
  navInner: {
    maxWidth: 1100, margin: "0 auto", padding: "0 28px",
    height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  back: {
    display: "flex", alignItems: "center", gap: 6,
    color: "#94A3B8", textDecoration: "none",
    fontSize: 13, fontWeight: 500, transition: "color 0.15s",
  },
  navLogo: { display: "flex", alignItems: "center", gap: 9, textDecoration: "none" },
  logoMark: {
    width: 28, height: 28,
    background: "linear-gradient(135deg,#2563EB,#3B82F6)",
    borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5,
    color: "#0F172A", letterSpacing: "-0.3px",
  },
  main: {
    position: "relative", zIndex: 1,
    maxWidth: 1100, margin: "0 auto", padding: "32px 28px 60px",
    display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 24, alignItems: "start",
  },
  planCol: {},
  planColInner: {
    background: "#FFFFFF", border: "1px solid #E2E8F0",
    borderRadius: 18, padding: "24px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  planColTitle: {
    fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
    color: "#0F172A", marginBottom: 4,
  },
  planColSub: { fontSize: 13, color: "#94A3B8", marginBottom: 18 },
  formCol: {},
  formCard: {
    background: "#FFFFFF", border: "1px solid #E2E8F0",
    borderRadius: 18, padding: "28px 26px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  formTitle: {
    fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
    color: "#0F172A", letterSpacing: "-0.4px", marginBottom: 6,
  },
  formSub: { fontSize: 13.5, color: "#64748B", lineHeight: 1.5 },
  label: {
    display: "block", fontSize: 12, fontWeight: 500,
    color: "#475569", marginBottom: 6, letterSpacing: "0.1px",
  },
  inputWrap: {
    display: "flex", alignItems: "center", gap: 9,
    background: "#F8FAFC", border: "1px solid #E2E8F0",
    borderRadius: 9, padding: "9px 12px", transition: "border-color 0.15s, box-shadow 0.15s",
  },
  input: {
    background: "transparent", border: "none", outline: "none",
    color: "#0F172A", fontSize: 13.5, fontFamily: "var(--font-body)",
    width: "100%",
  },
  eyeBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#CBD5E1", display: "flex", alignItems: "center",
    padding: 2, flexShrink: 0, transition: "color 0.15s",
  },
};
