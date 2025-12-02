import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './Management.css';

function CustomersManagement() {
  const [customers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', bookings: 12, spent: '1.8M VND', joinDate: '15/6/2024', status: 'Hoạt động' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0902345678', bookings: 8, spent: '1.2M VND', joinDate: '20/8/2024', status: 'Hoạt động' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0903456789', bookings: 6, spent: '0.9M VND', joinDate: '10/9/2024', status: 'Hoạt động' },
    { id: 4, name: 'Phạm Văn D', email: 'phamvand@example.com', phone: '0904567890', bookings: 5, spent: '0.8M VND', joinDate: '5/10/2024', status: 'Không hoạt động' },
    { id: 5, name: 'Hoàng Thị E', email: 'hoangthie@example.com', phone: '0905678901', bookings: 4, spent: '0.6M VND', joinDate: '12/11/2024', status: 'Hoạt động' }
  ]);

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý khách hàng</h1>
            <p>Quản lý danh sách khách hàng và lịch sử sử dụng dịch vụ</p>
          </div>
          <div className="stats-mini">
            <div className="stat-mini">Tổng khách hàng: <strong>5</strong></div>
            <div className="stat-mini">Khách hoạt động: <strong>4</strong></div>
            <div className="stat-mini">Tổng chi tiêu: <strong>5.3M</strong></div>
            <div className="stat-mini">Trung bình/khách: <strong>1050K</strong></div>
          </div>
        </div>

        <div className="search-filter-bar">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="search-input"
          />
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Số lần đặt</th>
                <th>Tổng chi</th>
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td><span className="sub-text">{customer.email}</span></td>
                  <td>{customer.phone}</td>
                  <td><span className="badge-count">{customer.bookings}</span></td>
                  <td><span className="price-tag">{customer.spent}</span></td>
                  <td>{customer.joinDate}</td>
                  <td>
                    <span className={`status-badge ${customer.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                      {customer.status}
                    </span>
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

export default CustomersManagement;