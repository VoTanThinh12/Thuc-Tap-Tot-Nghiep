import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PitchDetailPage from './pages/PitchDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import FieldsManagement from './pages/admin/FieldsManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import CustomersManagement from './pages/admin/CustomersManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import ReportsPage from './pages/admin/ReportsPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Protected Route cho Admin
function ProtectedAdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1"><HomePage /></main>
              <Footer />
            </div>
          } />
          <Route path="/pitch/:id" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1"><PitchDetailPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/my-bookings" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1"><MyBookingsPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/login" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1"><LoginPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/register" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1"><RegisterPage /></main>
              <Footer />
            </div>
          } />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/fields" element={
            <ProtectedAdminRoute>
              <FieldsManagement />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedAdminRoute>
              <BookingsManagement />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedAdminRoute>
              <CustomersManagement />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedAdminRoute>
              <ServicesManagement />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedAdminRoute>
              <ReportsPage />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;