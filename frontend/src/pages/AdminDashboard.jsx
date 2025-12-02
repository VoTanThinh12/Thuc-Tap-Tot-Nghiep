import React from 'react';

function AdminDashboard() {
  return (
    <div style={{ background: '#181c2a', minHeight: '100vh', color: '#f3f5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#22263d', padding: '50px 60px', borderRadius: 18, minWidth: 370, boxShadow: '0 6px 22px #1b202fAA', textAlign: 'center' }}>
        <h2 style={{ color: '#22c886', fontWeight: 'bold' }}>Xin chào, Admin!</h2>
        <p>Đây là trang quản trị hệ thống.<br />Bạn có thể custom thêm các thành phần dashboard tại đây.</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
