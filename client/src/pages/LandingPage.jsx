import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package, BarChart3, Warehouse, Users,
  CheckCircle2, XCircle, Zap, ArrowRight, ChevronRight,
  ShieldCheck, Star, Boxes,
} from "lucide-react";

function formatRupiah(val) {
  if (!val || val === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(val);
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

const FEATURES = [
  {
    icon: Package, color: "#059669", bg: "#ECFDF5",
    title: "Stok Real-time",
    desc: "Pantau inventaris di semua gudang sekaligus. Notifikasi otomatis saat stok kritis sebelum kehabisan.",
  },
  {
    icon: BarChart3, color: "#0369A1", bg: "#F0F9FF",
    title: "Forecast AI",
    desc: "Prediksi permintaan dan pendapatan dengan kecerdasan buatan berbasis data histori bisnis Anda.",
  },
  {
    icon: Warehouse, color: "#B45309", bg: "#FFFBEB",
    title: "Multi-Gudang",
    desc: "Kelola stok di beberapa lokasi sekaligus. Transfer antar gudang dengan audit trail lengkap.",
  },
  {
    icon: ShieldCheck, color: "#059669", bg: "#ECFDF5",
    title: "Tim Kolaboratif",
    desc: "Undang anggota tim dengan kontrol akses berbasis peran Admin dan Member yang terpisah.",
  },
];

const STATS = [
  { value: "500+", label: "UMKM Aktif" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Dukungan" },
  { value: "0 Setup", label: "Langsung Pakai" },
];

const CHART_BARS = [55, 72, 48, 88, 65, 82, 50, 95, 70, 78];

export default function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then(r => r.json())
      .then(d => setPlans(d.plans || []))
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  return (
    <div style={S.page}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .lp-nav-link:hover { color: #0C1F17 !important; }
        .lp-nav-cta:hover { background: #047857 !important; box-shadow: 0 4px 18px rgba(5,150,105,0.28) !important; }
        .lp-feature-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 24px rgba(10,28,20,0.10) !important; }
        .lp-plan-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 24px rgba(10,28,20,0.10) !important; }
        .lp-plan-card-popular:hover { transform: translateY(-3px) !important; }
        .lp-plan-cta:hover { background: #F0FAF6 !important; border-color: rgba(5,150,105,0.3) !important; }
        .lp-plan-cta-popular:hover { background: #F0FAF6 !important; }
        .lp-footer-link:hover { color: #A7C4BB !important; }
        .lp-cta-primary:hover { background: #047857 !important; transform: translateY(-1px) !important; box-shadow: 0 8px 28px rgba(5,150,105,0.32) !important; }
        .lp-cta-sec:hover { color: #486058 !important; }
        .lp-stat-item { transition: background 0.15s; }
        .lp-stat-item:hover { background: #F4F7F5 !important; }
      `}</style>

      {/* dot grid */}
      <div style={S.dots} />
      {/* ambient orbs */}
      <div style={{...S.orb, width:700, height:700, background:"radial-gradient(circle,rgba(5,150,105,0.08) 0%,transparent 65%)", top:-200, right:-150}} />
      <div style={{...S.orb, width:500, height:500, background:"radial-gradient(circle,rgba(5,150,105,0.05) 0%,transparent 65%)", bottom:"8%", left:-180}} />

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <Link to="/" style={S.navLogo}>
            <div style={S.logoMark}>
              <Boxes size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={S.logoText}>Inventio</span>
          </Link>
          <div style={S.navRight}>
            <Link to="/login" className="lp-nav-link" style={S.navLink}>Masuk</Link>
            <Link to="/register" className="lp-nav-cta" style={S.navCta}>
              Mulai Gratis <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={S.hero}>
        <div style={S.heroLeft}>
          <div style={S.heroBadge}>
            <span style={S.badgeDot} />
            Platform Inventaris #1 untuk UMKM Indonesia
          </div>
          <h1 style={S.heroTitle}>
            Kelola Inventaris,<br />
            <span style={S.heroAccent}>Kembangkan Bisnis</span>
          </h1>
          <p style={S.heroSub}>
            Sistem manajemen inventaris modern untuk UMKM Indonesia.
            Stok real-time, multi-gudang, forecast AI — semua dalam satu platform.
          </p>
          <div style={S.heroBtns}>
            <Link to="/register" className="lp-cta-primary" style={S.ctaPrimary}>
              Mulai Gratis Sekarang <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link to="/login" className="lp-cta-sec" style={S.ctaSec}>
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={S.heroRight}>
          <div style={S.mockCard}>
            <div style={S.mockBar}>
              <div style={{display:"flex",gap:5}}>
                {["#EF4444","#F59E0B","#10B981"].map(c => (
                  <span key={c} style={{width:9,height:9,borderRadius:"50%",background:c,display:"block"}} />
                ))}
              </div>
              <span style={S.mockTitle}>Dashboard — Inventio</span>
              <div />
            </div>
            <div style={S.mockBody}>
              {/* mini sidebar */}
              <div style={S.mockSidebar}>
                <div style={{height:7,borderRadius:4,background:"rgba(5,150,105,0.8)",marginBottom:10}} />
                {[1,2,3].map(i => (
                  <div key={i} style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.12)",marginBottom:10}} />
                ))}
              </div>
              {/* content */}
              <div style={{flex:1}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:12}}>
                  {[
                    { label:"Total Produk", val:"1.248", color:"#059669" },
                    { label:"Stok Kritis",  val:"12",    color:"#DC2626" },
                    { label:"Transaksi",    val:"847",   color:"#0369A1" },
                  ].map(s => (
                    <div key={s.label} style={{
                      background:"white",
                      border:"1px solid #E2EAE6",
                      borderRadius:8,
                      padding:"9px 9px",
                      boxShadow:"0 1px 3px rgba(10,28,20,0.06)",
                      borderLeft:`2.5px solid ${s.color}`,
                    }}>
                      <div style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,color:s.color,lineHeight:1.2}}>{s.val}</div>
                      <div style={{fontSize:9,color:"#8AA89F",marginTop:1}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* chart */}
                <div style={{
                  display:"flex",alignItems:"flex-end",gap:3,height:52,marginBottom:12,
                  background:"white",borderRadius:8,padding:"8px",
                  border:"1px solid #E2EAE6",boxShadow:"0 1px 3px rgba(10,28,20,0.04)",
                }}>
                  {CHART_BARS.map((h,i) => (
                    <div key={i} style={{
                      flex:1,borderRadius:2,minHeight:3,height:`${h}%`,
                      background: i===7 ? "#059669" : "#D1FAE5",
                    }} />
                  ))}
                </div>
                {/* rows */}
                {[
                  { name:"Beras Premium 5kg", ok:true },
                  { name:"Minyak Goreng 2L",  ok:false },
                  { name:"Gula Pasir 1kg",    ok:true },
                ].map(r => (
                  <div key={r.name} style={{
                    display:"flex",alignItems:"center",gap:7,padding:"6px 8px",
                    background:"white",border:"1px solid #E2EAE6",
                    borderRadius:6,marginBottom:4,
                    boxShadow:"0 1px 2px rgba(10,28,20,0.03)",
                  }}>
                    <span style={{
                      width:5,height:5,borderRadius:"50%",
                      background:r.ok?"#10B981":"#EF4444",
                      display:"block",flexShrink:0,
                    }} />
                    <span style={{flex:1,fontSize:10.5,color:"#486058",fontWeight:500}}>{r.name}</span>
                    <span style={{
                      fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:9,
                      background:r.ok?"#ECFDF5":"#FEF2F2",
                      color:r.ok?"#059669":"#DC2626",
                    }}>{r.ok?"Normal":"Kritis"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={S.statsBar}>
        {STATS.map((s, i) => (
          <div key={s.label} className="lp-stat-item" style={{
            ...S.statItem,
            borderRight: i < STATS.length - 1 ? "1px solid #DDE8E3" : "none",
          }}>
            <div style={S.statVal}>{s.value}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={S.section}>
        <div style={S.inner}>
          <div style={S.sectionHead}>
            <p style={S.sectionTag}>Fitur Unggulan</p>
            <h2 style={S.sectionH2}>Semua yang Anda Butuhkan</h2>
            <p style={S.sectionDesc}>Dibangun khusus untuk cara kerja UMKM Indonesia</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18}}>
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="lp-feature-card" style={{
                  background:"#FFFFFF",
                  border:"1px solid #DDE8E3",
                  borderRadius:16, padding:"28px 26px",
                  boxShadow:"0 2px 8px rgba(10,28,20,0.06)",
                  transition:"all 0.22s",
                }}>
                  <div style={{
                    width:46,height:46,borderRadius:12,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    background:f.bg,marginBottom:18,
                  }}>
                    <Icon size={20} color={f.color} strokeWidth={1.8} />
                  </div>
                  <h3 style={{
                    fontFamily:"var(--font-display)",
                    fontSize:16.5,fontWeight:700,
                    color:"#0C1F17",marginBottom:9,
                  }}>{f.title}</h3>
                  <p style={{fontSize:14,color:"#486058",lineHeight:1.68}}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{...S.section, background:"#EBF1EE"}}>
        <div style={S.inner}>
          <div style={S.sectionHead}>
            <p style={S.sectionTag}>Harga</p>
            <h2 style={S.sectionH2}>Paket yang Sesuai Bisnis Anda</h2>
            <p style={S.sectionDesc}>Mulai gratis, upgrade kapan saja tanpa komitmen</p>
          </div>

          {plansLoading ? (
            <div style={{textAlign:"center",padding:"48px",color:"#8AA89F",fontSize:14,fontFamily:"var(--font-body)"}}>
              Memuat paket...
            </div>
          ) : plans.length === 0 ? (
            <div style={{textAlign:"center",padding:"48px",color:"#8AA89F",fontSize:14,fontFamily:"var(--font-body)"}}>
              Tidak ada paket tersedia saat ini.
            </div>
          ) : (
            <div style={{
              display:"grid",
              gridTemplateColumns:`repeat(${Math.min(plans.length,3)},1fr)`,
              gap:20,alignItems:"start",
            }}>
              {plans.map((plan, idx) => {
                const isPopular = idx === 1 && plans.length > 1;
                const features = plan.features ? Object.entries(plan.features) : [];
                return (
                  <div key={plan.id} className={isPopular ? "lp-plan-card-popular" : "lp-plan-card"} style={{
                    background: isPopular ? "#059669" : "#FFFFFF",
                    border: isPopular ? "none" : "1px solid #DDE8E3",
                    boxShadow: isPopular
                      ? "0 8px 32px rgba(5,150,105,0.28)"
                      : "0 2px 8px rgba(10,28,20,0.05)",
                    borderRadius:18, padding:"28px 22px",
                    display:"flex", flexDirection:"column", gap:12,
                    position:"relative", transition:"all 0.2s",
                  }}>
                    {isPopular && (
                      <div style={{
                        position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                        background:"#0B1A26",
                        color:"white", fontSize:11, fontWeight:600,
                        padding:"4px 14px", borderRadius:20, whiteSpace:"nowrap",
                        letterSpacing:"0.3px",
                        display:"flex", alignItems:"center", gap:5,
                      }}>
                        <Star size={9} strokeWidth={2.5} style={{fill:"#FCD34D",stroke:"#FCD34D"}} />
                        Paling Populer
                      </div>
                    )}
                    <div style={{
                      fontFamily:"var(--font-display)",
                      fontSize:17,fontWeight:700,
                      color:isPopular?"white":"#0C1F17",
                      marginTop:isPopular?8:0,
                    }}>
                      {plan.name}
                    </div>
                    <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                      <span style={{
                        fontFamily:"var(--font-display)",
                        fontSize:28,fontWeight:800,
                        color:isPopular?"white":"#0C1F17",
                        letterSpacing:"-0.5px",
                      }}>
                        {formatRupiah(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span style={{fontSize:12.5,color:isPopular?"rgba(255,255,255,0.6)":"#8AA89F",fontFamily:"var(--font-body)"}}>/bulan</span>
                      )}
                    </div>
                    {plan.description && (
                      <p style={{
                        fontSize:12.5,
                        color:isPopular?"rgba(255,255,255,0.7)":"#486058",
                        lineHeight:1.55,
                        fontFamily:"var(--font-body)",
                      }}>{plan.description}</p>
                    )}
                    <div style={{display:"flex",flexDirection:"column",gap:8,flex:1}}>
                      {features.map(([key, val]) => {
                        const { label, positive, value } = featureLabel(key, val);
                        return (
                          <div key={key} style={{display:"flex",alignItems:"center",gap:8,fontSize:12.5,fontFamily:"var(--font-body)"}}>
                            <span style={{
                              color: positive
                                ? (isPopular ? "#6EE7B7" : "#059669")
                                : (isPopular ? "rgba(255,255,255,0.3)" : "#CBD5E1"),
                              flexShrink:0,display:"flex",
                            }}>
                              {typeof val === "boolean"
                                ? (val ? <CheckCircle2 size={12} strokeWidth={2.5}/> : <XCircle size={12} strokeWidth={2}/>)
                                : <Zap size={12} strokeWidth={2}/>}
                            </span>
                            <span style={{flex:1,color:isPopular?"rgba(255,255,255,0.8)":"#486058"}}>{label}</span>
                            {value && (
                              <span style={{
                                fontSize:11,fontWeight:700,
                                color:isPopular?"white":"#0C1F17",
                                fontFamily:"ui-monospace,monospace",
                              }}>{value}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Link
                      to={`/register?plan=${plan.id}`}
                      className={isPopular ? "lp-plan-cta-popular" : "lp-plan-cta"}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                        background: isPopular ? "white" : "#F4F7F5",
                        border: isPopular ? "none" : "1px solid #DDE8E3",
                        color: isPopular ? "#059669" : "#0C1F17",
                        textDecoration:"none",
                        fontSize:13.5, fontWeight:600,
                        fontFamily:"var(--font-body)",
                        padding:"11px 18px", borderRadius:10, marginTop:6,
                        transition:"all 0.15s",
                      }}
                    >
                      {plan.price === 0 ? "Mulai Gratis" : "Pilih Paket"}
                      <ChevronRight size={14} strokeWidth={2.5} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        position:"relative", zIndex:1,
        background:"linear-gradient(135deg, #047857 0%, #059669 50%, #10B981 100%)",
        padding:"88px 32px", textAlign:"center",
        overflow:"hidden",
      }}>
        {/* subtle texture overlay */}
        <div style={{
          position:"absolute",inset:0,
          backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize:"24px 24px",
          pointerEvents:"none",
        }} />
        <div style={{maxWidth:580,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:20,position:"relative",zIndex:1}}>
          <h2 style={{
            fontFamily:"var(--font-display)",
            fontSize:42,fontWeight:800,
            color:"white",letterSpacing:"-1px",lineHeight:1.1,
          }}>
            Siap Memulai?
          </h2>
          <p style={{fontSize:15.5,color:"rgba(255,255,255,0.78)",lineHeight:1.65,fontFamily:"var(--font-body)"}}>
            Bergabung dengan ratusan UMKM yang sudah mempercayai Inventio untuk kelola bisnis mereka.
          </p>
          <Link to="/register" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"white", color:"#059669",
            textDecoration:"none",
            fontSize:14, fontWeight:700,
            fontFamily:"var(--font-body)",
            padding:"13px 28px", borderRadius:10,
            boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
            transition:"all 0.15s",
          }}>
            Daftar Gratis Sekarang <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"#0B1A26",padding:"28px 32px"}}>
        <div style={{
          maxWidth:1100,margin:"0 auto",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          gap:20,flexWrap:"wrap",
        }}>
          <Link to="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none"}}>
            <div style={S.logoMark}>
              <Boxes size={12} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily:"var(--font-display)",
              fontWeight:700,fontSize:15,
              color:"white",letterSpacing:"-0.2px",
            }}>Inventio</span>
          </Link>
          <p style={{
            fontSize:12,
            color:"#486058",
            fontFamily:"var(--font-body)",
          }}>© 2025 Inventio. Platform inventaris untuk UMKM Indonesia.</p>
          <div style={{display:"flex",gap:20}}>
            {[{to:"/login",label:"Masuk"},{to:"/register",label:"Daftar"}].map(l => (
              <Link key={l.to} to={l.to} className="lp-footer-link" style={{
                fontSize:13,color:"#486058",
                textDecoration:"none",
                fontFamily:"var(--font-body)",
                transition:"color 0.15s",
              }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const S = {
  page: {
    background: "#F4F7F5",
    minHeight: "100dvh",
    color: "#0C1F17",
    fontFamily: "var(--font-body)",
    position: "relative",
    overflowX: "hidden",
  },
  dots: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #C6D9D0 1px, transparent 1px)`,
    backgroundSize: "28px 28px",
    opacity: 0.4,
  },
  orb: {
    position: "fixed", borderRadius: "50%",
    filter: "blur(90px)", pointerEvents: "none", zIndex: 0,
  },
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(244,247,245,0.92)", backdropFilter: "blur(16px)",
    borderBottom: "1px solid #DDE8E3",
  },
  navInner: {
    maxWidth: 1100, margin: "0 auto", padding: "0 32px",
    height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  navLogo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  logoMark: {
    width: 30, height: 30,
    background: "linear-gradient(135deg, #059669, #10B981)",
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
  },
  logoText: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
    color: "#0C1F17", letterSpacing: "-0.3px",
  },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  navLink: {
    color: "#486058", textDecoration: "none",
    fontSize: 13.5, fontWeight: 500, transition: "color 0.15s",
    fontFamily: "var(--font-body)",
  },
  navCta: {
    background: "#059669", color: "white",
    textDecoration: "none", fontSize: 13, fontWeight: 600,
    padding: "8px 18px", borderRadius: 8,
    transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "var(--font-body)",
    boxShadow: "0 2px 8px rgba(5,150,105,0.2)",
  },
  hero: {
    position: "relative", zIndex: 1,
    maxWidth: 1100, margin: "0 auto", padding: "80px 32px 60px",
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center",
  },
  heroLeft: {},
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "#ECFDF5", border: "1px solid rgba(5,150,105,0.25)",
    color: "#059669", fontSize: 12, fontWeight: 600,
    padding: "5px 12px", borderRadius: 20, marginBottom: 22, letterSpacing: "0.2px",
    fontFamily: "var(--font-body)",
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: "50%", background: "#059669",
    display: "block", animation: "pulse-dot 2s ease-in-out infinite",
  },
  heroTitle: {
    fontFamily: "var(--font-display)", fontSize: 50, fontWeight: 800,
    color: "#0C1F17", letterSpacing: "-1.5px", lineHeight: 1.06, marginBottom: 18,
  },
  heroAccent: {
    background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  heroSub: {
    fontSize: 15.5, lineHeight: 1.72, color: "#486058", marginBottom: 34,
    fontFamily: "var(--font-body)",
  },
  heroBtns: { display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" },
  ctaPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "#059669", color: "white",
    textDecoration: "none", fontSize: 14, fontWeight: 600,
    padding: "12px 24px", borderRadius: 10,
    transition: "all 0.15s", whiteSpace: "nowrap",
    fontFamily: "var(--font-body)",
    boxShadow: "0 4px 16px rgba(5,150,105,0.25)",
  },
  ctaSec: {
    color: "#8AA89F", textDecoration: "none",
    fontSize: 13.5, fontWeight: 500, transition: "color 0.15s",
    fontFamily: "var(--font-body)",
  },
  heroRight: { position: "relative", zIndex: 1 },
  mockCard: {
    background: "#EEF3EF",
    border: "1px solid #D2DED8",
    borderRadius: 14, overflow: "hidden",
    boxShadow: "0 24px 64px rgba(10,28,20,0.14), 0 4px 16px rgba(10,28,20,0.07)",
  },
  mockBar: {
    background: "#E1EBE5", borderBottom: "1px solid #D2DED8",
    padding: "9px 14px", display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 10,
  },
  mockTitle: { fontSize: 10.5, color: "#8AA89F", fontFamily: "ui-monospace,monospace" },
  mockBody: { padding: "12px", display: "flex", gap: 10 },
  mockSidebar: {
    width: 32, flexShrink: 0,
    background: "#0B1A26", borderRadius: 8, padding: "10px 6px",
  },
  statsBar: {
    position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto",
    padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    background: "white",
    borderTop: "1px solid #DDE8E3", borderBottom: "1px solid #DDE8E3",
    boxShadow: "0 1px 0 #EBF1EE",
  },
  statItem: { textAlign: "center", padding: "28px 20px" },
  statVal: {
    fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800,
    color: "#059669", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 5,
  },
  statLbl: { fontSize: 12, color: "#8AA89F", fontWeight: 500, fontFamily: "var(--font-body)" },
  section: { position: "relative", zIndex: 1, padding: "80px 0" },
  inner: { maxWidth: 1100, margin: "0 auto", padding: "0 32px" },
  sectionHead: { textAlign: "center", marginBottom: 52 },
  sectionTag: {
    display: "inline-block", fontSize: 11, fontWeight: 700,
    letterSpacing: "2.5px", textTransform: "uppercase",
    color: "#059669", marginBottom: 12,
    fontFamily: "var(--font-body)",
  },
  sectionH2: {
    fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800,
    color: "#0C1F17", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 13,
  },
  sectionDesc: {
    fontSize: 15, color: "#486058", lineHeight: 1.65,
    fontFamily: "var(--font-body)",
  },
};
