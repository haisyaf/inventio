import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import WarehousesPage from "./pages/WarehousesPage";
import SuppliersPage from "./pages/SuppliersPage";
import StocksPage from "./pages/StocksPage";
import TransactionsPage from "./pages/TransactionsPage";
import ForecastPage from "./pages/ForecastPage";
import UsersPage from "./pages/UsersPage";
import SubscriptionPage from "./pages/SubscriptionPage";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const { slug } = useParams();
  if (!user) return <Navigate to="/login" replace />;
  if (user.tenantSlug && slug !== user.tenantSlug) {
    return <Navigate to={`/${user.tenantSlug}/dashboard`} replace />;
  }
  return children;
}

function PublicHome() {
  const { user } = useAuth();
  if (user?.tenantSlug) return <Navigate to={`/${user.tenantSlug}/dashboard`} replace />;
  if (user) return <Navigate to="/login" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/:slug"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="stocks" element={<StocksPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="forecasts" element={<ForecastPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
