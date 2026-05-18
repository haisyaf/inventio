import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Toast from "../components/Toast";
import { BarChart2, Search, AlertTriangle } from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;

export default function StocksPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/stocks");
      setItems(data);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = items.filter(
      (i) =>
        (i.product?.name ?? "").toLowerCase().includes(q) ||
        (i.warehouse?.name ?? "").toLowerCase().includes(q)
    );
    if (filter === "low") result = result.filter((i) => i.quantity < LOW_STOCK_THRESHOLD);
    if (filter === "ok") result = result.filter((i) => i.quantity >= LOW_STOCK_THRESHOLD);
    setFiltered(result);
  }, [search, filter, items]);

  const maxQty = Math.max(...items.map((i) => i.quantity), 1);

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: "Habis", cls: "badge-red" };
    if (qty < LOW_STOCK_THRESHOLD) return { label: "Rendah", cls: "badge-amber" };
    return { label: "Tersedia", cls: "badge-green" };
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stok Inventaris</h1>
        <p className="page-subtitle">Pantau level stok di seluruh gudang Anda</p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "all", label: "Semua Stok" },
          { key: "low", label: `Rendah (< ${LOW_STOCK_THRESHOLD})` },
          { key: "ok", label: "Aman" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`btn btn-sm ${filter === key ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            Level Stok
            <span className="table-count-badge">{filtered.length}</span>
          </span>
          <div className="table-toolbar-actions">
            <label className="search-input-wrap">
              <Search size={13} color="var(--text-muted)" />
              <input
                placeholder="Cari produk atau gudang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <BarChart2
              size={36}
              style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }}
            />
            <div className="empty-state-title">Tidak ada data stok</div>
            <div className="empty-state-desc">
              Stok akan tercatat otomatis saat transaksi dibuat
            </div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Gudang</th>
                <th>Kuantitas</th>
                <th style={{ width: 220 }}>Level</th>
                <th>Status</th>
                <th>Terakhir Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = getStockStatus(item.quantity);
                const pct = Math.min((item.quantity / maxQty) * 100, 100);
                const barColor =
                  item.quantity === 0
                    ? "var(--danger)"
                    : item.quantity < LOW_STOCK_THRESHOLD
                    ? "var(--warning)"
                    : "var(--success)";

                return (
                  <tr key={item.id}>
                    <td className="td-primary">
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {item.quantity < LOW_STOCK_THRESHOLD && (
                          <AlertTriangle
                            size={13}
                            color="var(--warning)"
                            strokeWidth={2}
                          />
                        )}
                        {item.product?.name ?? "—"}
                      </span>
                    </td>
                    <td className="td-muted">{item.warehouse?.name ?? "—"}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {item.quantity}
                      </span>
                      <span
                        style={{
                          marginLeft: 4,
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        unit
                      </span>
                    </td>
                    <td>
                      <div className="stock-bar-wrap">
                        <div className="stock-bar">
                          <div
                            className="stock-bar-fill"
                            style={{ width: `${pct}%`, background: barColor }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            width: 30,
                            textAlign: "right",
                          }}
                        >
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="td-muted">
                      {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className="toast-container">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
