import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Doanh thu theo sân");
  const [fieldRevenue, setFieldRevenue] = useState([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await adminAPI.getRevenueByField();
        const data = response.data.data || [];
        setFieldRevenue(
          data.map((item) => ({
            name: item.pitch_name,
            bookings: item.total_bookings,
            revenue: item.total_revenue,
            usage: item.usage_percentage,
          }))
        );
      } catch (error) {
        console.error("Failed to load revenue report", error);
      }
    };

    fetchRevenue();
  }, []);

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
          {["Doanh thu theo sân", "Thống kê hàng tháng", "Top khách hàng"].map(
            (tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {activeTab === "Doanh thu theo sân" && (
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
                    <td>
                      <strong>{field.name}</strong>
                    </td>
                    <td>
                      <span className="badge-count">{field.bookings}</span>
                    </td>
                    <td>
                      <span className="price-tag">
                        {field.revenue != null
                          ? `${Number(field.revenue).toLocaleString(
                              "vi-VN"
                            )} VND`
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <div className="usage-bar">
                        <div
                          className="usage-fill"
                          style={{ width: `${field.usage || 0}%` }}
                        ></div>
                        <span>
                          {field.usage != null ? `${field.usage}%` : "-"}
                        </span>
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
