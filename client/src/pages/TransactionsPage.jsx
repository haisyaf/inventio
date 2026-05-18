import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import {
  Receipt,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  typeId: "",
  warehouseId: "",
  supplierId: "",
  date: today(),
  description: "",
  items: [{ productId: "", quantity: 1, price: 0 }],
};

export default function TransactionsPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [txTypes, setTxTypes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

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

  const openModal = async () => {
    setForm(EMPTY_FORM);
    setModal(true);
    try {
      const [types, wh, sup, prod] = await Promise.all([
        api.get("/transaction-types"),
        api.get("/warehouses"),
        api.get("/suppliers"),
        api.get("/products"),
      ]);
      setTxTypes(types);
      setWarehouses(wh);
      setSuppliers(sup);
      setProducts(prod);
    } catch (e) {
      setToast({ message: "Gagal memuat data form: " + e.message, type: "error" });
    }
  };

  const closeModal = () => setModal(false);

  const setField = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", quantity: 1, price: 0 }],
    }));

  const removeItem = (idx) =>
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));

  const setItemField = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((row, i) => {
        if (i !== idx) return row;
        if (key === "productId") {
          const prod = products.find((p) => p.id === value);
          return { ...row, productId: value, price: prod?.price ?? row.price };
        }
        return { ...row, [key]: value };
      }),
    }));

  const total = form.items.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.price || 0),
    0
  );

  const handleSubmit = async () => {
    if (!form.typeId || !form.warehouseId || !form.supplierId) {
      setToast({ message: "Tipe transaksi, gudang, dan supplier wajib diisi", type: "error" });
      return;
    }
    const validItems = form.items.every(
      (row) => row.productId && Number(row.quantity) > 0 && Number(row.price) >= 0
    );
    if (!validItems) {
      setToast({ message: "Semua baris item harus lengkap dan valid", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/transactions", {
        typeId: form.typeId,
        warehouseId: form.warehouseId,
        supplierId: form.supplierId,
        date: new Date(form.date).toISOString(),
        description: form.description,
        items: form.items.map((row) => ({
          productId: row.productId,
          quantity: Number(row.quantity),
          price: Number(row.price),
        })),
      });
      setToast({ message: "Transaksi berhasil dibuat", type: "success" });
      closeModal();
      load();
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

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

  const fmtIDR = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Riwayat seluruh transaksi stok masuk dan keluar</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={14} strokeWidth={2.5} />
          Buat Transaksi
        </button>
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
            <Receipt size={36} style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }} />
            <div className="empty-state-title">Belum ada transaksi</div>
            <div className="empty-state-desc">
              Klik "Buat Transaksi" untuk mencatat stok masuk atau keluar
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
                <th>Total</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const dir = getDirectionInfo(tx.type?.direction);
                const totalAmount = Array.isArray(tx.items)
                  ? tx.items.reduce((s, it) => s + Number(it.subtotal ?? 0), 0)
                  : null;
                const totalQty = Array.isArray(tx.items)
                  ? tx.items.reduce((s, it) => s + Number(it.quantity ?? 0), 0)
                  : null;
                return (
                  <tr key={tx.id}>
                    <td>
                      <span className="td-mono">
                        #{(tx.id ?? "").slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="td-muted">
                      {new Date(tx.date ?? tx.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
                        <span className="td-mono">···{(tx.warehouseId ?? "").slice(-6)}</span>
                      )}
                    </td>
                    <td className="td-muted">{tx.supplier?.name ?? "—"}</td>
                    <td>
                      {totalAmount !== null ? (
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                          {fmtIDR(totalAmount)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      {totalQty !== null ? (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-secondary)" }}>
                          {totalQty.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modal}
        onClose={closeModal}
        title="Buat Transaksi"
        maxWidth="620px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Row 1: Tipe + Gudang */}
          <div className="form-row" style={{ marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tipe Transaksi <span style={{ color: "var(--danger)" }}>*</span></label>
              <select
                className="form-select"
                value={form.typeId}
                onChange={(e) => setField("typeId", e.target.value)}
              >
                <option value="">Pilih tipe...</option>
                {txTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.direction === "IN" ? "Masuk" : "Keluar"})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gudang <span style={{ color: "var(--danger)" }}>*</span></label>
              <select
                className="form-select"
                value={form.warehouseId}
                onChange={(e) => setField("warehouseId", e.target.value)}
              >
                <option value="">Pilih gudang...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Supplier + Tanggal */}
          <div className="form-row" style={{ marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Supplier <span style={{ color: "var(--danger)" }}>*</span></label>
              <select
                className="form-select"
                value={form.supplierId}
                onChange={(e) => setField("supplierId", e.target.value)}
              >
                <option value="">Pilih supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tanggal</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="form-textarea"
              placeholder="Keterangan transaksi (opsional)..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              style={{ minHeight: 60 }}
            />
          </div>

          {/* Items */}
          <div style={{
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            marginBottom: 4,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 13px",
              background: "var(--surface-raised)",
              borderBottom: "1px solid var(--border-light)",
            }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--text-secondary)",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
              }}>
                Item ({form.items.length})
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={addItem}
                type="button"
                style={{ gap: 4 }}
              >
                <Plus size={12} strokeWidth={2.5} />
                Tambah Baris
              </button>
            </div>

            <div style={{ padding: "10px 13px", display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Header row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 72px 100px 28px",
                gap: 8,
                paddingBottom: 4,
                borderBottom: "1px solid var(--border-light)",
              }}>
                {["Produk", "Qty", "Harga (Rp)", ""].map((h) => (
                  <span key={h} style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>{h}</span>
                ))}
              </div>

              {form.items.map((row, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 72px 100px 28px",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <select
                    className="form-select"
                    value={row.productId}
                    onChange={(e) => setItemField(idx, "productId", e.target.value)}
                    style={{ fontSize: 13 }}
                  >
                    <option value="">Pilih produk...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => setItemField(idx, "quantity", e.target.value)}
                    style={{ fontSize: 13, textAlign: "center" }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    min={0}
                    value={row.price}
                    onChange={(e) => setItemField(idx, "price", e.target.value)}
                    style={{ fontSize: 13 }}
                  />
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => removeItem(idx)}
                    disabled={form.items.length === 1}
                    type="button"
                    title="Hapus baris"
                    style={{ width: 28, height: 28, color: "var(--danger)", opacity: form.items.length === 1 ? 0.3 : 1 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Total */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 10,
                paddingTop: 8,
                borderTop: "1px solid var(--border-light)",
                marginTop: 2,
              }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>
                  Total
                </span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--accent)",
                  letterSpacing: "-0.3px",
                }}>
                  {fmtIDR(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="toast-container">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
