import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, Search } from "lucide-react";

const PAGE_TITLES = {
  "dashboard":    "Dashboard",
  "products":     "Manajemen Produk",
  "categories":   "Kategori Produk",
  "warehouses":   "Manajemen Gudang",
  "suppliers":    "Manajemen Supplier",
  "stocks":       "Stok Inventaris",
  "transactions": "Transaksi",
  "forecasts":    "Forecast AI",
  "users":        "Pengguna",
  "subscription": "Langganan",
};

const PAGE_SUBTITLES = {
  "dashboard":    "Ringkasan bisnis Anda",
  "products":     "Kelola katalog produk",
  "categories":   "Organisasi kategori",
  "warehouses":   "Lokasi penyimpanan",
  "suppliers":    "Data pemasok barang",
  "stocks":       "Pantau level stok",
  "transactions": "Riwayat transaksi",
  "forecasts":    "Prediksi berbasis AI",
  "users":        "Akses & tim",
  "subscription": "Paket & tagihan",
};

export default function Header() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const title = PAGE_TITLES[segment] ?? "Inventio";
  const subtitle = PAGE_SUBTITLES[segment] ?? "";
  const initials = user?.role === "ADMIN" ? "A" : "M";

  return (
    <header className="header">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <h1 className="header-title">{title}</h1>
        {subtitle && (
          <span style={{
            fontSize: 11.5,
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.3,
            marginTop: 1,
          }}>
            {subtitle}
          </span>
        )}
      </div>
      <div className="header-right">
        <button className="header-icon-btn" title="Notifikasi">
          <Bell size={15} strokeWidth={1.8} />
        </button>
        <div className="header-user-chip">
          <div className="header-avatar">{initials}</div>
          <span className="header-user-name">
            {user?.role === "ADMIN" ? "Administrator" : "Member"}
          </span>
        </div>
      </div>
    </header>
  );
}
