import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { Warehouse, Plus, Pencil, Trash2, Search, MapPin } from "lucide-react";

const EMPTY_FORM = { name: "", location: "", description: "" };

export default function WarehousesPage() {
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
      const data = await api.get("/warehouses");
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
          (i.location ?? "").toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true, mode: "add", data: null });
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      location: item.location ?? "",
      description: item.description ?? "",
    });
    setModal({ open: true, mode: "edit", data: item });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.location.trim()) return;
    setSubmitting(true);
    try {
      if (modal.mode === "add") {
        await api.post("/warehouses", form);
        setToast({ message: "Gudang berhasil ditambahkan", type: "success" });
      } else {
        await api.put(`/warehouses/${modal.data.id}`, form);
        setToast({ message: "Gudang berhasil diperbarui", type: "success" });
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
      await api.del(`/warehouses/${deleteTarget.id}`);
      setToast({ message: "Gudang berhasil dihapus", type: "success" });
      setDeleteTarget(null);
      load();
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const isValid = form.name.trim() && form.location.trim();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen Gudang</h1>
        <p className="page-subtitle">Kelola lokasi penyimpanan inventaris Anda</p>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            Daftar Gudang
            <span className="table-count-badge">{filtered.length}</span>
          </span>
          <div className="table-toolbar-actions">
            <label className="search-input-wrap">
              <Search size={13} color="var(--text-muted)" />
              <input
                placeholder="Cari gudang..."
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
            <Warehouse
              size={36}
              style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }}
            />
            <div className="empty-state-title">Belum ada gudang</div>
            <div className="empty-state-desc">Tambahkan gudang pertama Anda</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nama Gudang</th>
                <th>Lokasi</th>
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
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        color: "var(--text-secondary)",
                        fontSize: 13,
                      }}
                    >
                      <MapPin size={16} />
                      {item.location}
                    </span>
                  </td>
                  <td className="td-muted">{item.description || "—"}</td>
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
        title={modal.mode === "add" ? "Tambah Gudang" : "Edit Gudang"}
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
          <label className="form-label">Nama Gudang *</label>
          <input
            className="form-input"
            placeholder="Masukkan nama gudang"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Lokasi *</label>
          <input
            className="form-input"
            placeholder="Contoh: Jl. Raya No. 1, Jakarta"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
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
        title="Hapus Gudang"
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
          Yakin ingin menghapus gudang{" "}
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
