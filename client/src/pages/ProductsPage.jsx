import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { Package, Plus, Pencil, Trash2, Search } from "lucide-react";

const EMPTY_FORM = { name: "", description: "", price: "", categoryId: "" };

function formatRupiah(val) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: "add", data: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setItems(prods);
      setCategories(cats);
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
          i.name.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true, mode: "add", data: null });
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      categoryId: item.categoryId ?? "",
    });
    setModal({ open: true, mode: "edit", data: item });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.categoryId || form.price === "") return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };
      if (modal.mode === "add") {
        await api.post("/products", payload);
        setToast({ message: "Produk berhasil ditambahkan", type: "success" });
      } else {
        await api.put(`/products/${modal.data.id}`, payload);
        setToast({ message: "Produk berhasil diperbarui", type: "success" });
      }
      closeModal();
      load();
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.del(`/products/${deleteTarget.id}`);
      setToast({ message: "Produk berhasil dihapus", type: "error" });
      setDeleteTarget(null);
      load();
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const isValid =
    form.name.trim() && form.categoryId && form.price !== "" && !isNaN(Number(form.price));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen Produk</h1>
        <p className="page-subtitle">
          Kelola produk dan katalog inventaris Anda
        </p>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            Daftar Produk
            <span className="table-count-badge">{filtered.length}</span>
          </span>
          <div className="table-toolbar-actions">
            <label className="search-input-wrap">
              <Search size={13} color="var(--text-muted)" />
              <input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={13} />
              Tambah
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package
              size={36}
              style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }}
            />
            <div className="empty-state-title">Belum ada produk</div>
            <div className="empty-state-desc">
              Tambahkan produk pertama Anda. Pastikan kategori sudah dibuat.
            </div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Deskripsi</th>
                <th>Dibuat</th>
                <th style={{ width: 80 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="td-primary">{item.name}</td>
                  <td>
                    <span className="badge badge-indigo">
                      {getCategoryName(item.categoryId)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: "var(--success)" }}>
                      {formatRupiah(item.price)}
                    </span>
                  </td>
                  <td className="td-muted">
                    {item.description
                      ? item.description.length > 40
                        ? item.description.slice(0, 40) + "…"
                        : item.description
                      : "—"}
                  </td>
                  <td className="td-muted">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setDeleteTarget(item)}
                        style={{ color: "var(--danger)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.mode === "add" ? "Tambah Produk" : "Edit Produk"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              Batal
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !isValid}
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nama Produk *</label>
          <input
            className="form-input"
            placeholder="Masukkan nama produk"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Kategori *</label>
            <select
              className="form-select"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Harga (Rp) *</label>
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea
            className="form-textarea"
            placeholder="Deskripsi produk opsional"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Produk"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Hapus
            </button>
          </>
        }
      >
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
          Yakin ingin menghapus produk{" "}
          <strong style={{ color: "var(--text)" }}>{deleteTarget?.name}</strong>
          ? Produk tidak dapat dihapus jika masih memiliki stok atau transaksi.
        </p>
      </Modal>

      {toast && (
        <div className="toast-container">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
