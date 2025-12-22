import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaStar, FaChartLine } from "react-icons/fa";
import { SERVER_URL, settingsAPI } from "../../services/api";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [logoUrl, setLogoUrl] = useState("");
  const [businessName, setBusinessName] = useState("SoccerHub Admin");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const loadBrand = async () => {
      try {
        const res = await settingsAPI.getPublic();
        const system = res?.data?.settings?.system || {};
        setLogoUrl(String(system.logo || "").trim());
        setBusinessName(String(system.businessName || "SoccerHub Admin").trim());
        setLogoError(false);
      } catch (e) {
        setLogoError(true);
      }
    };
    loadBrand();
  }, []);

  const toAbsoluteImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${SERVER_URL}${url}`;
    return `${SERVER_URL}/${url}`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/admin/fields", icon: "⚽", label: "Quản lý sân" },
    { path: "/admin/images", icon: "🖼️", label: "Ảnh sân" },
    { path: "/admin/bookings", icon: "📅", label: "Đơn đặt sân" },
    { path: "/admin/customers", icon: "👥", label: "Khách hàng" },
    { path: "/admin/services", icon: "⚙️", label: "Dịch vụ" },
    { path: "/admin/reviews", icon: "⭐", label: "Đánh giá" },
    { path: "/admin/reports", icon: "📈", label: "Báo cáo" },
    { path: "/admin/settings", icon: "⚙️", label: "Cài đặt" },
  ];

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {!logoError && logoUrl ? (
              <img
                className="logo-icon"
                src={toAbsoluteImageUrl(logoUrl)}
                alt="Logo"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setLogoError(true)}
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            ) : (
              <span className="logo-icon">⚽</span>
            )}
            {sidebarOpen && <span className="logo-text">{businessName}</span>}
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="menu-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="menu-icon">🚪</span>
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="admin-user-info">
            <span className="user-name">Admin User</span>
            <div className="user-avatar">A</div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
