import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { Tags, Plus, Pencil, Trash2, Search } from "lucide-react";

const EMPTY_FORM = { name: "", description: "" };

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
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
      const data = await api.get("/categories");
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
          i.name.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true, mode: "add", data: null });
  };

  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description ?? "" });
    setModal({ open: true, mode: "edit", data: item });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (modal.mode === "add") {
        await api.post("/categories", form);
        setToast({ message: "Kategori berhasil ditambahkan", type: "success" });
      } else {
        await api.put(`/categories/${modal.data.id}`, form);
        setToast({ message: "Kategori berhasil diperbarui", type: "success" });
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
      await api.del(`/categories/${deleteTarget.id}`);
      setToast({ message: "Kategori berhasil dihapus", type: "success" });
      setDeleteTarget(null);
      load();
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kategori Produk</h1>
        <p className="page-subtitle">
          Kelola kategori untuk mengorganisir produk Anda
        </p>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            Daftar Kategori
            <span className="table-count-badge">{filtered.length}</span>
          </span>
          <div className="table-toolbar-actions">
            <label className="search-input-wrap">
              <Search size={13} color="var(--text-muted)" />
              <input
                placeholder="Cari kategori..."
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
            <Tags
              size={36}
              style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }}
            />
            <div className="empty-state-title">Belum ada kategori</div>
            <div className="empty-state-desc">Tambahkan kategori pertama Anda</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th>Dibuat</th>
                <th style={{ width: 80 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="td-primary">{item.name}</td>
                  <td className="td-muted">{item.description || "—"}</td>
                  <td className="td-muted">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEdit(item)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setDeleteTarget(item)}
                        title="Hapus"
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
        title={modal.mode === "add" ? "Tambah Kategori" : "Edit Kategori"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              Batal
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nama Kategori *</label>
          <input
            className="form-input"
            placeholder="Masukkan nama kategori"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea
            className="form-textarea"
            placeholder="Deskripsi opsional"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kategori"
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
          Yakin ingin menghapus kategori{" "}
          <strong style={{ color: "var(--text)" }}>{deleteTarget?.name}</strong>
          ? Tindakan ini tidak dapat dibatalkan.
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
