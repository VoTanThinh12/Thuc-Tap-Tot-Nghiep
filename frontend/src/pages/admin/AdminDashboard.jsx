import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        const { stats: s, recentBookings: bookings } = response.data;

        if (s) {
          const mappedStats = [
            {
              icon: "⚽",
              label: "Tổng sân bóng",
              value: s.totalFields,
              color: "#3b82f6",
            },
            {
              icon: "📅",
              label: "Đơn đặt hôm nay",
              value: s.todayBookings,
              color: "#8b5cf6",
            },
            {
              icon: "👥",
              label: "Khách hàng",
              value: s.totalCustomers,
              color: "#ec4899",
            },
            {
              icon: "💰",
              label: "Doanh thu tháng",
              value: `${(s.monthRevenue || 0).toLocaleString("vi-VN")} VND`,
              color: "#f59e0b",
            },
          ];
          setStats(mappedStats);
        }

        if (bookings) {
          setRecentBookings(
            bookings.map((b) => ({
              id: b.booking_code,
              customer: b.customer_name,
              field: b.pitch_name,
              time: b.start_time,
              status: b.status,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Tổng quan hoạt động của hệ thống quản lý sân bóng</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card"
              style={{ borderLeftColor: stat.color }}
            >
              <div
                className="stat-icon"
                style={{ background: `${stat.color}20` }}
              >
                <span style={{ fontSize: "32px" }}>{stat.icon}</span>
              </div>
              <div className="stat-info">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change" style={{ color: stat.color }}>
                  {stat.change}
                </div>
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
                      <td>
                        <span className="booking-id">{booking.id}</span>
                      </td>
                      <td>{booking.customer}</td>
                      <td>{booking.field}</td>
                      <td>{booking.time}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            booking.status === "Đã xác nhận"
                              ? "confirmed"
                              : "pending"
                          }`}
                        >
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
