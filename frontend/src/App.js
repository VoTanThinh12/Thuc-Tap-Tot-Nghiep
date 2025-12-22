import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import PitchDetailPage from "./pages/PitchDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FieldsManagement from "./pages/admin/FieldsManagement";
import BookingsManagement from "./pages/admin/BookingsManagement";
import CustomersManagement from "./pages/admin/CustomersManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ReviewManagement from "./pages/admin/ReviewManagement";
import PitchReviewStats from "./pages/admin/PitchReviewStats";
import ImageManagement from "./pages/admin/ImageManagement";
import ReviewCenter from "./pages/admin/ReviewCenter";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./styles/theme.css";

// Protected Route cho Admin - CHỈ ADMIN MỚI VÀO ĐƯỢC
function ProtectedAdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập => chuyển đến trang đăng nhập admin
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Nếu không phải admin => chuyển về trang chủ client
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Nếu là admin => cho phép truy cập
  return children;
}

// Protected Route cho Client - CHỈ CLIENT MỚI VÀO ĐƯỢC (không cho admin)
function ProtectedClientRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập => yêu cầu đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu là admin => chuyển về trang admin dashboard
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Nếu là client => cho phép truy cập
  return children;
}

// Public Route - Tự động redirect dựa trên role
function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  // Nếu đã đăng nhập với role admin => chuyển về admin dashboard
  if (user && user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Các trường hợp khác => hiển thị trang bình thường
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - Trang chủ và chi tiết sân (ai cũng xem được) */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <div className="d-flex flex-column min-vh-100">
                  <Header />
                  <main className="flex-grow-1">
                    <HomePage />
                  </main>
                  <Footer />
                </div>
              </PublicRoute>
            }
          />
          <Route
            path="/pitch/:id"
            element={
              <PublicRoute>
                <div className="d-flex flex-column min-vh-100">
                  <Header />
                  <main className="flex-grow-1">
                    <PitchDetailPage />
                  </main>
                  <Footer />
                </div>
              </PublicRoute>
            }
          />
          {/* Auth routes - Login/Register */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div className="d-flex flex-column min-vh-100">
                  <Header />
                  <main className="flex-grow-1">
                    <LoginPage />
                  </main>
                  <Footer />
                </div>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <div className="d-flex flex-column min-vh-100">
                  <Header />
                  <main className="flex-grow-1">
                    <RegisterPage />
                  </main>
                  <Footer />
                </div>
              </PublicRoute>
            }
          />
          {/* Protected Client routes - CHỈ CLIENT */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedClientRoute>
                <div className="d-flex flex-column min-vh-100">
                  <Header />
                  <main className="flex-grow-1">
                    <MyBookingsPage />
                  </main>
                  <Footer />
                </div>
              </ProtectedClientRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedClientRoute>
                <div className="d-flex flex-column min-vh-100">
                  <Header />
                  <main className="flex-grow-1">
                    <AccountPage />
                  </main>
                  <Footer />
                </div>
              </ProtectedClientRoute>
            }
          />
          {/* Admin routes - CHỈ ADMIN */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/fields"
            element={
              <ProtectedAdminRoute>
                <FieldsManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedAdminRoute>
                <BookingsManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedAdminRoute>
                <CustomersManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedAdminRoute>
                <ServicesManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedAdminRoute>
                <ReportsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <SettingsPage />
              </ProtectedAdminRoute>
            }
          />
          {/* // Trong phần routes của admin */}
          <Route
            path="/admin/reviews"
            element={
              <ProtectedAdminRoute>
                <ReviewCenter />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/review-stats"
            element={
              <ProtectedAdminRoute>
                <Navigate to="/admin/reviews" replace />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/images"
            element={
              <ProtectedAdminRoute>
                <ImageManagement />
              </ProtectedAdminRoute>
            }
          />
          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="d-flex flex-column min-vh-100">
                <Header />
                <main className="flex-grow-1 d-flex justify-content-center align-items-center">
                  <div className="text-center">
                    <h1 className="display-1">404</h1>
                    <p className="lead">Trang không tồn tại</p>
                    <a href="/" className="btn btn-primary">
                      Về trang chủ
                    </a>
                  </div>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
