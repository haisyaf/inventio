import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Toast from "../components/Toast";
import { Receipt, Search, ArrowDownCircle, ArrowUpCircle, Circle } from "lucide-react";

export default function TransactionsPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/transactions");
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
    setFiltered(
      items.filter(
        (i) =>
          (i.id ?? "").toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  const getDirectionInfo = (direction) => {
    if (direction === "IN")
      return {
        icon: <ArrowDownCircle size={14} color="var(--success)" />,
        label: "Masuk",
        cls: "badge-green",
      };
    if (direction === "OUT")
      return {
        icon: <ArrowUpCircle size={14} color="var(--danger)" />,
        label: "Keluar",
        cls: "badge-red",
      };
    return {
      icon: <Circle size={14} color="var(--text-muted)" />,
      label: "—",
      cls: "badge-gray",
    };
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transaksi</h1>
        <p className="page-subtitle">
          Riwayat seluruh transaksi stok masuk dan keluar
        </p>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            Riwayat Transaksi
            <span className="table-count-badge">{filtered.length}</span>
          </span>
          <div className="table-toolbar-actions">
            <label className="search-input-wrap">
              <Search size={13} color="var(--text-muted)" />
              <input
                placeholder="Cari transaksi..."
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
            <Receipt
              size={36}
              style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }}
            />
            <div className="empty-state-title">Belum ada transaksi</div>
            <div className="empty-state-desc">
              Transaksi akan muncul setelah dibuat melalui API
            </div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Arah</th>
                <th>Deskripsi</th>
                <th>Gudang</th>
                <th>Supplier</th>
                <th>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const dir = getDirectionInfo(tx.type?.direction);
                return (
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
                    <td>
                      <span
                        className={`badge ${dir.cls}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        {dir.icon}
                        {dir.label}
                      </span>
                    </td>
                    <td className="td-primary">
                      {tx.description || (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="td-muted">
                      {tx.warehouse?.name ?? (
                        <span className="td-mono">
                          ···{(tx.warehouseId ?? "").slice(-6)}
                        </span>
                      )}
                    </td>
                    <td className="td-muted">
                      {tx.supplier?.name ?? "—"}
                    </td>
                    <td className="td-muted">
                      {new Date(tx.createdAt).toLocaleDateString("id-ID")}
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
