import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // THÊM IMPORT
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import {
  formatCurrency,
  formatBookingStatus,
  getStatusClass,
} from "../../utils/formatters";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate(); // THÊM HOOK
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
              link: "/admin/fields", // THÊM LINK
            },
            {
              icon: "📅",
              label: "Đơn đặt hôm nay",
              value: s.todayBookings,
              color: "#8b5cf6",
              link: "/admin/bookings", // THÊM LINK
            },
            {
              icon: "👥",
              label: "Khách hàng",
              value: s.totalCustomers,
              color: "#ec4899",
              link: "/admin/customers", // THÊM LINK
            },
            {
              icon: "💰",
              label: "Doanh thu tháng",
              value: formatCurrency(s.monthRevenue || 0),
              color: "#f59e0b",
              link: "/admin/reports", // THÊM LINK
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
              price: b.total_price,
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

  // THÊM FUNCTION HANDLE CLICK
  const handleStatClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

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
              className="stat-card clickable" // THÊM CLASS clickable
              style={{ borderLeftColor: stat.color }}
              onClick={() => handleStatClick(stat.link)} // THÊM onClick
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
              {/* THÊM ICON MŨI TÊN */}
              <div className="stat-arrow">→</div>
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
                    <th>Giá</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        Chưa có đơn đặt nào
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <span className="booking-id">{booking.id}</span>
                        </td>
                        <td>{booking.customer}</td>
                        <td>{booking.field}</td>
                        <td>{booking.time ? booking.time.slice(0, 5) : "-"}</td>
                        <td>
                          <span className="price-tag">
                            {formatCurrency(booking.price)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {formatBookingStatus(booking.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
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
