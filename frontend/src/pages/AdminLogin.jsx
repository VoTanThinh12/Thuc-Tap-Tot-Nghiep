import React, { useState } from 'react';
import './AdminLogin.css';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Replace this mock logic by API call to backend for real authentication
    if ((username === 'admin' || username === 'admin@example.com') && password === 'admin123') {
      setError('');
      navigate('/admin');
    } else {
      setError('Tài khoản hoặc mật khẩu sai!');
    }
  };

  return (
    <div className="login-bg-admin">
      <div className="login-container-admin">
        <h2 className="mb-4">Đăng nhập Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Email hoặc tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="alert alert-danger small">{error}</div>}
          <button type="submit" className="btn btn-success w-100 mt-2">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
