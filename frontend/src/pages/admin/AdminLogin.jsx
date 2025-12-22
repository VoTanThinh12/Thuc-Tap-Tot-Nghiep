import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./AdminLogin.css";

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await api.post("/admin/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      login(response.data.user, response.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="admin-icon">⚽</div>
          <h2>SoccerHub Admin</h2>
          <p>Đăng nhập vào hệ thống quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button
            type="submit"
            className="btn-admin-login"
            disabled={submitting}
          >
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
