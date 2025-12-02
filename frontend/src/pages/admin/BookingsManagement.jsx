import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './Management.css';

function BookingsManagement() {
  const [bookings] = useState([
    { id: 'BK002', customer: 'Trần Thị B', email: 'tranthib@example.com', field: 'Sân bóng Kỳ Nguyên', date: '21/1/2025', time: '19:30', price: '400,000 VND', status: 'Chờ xác nhận' },
    { id: 'BK001', customer: 'Nguyễn Văn A', email: 'nguyenvana@example.com', field: 'Sân bóng Thế Vinh', date: '20/1/2025', time: '18:00', price: '150,000 VND', status: 'Xác nhận' },
    { id: 'BK003', customer: 'Lê Văn C', email: 'levanc@example.com', field: 'Sân bóng Bảu Trối', date: '19/1/2025', time: '20:00', price: '120,000 VND', status: 'Đã xác nhận' },
    { id: 'BK004', customer: 'Phạm Văn D', email: 'phamvand@example.com', field: 'Sân bóng Sào Văng', date: '15/1/2025', time: '17:30', price: '180,000 VND', status: 'Đã hoàn thành' },
    { id: 'BK005', customer: 'Hoàng Thị E', email: 'hoangthie@example.com', field: 'Sân bóng Phong Hoàng', date: '5/1/2025', time: '21:00', price: '130,000 VND', status: 'Đã hủy' }
  ]);

  const [filter, setFilter] = useState('Tất cả');

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý đơn đặt sân</h1>
            <p>Xem, theo dõi và quản lý các đơn đặt sân</p>
          </div>
          <div className="stats-mini">
            <div className="stat-mini">Tất cả: <strong>5</strong></div>
            <div className="stat-mini">Chờ xác nhận: <strong>2</strong></div>
            <div className="stat-mini">Đã xác nhận: <strong>1</strong></div>
            <div className="stat-mini">Đã hoàn thành: <strong>1</strong></div>
          </div>
        </div>

        <div className="search-filter-bar">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email hoặc mã đơn..."
            className="search-input"
          />
          <div className="filter-buttons">
            {['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đã hoàn thành', 'Đã hủy'].map(status => (
              <button 
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <input type="date" className="date-input" />
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sân</th>
                <th>Ngày & Giờ</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td><span className="booking-id">{booking.id}</span></td>
                  <td>
                    <div>
                      <strong>{booking.customer}</strong>
                      <div className="sub-text">{booking.email}</div>
                    </div>
                  </td>
                  <td>{booking.field}</td>
                  <td>
                    {booking.date}<br/>
                    <span className="time-badge">{booking.time}</span>
                  </td>
                  <td><span className="price-tag">{booking.price}</span></td>
                  <td>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view">Xem</button>
                      {booking.status === 'Chờ xác nhận' && (
                        <button className="btn-confirm">Xác nhận</button>
                      )}
                      <button className="btn-cancel">Hủy</button>
                      <button className="btn-delete">Chỉ tiết</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function getStatusClass(status) {
  switch(status) {
    case 'Chờ xác nhận': return 'pending';
    case 'Xác nhận': case 'Đã xác nhận': return 'confirmed';
    case 'Đã hoàn thành': return 'completed';
    case 'Đã hủy': return 'cancelled';
    default: return '';
  }
}

export default BookingsManagement;