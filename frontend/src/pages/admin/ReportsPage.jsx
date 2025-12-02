import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './Management.css';

function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Doanh thu theo sân');

  const fieldRevenue = [
    { name: 'Sân bóng Thế Vinh', bookings: 45, revenue: '6.8M VND', usage: '87%' },
    { name: 'Sân bóng Kỳ Nguyên', bookings: 38, revenue: '7.6M VND', usage: '82%' },
    { name: 'Sân bóng Bảu Trối', bookings: 42, revenue: '5.0M VND', usage: '78%' },
    { name: 'Sân bóng Sào Văng', bookings: 35, revenue: '6.3M VND', usage: '75%' },
    { name: 'Sân bóng Phong Hoàng', bookings: 40, revenue: '5.2M VND', usage: '85%' }
  ];

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Báo cáo</h1>
            <p>Xem chi tiết báo cáo doanh thu, khách hàng và hiệu suất</p>
          </div>
          <div className="export-buttons">
            <button className="btn-export">Tải PDF</button>
            <button className="btn-export">Tải Excel</button>
            <button className="btn-primary">In báo cáo</button>
          </div>
        </div>

        <div className="tabs-container">
          {['Doanh thu theo sân', 'Thống kê hàng tháng', 'Top khách hàng'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Doanh thu theo sân' && (
          <div className="data-table">
            <h3>Doanh thu theo sân</h3>
            <table>
              <thead>
                <tr>
                  <th>Sân bóng</th>
                  <th>Đơn đặt</th>
                  <th>Doanh thu</th>
                  <th>Mức độ dùng</th>
                </tr>
              </thead>
              <tbody>
                {fieldRevenue.map((field, index) => (
                  <tr key={index}>
                    <td><strong>{field.name}</strong></td>
                    <td><span className="badge-count">{field.bookings}</span></td>
                    <td><span className="price-tag">{field.revenue}</span></td>
                    <td>
                      <div className="usage-bar">
                        <div className="usage-fill" style={{ width: field.usage }}></div>
                        <span>{field.usage}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ReportsPage;