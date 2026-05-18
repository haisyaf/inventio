import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { Truck, Plus, Pencil, Trash2, Search, Mail, Phone } from "lucide-react";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };

export default function SuppliersPage() {
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
      const data = await api.get("/suppliers");
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
          (i.email ?? "").toLowerCase().includes(q) ||
          (i.phone ?? "").toLowerCase().includes(q)
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
      email: item.email ?? "",
      phone: item.phone ?? "",
      address: item.address ?? "",
    });
    setModal({ open: true, mode: "edit", data: item });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (modal.mode === "add") {
        await api.post("/suppliers", form);
        setToast({ message: "Supplier berhasil ditambahkan", type: "success" });
      } else {
        await api.put(`/suppliers/${modal.data.id}`, form);
        setToast({ message: "Supplier berhasil diperbarui", type: "success" });
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
      await api.del(`/suppliers/${deleteTarget.id}`);
      setToast({ message: "Supplier berhasil dihapus", type: "success" });
      setDeleteTarget(null);
      load();
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen Supplier</h1>
        <p className="page-subtitle">
          Kelola data pemasok produk inventaris Anda
        </p>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <span className="table-toolbar-title">
            Daftar Supplier
            <span className="table-count-badge">{filtered.length}</span>
          </span>
          <div className="table-toolbar-actions">
            <label className="search-input-wrap">
              <Search size={13} color="var(--text-muted)" />
              <input
                placeholder="Cari supplier..."
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
            <Truck
              size={36}
              style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }}
            />
            <div className="empty-state-title">Belum ada supplier</div>
            <div className="empty-state-desc">Tambahkan supplier pertama Anda</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nama Supplier</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Alamat</th>
                <th style={{ width: 80 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="td-primary">{item.name}</td>
                  <td>
                    {item.email ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 13,
                          color: "var(--accent)",
                        }}
                      >
                        <Mail size={11} />
                        {item.email}
                      </span>
                    ) : (
                      <span className="td-muted">—</span>
                    )}
                  </td>
                  <td>
                    {item.phone ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 13,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Phone size={11} />
                        {item.phone}
                      </span>
                    ) : (
                      <span className="td-muted">—</span>
                    )}
                  </td>
                  <td className="td-muted">{item.address || "—"}</td>
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
        title={modal.mode === "add" ? "Tambah Supplier" : "Edit Supplier"}
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
          <label className="form-label">Nama Supplier *</label>
          <input
            className="form-input"
            placeholder="Masukkan nama supplier"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="supplier@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Telepon</label>
            <input
              className="form-input"
              placeholder="08xx-xxxx-xxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Alamat</label>
          <textarea
            className="form-textarea"
            placeholder="Alamat lengkap supplier"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Supplier"
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
          Yakin ingin menghapus supplier{" "}
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
