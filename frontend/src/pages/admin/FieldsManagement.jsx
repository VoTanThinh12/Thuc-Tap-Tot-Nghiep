import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './Management.css';

function FieldsManagement() {
  const [fields] = useState([
    { id: 1, name: 'Sân bóng Thế Vinh', location: 'Quận 1, TP HCM', type: '5v5', price: '150,000 VND', status: 'Hoạt động' },
    { id: 2, name: 'Sân bóng Kỳ Nguyên', location: 'Quận 3, TP HCM', type: '7v7', price: '200,000 VND', status: 'Hoạt động' },
    { id: 3, name: 'Sân bóng Bảu Trối', location: 'Quận 7, TP HCM', type: '5v5', price: '120,000 VND', status: 'Bảo trì' },
    { id: 4, name: 'Sân bóng Sào Văng', location: 'Bình Thạnh, TP HCM', type: '7v7', price: '180,000 VND', status: 'Hoạt động' }
  ]);

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý sân bóng</h1>
            <p>Quản lý danh sách sân bóng, giá cả, và khung giờ hoạt động</p>
          </div>
          <button className="btn-primary">
            <span>+</span> Thêm sân mới
          </button>
        </div>

        <div className="search-filter-bar">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            className="search-input"
          />
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Tên sân</th>
                <th>Địa điểm</th>
                <th>Loại</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id}>
                  <td><strong>{field.name}</strong></td>
                  <td>{field.location}</td>
                  <td>{field.type}</td>
                  <td><span className="price-tag">{field.price}</span></td>
                  <td>
                    <span className={`status-badge ${field.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                      {field.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit">Sửa</button>
                      <button className="btn-delete">Xóa</button>
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

export default FieldsManagement;