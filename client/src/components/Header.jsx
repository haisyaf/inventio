import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";

const PAGE_TITLES = {
  "dashboard":   "Dashboard",
  "products":    "Manajemen Produk",
  "categories":  "Kategori Produk",
  "warehouses":  "Manajemen Gudang",
  "suppliers":   "Manajemen Supplier",
  "stocks":      "Stok Inventaris",
  "transactions":"Transaksi",
  "forecasts":   "Forecast AI",
  "users":       "Pengguna",
  "subscription":"Langganan",
};

export default function Header() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  // pathname = /:slug/segment — grab last segment
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const title = PAGE_TITLES[segment] ?? "Inventio";
  const initials = (user?.role ?? "U").charAt(0);

  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-right">
        <button className="header-icon-btn">
          <Bell size={15} strokeWidth={1.8} />
        </button>
        <div className="header-user-chip">
          <div className="header-avatar">{initials}</div>
          <span className="header-user-name">
            {user?.role === "ADMIN" ? "Admin" : "Member"}
          </span>
        </div>
      </div>
    </header>
  );
}
