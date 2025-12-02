import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './Management.css';

function ServicesManagement() {
  const [services] = useState([
    { id: 1, name: 'Áo bib', desc: 'Bộ áo phân đội màu khác nhau', price: '5,000 VND', category: 'Đồ dùng củ bóng đá', fields: '3 sân', status: 'Hoạt động' },
    { id: 2, name: 'Bóng thi đấu', desc: 'Bóng FIFA chính hãng', price: 'Miễn phí', category: 'Đồ dùng củ bóng đá', fields: '4 sân', status: 'Hoạt động' },
    { id: 3, name: 'Nước suối', desc: 'Nước suối cách 500ml', price: '10,000 VND', category: 'Nước uống & Đồ ăn', fields: '5 sân', status: 'Hoạt động' },
    { id: 4, name: 'Nước thể thao', desc: 'Nước thể thao Pocari/Aquarius 500ml', price: '20,000 VND', category: 'Nước uống & Đồ ăn', fields: '3 sân', status: 'Hoạt động' },
    { id: 5, name: 'Thuê trong tài', desc: 'Trong tài có kinh nghiệm cho trận đấu', price: '200,000 VND', category: 'Dịch vụ khác', fields: '5 sân', status: 'Hoạt động' }
  ]);

  const [filter, setFilter] = useState('Tất cả');

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý dịch vụ đó sung</h1>
            <p>Quản lý các dịch vụ và thêm có sản tại sân</p>
          </div>
          <button className="btn-primary">
            <span>+</span> Thêm dịch vụ
          </button>
        </div>

        <div className="search-filter-bar">
          <input 
            type="text" 
            placeholder="Tìm kiếm dịch vụ..."
            className="search-input"
          />
          <div className="filter-buttons">
            {['Tất cả', 'Đồ dùng củ bóng đá', 'Nước uống & Đồ ăn', 'Dịch vụ khác'].map(cat => (
              <button 
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Sân</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td><strong>{service.name}</strong></td>
                  <td><span className="sub-text">{service.desc}</span></td>
                  <td><span className="price-tag">{service.price}</span></td>
                  <td><span className="badge-count">{service.fields}</span></td>
                  <td>
                    <span className={`status-badge ${service.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                      {service.status}
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

export default ServicesManagement;