import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mock authentication - thay bằng API call thực tế
    if (formData.username === 'admin' && formData.password === 'admin123') {
      localStorage.setItem('adminToken', 'mock-token-123');
      navigate('/admin/dashboard');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
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
            <label>Email hoặc tài khoản</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập email hoặc tài khoản"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
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
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <button type="submit" className="btn-admin-login">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;