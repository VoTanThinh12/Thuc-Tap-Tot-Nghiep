import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    // TODO: Gửi API đăng nhập
  };

  return (
    <div className="admin-login-bg">
      <form className="admin-login-box" onSubmit={handleLogin}>
        <h2>Đăng nhập Admin</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập hoặc Email"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="admin-input"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="admin-input"
        />
        {error && <div className="admin-error">{error}</div>}
        <button type="submit" className="admin-login-btn">Đăng nhập</button>
      </form>
    </div>
  );
};

export default AdminLogin;
