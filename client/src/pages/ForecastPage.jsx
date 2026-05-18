import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Play,
  AlertTriangle,
  Package,
} from "lucide-react";

const FORECAST_TYPES = [
  {
    value: "stock_demand",
    label: "Permintaan Stok",
    icon: Package,
    color: "#2563EB",
    bg: "#EFF6FF",
    unit: "unit",
  },
  {
    value: "sales_revenue",
    label: "Pendapatan Penjualan",
    icon: TrendingUp,
    color: "#059669",
    bg: "#ECFDF5",
    unit: "IDR",
  },
  {
    value: "purchase_cost",
    label: "Biaya Pembelian",
    icon: TrendingDown,
    color: "#D97706",
    bg: "#FFFBEB",
    unit: "IDR",
  },
];

function formatValue(value, unit) {
  if (unit === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return `${Number(value).toLocaleString("id-ID")} ${unit}`;
}

function ForecastChart({ data, unit }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.forecastValue), 1);
  return (
    <div className="forecast-chart">
      {data.map((d, i) => {
        const pct = Math.max((d.forecastValue / max) * 100, 2);
        return (
          <div key={i} className="forecast-bar-col">
            <div className="forecast-bar-label-top">
              {unit === "IDR"
                ? `${(d.forecastValue / 1000).toFixed(0)}K`
                : d.forecastValue}
            </div>
            <div className="forecast-bar-track">
              <div
                className="forecast-bar-fill"
                style={{ height: `${pct}%` }}
              />
            </div>
            <div className="forecast-bar-date">
              {new Date(d.forecastDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ForecastPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedType, setSelectedType] = useState("stock_demand");
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState(null);
  const [featureBlocked, setFeatureBlocked] = useState(false);

  useEffect(() => {
    api
      .get("/products")
      .then((data) => {
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const loadForecast = useCallback(async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setSearched(true);
    setFeatureBlocked(false);
    try {
      const res = await api.get(
        `/forecasts?productId=${selectedProduct}&forecastType=${selectedType}`
      );
      setForecastData(res.data || []);
    } catch (e) {
      if (e.message?.includes("not available") || e.message?.includes("subscription")) {
        setFeatureBlocked(true);
      } else {
        setToast({ message: e.message, type: "error" });
      }
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, selectedType]);

  const handleRequest = async () => {
    if (!selectedProduct) return;
    setRequesting(true);
    try {
      const res = await api.post("/forecasts/request", {
        forecastType: selectedType,
        items: [{ itemId: selectedProduct }],
        forecastParameters: {},
      });
      setToast({
        message: `Forecast berhasil diproses — ${res.savedCount ?? 0} data tersimpan`,
        type: "success",
      });
      setRequestModal(false);
      await loadForecast();
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setRequesting(false);
    }
  };

  const activeType = FORECAST_TYPES.find((t) => t.value === selectedType);
  const selectedProductName = products.find((p) => p.id === selectedProduct)?.name ?? "—";

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Forecast</h1>
          <p className="page-subtitle">Prediksi permintaan, pendapatan, dan biaya berbasis AI</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setRequestModal(true)}
          disabled={!selectedProduct}
        >
          <Play size={14} strokeWidth={2.2} />
          Minta Forecast
        </button>
      </div>

      {/* Controls */}
      <div className="forecast-controls">
        <div className="forecast-type-tabs">
          {FORECAST_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
            <button
              key={value}
              className={`forecast-type-tab${selectedType === value ? " active" : ""}`}
              onClick={() => setSelectedType(value)}
              style={selectedType === value ? { "--tab-color": color, "--tab-bg": bg } : {}}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        <div className="forecast-filter-row">
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <select
              className="form-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              disabled={loadingProducts}
            >
              {loadingProducts ? (
                <option>Memuat produk…</option>
              ) : products.length === 0 ? (
                <option value="">Tidak ada produk</option>
              ) : (
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={loadForecast}
            disabled={loading || !selectedProduct}
          >
            {loading ? (
              <RefreshCw size={14} strokeWidth={2} style={{ animation: "spin 0.65s linear infinite" }} />
            ) : (
              <BarChart3 size={14} strokeWidth={2} />
            )}
            Tampilkan
          </button>
        </div>
      </div>

      {/* Feature blocked */}
      {featureBlocked && (
        <div className="forecast-blocked">
          <AlertTriangle size={36} strokeWidth={1.5} style={{ color: "#D97706", marginBottom: 10 }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            Fitur Tidak Tersedia
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Forecast AI memerlukan paket langganan yang mendukung fitur ini.{" "}
            <a href="/subscription" style={{ color: "var(--accent)", textDecoration: "none" }}>
              Upgrade langganan
            </a>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}

      {/* Results */}
      {!loading && !featureBlocked && searched && (
        <>
          {forecastData.length === 0 ? (
            <div className="table-wrapper">
              <div className="empty-state">
                <BarChart3 size={38} style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }} />
                <div className="empty-state-title">Belum ada data forecast</div>
                <div className="empty-state-desc">
                  Klik "Minta Forecast" untuk menghasilkan prediksi bagi <strong>{selectedProductName}</strong>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="table-wrapper" style={{ marginBottom: 16, padding: "20px 20px 16px" }}>
                <div className="table-toolbar" style={{ padding: 0, marginBottom: 16, border: "none" }}>
                  <span className="table-toolbar-title">
                    <div
                      className="stat-card-icon"
                      style={{ background: activeType?.bg, width: 28, height: 28, borderRadius: 7 }}
                    >
                      {activeType && (() => { const TypeIcon = activeType.icon; return <TypeIcon size={14} color={activeType.color} strokeWidth={2} />; })()}
                    </div>
                    {activeType?.label} — {selectedProductName}
                    <span className="table-count-badge">{forecastData.length} titik</span>
                  </span>
                </div>
                <ForecastChart data={forecastData} unit={activeType?.unit ?? ""} />
              </div>

              {/* Table */}
              <div className="table-wrapper">
                <div className="table-toolbar">
                  <span className="table-toolbar-title">Detail Prediksi</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tanggal Prediksi</th>
                      <th>Nilai Forecast</th>
                      <th>Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((d, i) => (
                      <tr key={d.id ?? i}>
                        <td className="td-muted">{i + 1}</td>
                        <td className="td-primary">
                          {new Date(d.forecastDate).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: activeType?.color }}>
                            {formatValue(d.forecastValue, d.unit)}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-gray">{d.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={requestModal}
        title="Minta Forecast Baru"
        onClose={() => setRequestModal(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRequestModal(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleRequest} disabled={requesting}>
              {requesting ? "Memproses…" : "Jalankan Forecast"}
            </button>
          </>
        }
      >
        <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <p style={{ marginBottom: 12 }}>
            Sistem akan mengambil data historis dan mengirimkan permintaan ke AI untuk menghasilkan prediksi.
          </p>
          <div className="forecast-confirm-grid">
            <div className="forecast-confirm-item">
              <span className="form-label" style={{ marginBottom: 2 }}>Produk</span>
              <span style={{ fontWeight: 500, color: "var(--text)" }}>{selectedProductName}</span>
            </div>
            <div className="forecast-confirm-item">
              <span className="form-label" style={{ marginBottom: 2 }}>Tipe Forecast</span>
              <span style={{ fontWeight: 500, color: "var(--text)" }}>{activeType?.label}</span>
            </div>
          </div>
        </div>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
