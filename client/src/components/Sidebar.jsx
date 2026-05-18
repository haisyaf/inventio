import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  Truck,
  BarChart2,
  Receipt,
  LogOut,
  Boxes,
  TrendingUp,
  Users,
  Crown,
} from "lucide-react";

const NAV_SEGMENTS = [
  { seg: "dashboard",   icon: LayoutDashboard, label: "Dashboard" },
  { seg: "products",    icon: Package,         label: "Produk" },
  { seg: "categories",  icon: Tags,            label: "Kategori" },
  { seg: "warehouses",  icon: Warehouse,       label: "Gudang" },
  { seg: "suppliers",   icon: Truck,           label: "Supplier" },
  { seg: "stocks",      icon: BarChart2,       label: "Stok" },
  { seg: "transactions",icon: Receipt,         label: "Transaksi" },
];

const EXTRA_SEGMENTS = [
  { seg: "forecasts",   icon: TrendingUp, label: "Forecast" },
  { seg: "users",       icon: Users,      label: "Pengguna" },
  { seg: "subscription",icon: Crown,      label: "Langganan" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = user?.role === "ADMIN" ? "Administrator" : "Member";
  const initials = (user?.role ?? "U").charAt(0);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Boxes size={17} color="white" strokeWidth={2.2} />
        </div>
        <div>
          <div className="sidebar-logo-text">Inventio</div>
          <div className="sidebar-logo-badge">UMKM</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu Utama</div>
        {NAV_SEGMENTS.map(({ seg, icon: Icon, label }) => (
          <NavLink
            key={seg}
            to={`/${slug}/${seg}`}
            className={({ isActive }) =>
              `sidebar-item${isActive ? " active" : ""}`
            }
          >
            <Icon size={15} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Fitur & Akun</div>
        {EXTRA_SEGMENTS.map(({ seg, icon: Icon, label }) => (
          <NavLink
            key={seg}
            to={`/${slug}/${seg}`}
            className={({ isActive }) =>
              `sidebar-item${isActive ? " active" : ""}`
            }
          >
            <Icon size={15} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{roleLabel}</div>
            <div className="sidebar-user-role">
              {slug ?? user?.tenantSlug ?? "—"}
            </div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={13} strokeWidth={2} />
          Keluar dari akun
        </button>
      </div>
    </aside>
  );
}
