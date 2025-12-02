import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDashboard.css';

function AdminDashboard() {
  const stats = [
    { icon: '⚽', label: 'Tổng sân bóng', value: '12', change: '+2', color: '#3b82f6' },
    { icon: '📅', label: 'Đơn đặt hôm nay', value: '24', change: '+15%', color: '#8b5cf6' },
    { icon: '👥', label: 'Khách hàng', value: '1,250', change: '+8%', color: '#ec4899' },
    { icon: '💰', label: 'Doanh thu tháng', value: '45.5M', change: '+12%', color: '#f59e0b' }
  ];

  const recentBookings = [
    { id: 'BK001', customer: 'Nguyễn Văn A', field: 'Sân 1', time: '18:00', status: 'Đã xác nhận' },
    { id: 'BK002', customer: 'Trần Thị B', field: 'Sân 2', time: '19:30', status: 'Chờ xác nhận' },
    { id: 'BK003', customer: 'Lê Văn C', field: 'Sân 3', time: '20:00', status: 'Đã xác nhận' }
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Tổng quan hoạt động của hệ thống quản lý sân bóng</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
              <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                <span style={{ fontSize: '32px' }}>{stat.icon}</span>
              </div>
              <div className="stat-info">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change" style={{ color: stat.color }}>{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-content">
          <div className="recent-bookings">
            <h3>Đơn đặt gần đây</h3>
            <div className="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sân</th>
                    <th>Giờ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td><span className="booking-id">{booking.id}</span></td>
                      <td>{booking.customer}</td>
                      <td>{booking.field}</td>
                      <td>{booking.time}</td>
                      <td>
                        <span className={`status-badge ${booking.status === 'Đã xác nhận' ? 'confirmed' : 'pending'}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;