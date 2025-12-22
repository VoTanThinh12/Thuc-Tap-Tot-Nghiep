import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SERVER_URL, settingsAPI } from '../services/api';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [logoError, setLogoError] = useState(false);

  const [logoUrl, setLogoUrl] = useState("");
  const [businessName, setBusinessName] = useState("Sân Bóng Mini");
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const loadLogo = async () => {
      setLogoLoading(true);
      try {
        const res = await settingsAPI.getPublic();
        const system = res?.data?.settings?.system || {};
        const url = system?.logo || "";
        const name = system?.businessName || "";
        setLogoUrl(String(url || "").trim());
        setBusinessName(String(name || "Sân Bóng Mini").trim() || "Sân Bóng Mini");
        setLogoError(false);
      } catch (e) {
        setLogoUrl("");
        setLogoError(true);
      } finally {
        setLogoLoading(false);
      }
    };
    loadLogo();
  }, []);

  const toAbsoluteImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${SERVER_URL}${url}`;
    return `${SERVER_URL}/${url}`;
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          {!logoError && !!logoUrl ? (
            <img
              className="client-brand-logo"
              src={toAbsoluteImageUrl(logoUrl)}
              alt="Logo"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="client-brand-fallback" aria-hidden="true">
              {logoLoading ? "" : "⚽"}
            </span>
          )}
          <span className="client-brand-text">{businessName || "Sân Bóng Mini"}</span>
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Trang chủ</Link>
            </li>
            
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings">Đơn đặt của tôi</Link>
                </li>
                
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">Quản trị</Link>
                  </li>
                )}
                
                <li className="nav-item">
                  {user.role !== 'admin' ? (
                    <Link className="nav-link" to="/account">Xin chào, {user.name}</Link>
                  ) : (
                    <span className="nav-link">Xin chào, {user.name}</span>
                  )}
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                    type="button"
                    title={theme === "dark" ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
                  >
                    {theme === "dark" ? "☀️ Sáng" : "🌙 Tối"}
                  </button>
                </li>
                
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                    type="button"
                    title={theme === "dark" ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
                  >
                    {theme === "dark" ? "☀️ Sáng" : "🌙 Tối"}
                  </button>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Đăng nhập</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Đăng ký</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;