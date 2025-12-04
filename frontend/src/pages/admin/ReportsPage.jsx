import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("field");
  const [loading, setLoading] = useState(false);

  // Data states
  const [fieldRevenue, setFieldRevenue] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "field") {
        const res = await adminAPI.getRevenueByField();
        setFieldRevenue(res.data.data || []);
      } else if (activeTab === "monthly") {
        const res = await adminAPI.getMonthlyStats();
        setMonthlyStats(res.data.data || []);
      } else if (activeTab === "customers") {
        const res = await adminAPI.getTopCustomers();
        setTopCustomers(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load report", error);
      alert("Lỗi khi tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Export handlers
  const handleExportPDF = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/reports/export-pdf",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao-cao-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Lỗi khi xuất PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/reports/export-excel",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao-cao-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Lỗi khi xuất Excel");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Báo cáo</h1>
            <p>Xem chi tiết báo cáo doanh thu, khách hàng và hiệu suất</p>
          </div>
          <div className="export-buttons">
            <button className="btn-export" onClick={handleExportPDF}>
              📄 Tải PDF
            </button>
            <button className="btn-export" onClick={handleExportExcel}>
              📊 Tải Excel
            </button>
            <button className="btn-primary" onClick={handlePrint}>
              🖨️ In báo cáo
            </button>
          </div>
        </div>

        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "field" ? "active" : ""}`}
            onClick={() => setActiveTab("field")}
          >
            Doanh thu theo sân
          </button>
          <button
            className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
            onClick={() => setActiveTab("monthly")}
          >
            Thống kê hàng tháng
          </button>
          <button
            className={`tab-btn ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Top khách hàng
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* TAB 1: Doanh thu theo sân */}
            {activeTab === "field" && (
              <div className="data-table">
                <h3>Doanh thu theo sân</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Sân bóng</th>
                      <th>Loại</th>
                      <th>Địa điểm</th>
                      <th>Số đơn</th>
                      <th>Doanh thu</th>
                      <th>Tỷ lệ sử dụng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldRevenue.length === 0 ? (
                      <tr>
                        <td colSpan="6">Chưa có dữ liệu</td>
                      </tr>
                    ) : (
                      fieldRevenue.map((field, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{field.pitch_name}</strong>
                          </td>
                          <td>{field.type}</td>
                          <td>{field.location}</td>
                          <td>
                            <span className="badge-count">
                              {field.total_bookings}
                            </span>
                          </td>
                          <td>
                            <span className="price-tag">
                              {Number(field.total_revenue).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </span>
                          </td>
                          <td>
                            <div className="usage-bar">
                              <div
                                className="usage-fill"
                                style={{
                                  width: `${field.usage_percentage || 0}%`,
                                }}
                              ></div>
                              <span>{field.usage_percentage || 0}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: Thống kê hàng tháng */}
            {activeTab === "monthly" && (
              <div className="data-table">
                <h3>Thống kê theo tháng (12 tháng gần nhất)</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Tháng</th>
                      <th>Số đơn đặt</th>
                      <th>Doanh thu</th>
                      <th>Khách hàng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyStats.length === 0 ? (
                      <tr>
                        <td colSpan="4">Chưa có dữ liệu</td>
                      </tr>
                    ) : (
                      monthlyStats.map((stat, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{stat.month_display}</strong>
                          </td>
                          <td>
                            <span className="badge-count">
                              {stat.total_bookings}
                            </span>
                          </td>
                          <td>
                            <span className="price-tag">
                              {Number(stat.revenue).toLocaleString("vi-VN")} VND
                            </span>
                          </td>
                          <td>{stat.unique_customers || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: Top khách hàng */}
            {activeTab === "customers" && (
              <div className="data-table">
                <h3>Top 10 khách hàng</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên khách hàng</th>
                      <th>Email</th>
                      <th>SĐT</th>
                      <th>Số đơn</th>
                      <th>Tổng chi tiêu</th>
                      <th>Lần cuối đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="7">Chưa có dữ liệu</td>
                      </tr>
                    ) : (
                      topCustomers.map((customer, index) => (
                        <tr key={index}>
                          <td>
                            <strong>#{index + 1}</strong>
                          </td>
                          <td>{customer.full_name}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phone}</td>
                          <td>
                            <span className="badge-count">
                              {customer.total_bookings}
                            </span>
                          </td>
                          <td>
                            <span className="price-tag">
                              {Number(customer.total_spent).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </span>
                          </td>
                          <td>
                            {customer.last_booking_date
                              ? new Date(
                                  customer.last_booking_date
                                ).toLocaleDateString("vi-VN")
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default ReportsPage;
