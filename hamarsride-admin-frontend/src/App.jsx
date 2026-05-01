import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminOrders from "../pages/AdminOrders";
import AdminUsers from "../pages/AdminUsers";
import AdminRestaurants from "../pages/AdminRestaurants";
import AdminPayments from "../pages/AdminPayments";
import AdminSettings from "../pages/AdminSettings";
import AdminMenuManagement from "../pages/AdminMenuManagement";
import AdminBanners from "../pages/AdminBanners";
import AdminAnalytics from "../pages/AdminAnalytics";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/restaurants" element={<AdminRestaurants />} />
          <Route path="/menu" element={<AdminMenuManagement />} />
          <Route path="/banners" element={<AdminBanners />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="/payments" element={<AdminPayments />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
