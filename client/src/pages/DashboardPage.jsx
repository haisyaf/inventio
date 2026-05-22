import { useState, useEffect } from "react";
import { api } from "../lib/api";
import {
  Package,
  Truck,
  Receipt,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    suppliers: 0,
    transactions: 0,
    lowStock: 0,
  });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, suppliers, transactions, stocks] = await Promise.all([
          api.get("/products"),
          api.get("/suppliers"),
          api.get("/transactions"),
          api.get("/stocks"),
        ]);
        setStats({
          products: products.length,
          suppliers: suppliers.length,
          transactions: transactions.length,
          lowStock: stocks.filter((s) => s.quantity < 5).length,
        });
        setRecentTx(transactions.slice(0, 8));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STAT_CARDS = [
    {
      label: "Total Produk",
      value: stats.products,
      icon: Package,
      color: "#ECFDF5",
      iconColor: "rgb(37, 99, 235)",
      accent: "rgb(37, 99, 235)",
    },
    {
      label: "Total Supplier",
      value: stats.suppliers,
      icon: Truck,
      color: "#EFF6FF",
      iconColor: "#2563EB",
      accent: "#2563EB",
    },
    {
      label: "Total Transaksi",
      value: stats.transactions,
      icon: Receipt,
      color: "rgb(218, 247, 237)",
      iconColor: "rgb(12, 194, 97)",
      accent: "#0cc261",
    },
    {
      label: "Stok Rendah",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "#FEF2F2",
      iconColor: "#DC2626",
      accent: "#DC2626",
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan inventaris bisnis Anda</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Ringkasan inventaris bisnis Anda hari ini
        </p>
      </div>

      <div className="stats-grid">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, iconColor, accent }) => (
          <div className="stat-card" key={label} style={{ "--stat-accent": accent }}>
            <div className="stat-card-header">
              <span className="stat-card-label">{label}</span>
              <div className="stat-card-icon" style={{ background: color }}>
                <Icon size={17} color={iconColor} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-change">Total keseluruhan</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            Transaksi Terbaru
            <span className="table-count-badge">{recentTx.length}</span>
          </span>
          <Link
            to="/transactions"
            className="btn btn-ghost btn-sm"
            style={{ gap: 4 }}
          >
            Lihat semua <ArrowRight size={13} />
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-state">
            <Receipt
              size={38}
              style={{
                color: "var(--text-muted)",
                marginBottom: 12,
                opacity: 0.5,
              }}
            />
            <div className="empty-state-title">Belum ada transaksi</div>
            <div className="empty-state-desc">
              Transaksi akan muncul di sini setelah dibuat
            </div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Gudang</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className="td-mono">
                      #{(tx.id ?? "").slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="td-muted">
                    {new Date(tx.date ?? tx.createdAt).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </td>
                  <td className="td-primary">
                    {tx.description || (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className="td-mono">
                      {tx.warehouseId
                        ? `···${tx.warehouseId.slice(-6)}`
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
