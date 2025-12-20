import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import {
  formatCurrency,
  formatBookingStatus,
  getStatusClass,
} from "../../utils/formatters";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./AdminDashboard.css";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Chart data states
  const [bookingTrendData, setBookingTrendData] = useState(null);
  const [revenueChartData, setRevenueChartData] = useState(null);
  const [statusChartData, setStatusChartData] = useState(null);

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
              link: "/admin/fields",
            },
            {
              icon: "📅",
              label: "Đơn đặt hôm nay",
              value: s.todayBookings,
              color: "#8b5cf6",
              link: "/admin/bookings",
            },
            {
              icon: "👥",
              label: "Khách hàng",
              value: s.totalCustomers,
              color: "#ec4899",
              link: "/admin/customers",
            },
            {
              icon: "💰",
              label: "Doanh thu tháng",
              value: formatCurrency(s.monthRevenue || 0),
              color: "#f59e0b",
              link: "/admin/reports",
            },
          ];
          setStats(mappedStats);
        }

        if (bookings) {
          const formattedBookings = bookings.map((b) => ({
            id: b.booking_code,
            customer: b.customer_name,
            field: b.pitch_name,
            time: b.start_time,
            price: b.total_price,
            status: b.status,
          }));
          setRecentBookings(formattedBookings);

          // Process data for charts
          processChartData(bookings);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
      }
    };

    fetchData();
  }, []);

  const processChartData = (bookings) => {
    // 1. Booking Trend (7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const bookingCounts = last7Days.map(
      (date) => bookings.filter((b) => b.booking_date === date).length
    );

    setBookingTrendData({
      labels: last7Days.map((d) =>
        new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        })
      ),
      datasets: [
        {
          label: "Số đơn đặt",
          data: bookingCounts,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    });

    // 2. Revenue Chart (7 days)
    const revenues = last7Days.map((date) =>
      bookings
        .filter(
          (b) =>
            b.booking_date === date &&
            ["confirmed", "completed"].includes(b.status)
        )
        .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0)
    );

    setRevenueChartData({
      labels: last7Days.map((d) =>
        new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        })
      ),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenues,
          backgroundColor: "rgba(245, 158, 11, 0.8)",
          borderColor: "rgba(245, 158, 11, 1)",
          borderWidth: 2,
        },
      ],
    });

    // 3. Status Distribution
    const statusCount = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    bookings.forEach((b) => {
      if (statusCount[b.status] !== undefined) {
        statusCount[b.status]++;
      }
    });

    setStatusChartData({
      labels: ["Chờ xác nhận", "Đã xác nhận", "Hoàn thành", "Đã hủy"],
      datasets: [
        {
          data: [
            statusCount.pending,
            statusCount.confirmed,
            statusCount.completed,
            statusCount.cancelled,
          ],
          backgroundColor: [
            "rgba(139, 92, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    });
  };

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

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card clickable"
              style={{ borderLeftColor: stat.color }}
              onClick={() => handleStatClick(stat.link)}
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
              </div>
              <div className="stat-arrow">→</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="dashboard-content">
          {/* Row 1: Line Chart + Doughnut Chart */}
          <div className="charts-row">
            <div className="chart-container" style={{ flex: 2 }}>
              <div className="chart-header">
                <h3>📈 Xu hướng đặt sân (7 ngày)</h3>
              </div>
              <div className="chart-body">
                {bookingTrendData && (
                  <Line
                    data={bookingTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1 },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="chart-container" style={{ flex: 1 }}>
              <div className="chart-header">
                <h3>📊 Phân bố trạng thái</h3>
              </div>
              <div className="chart-body">
                {statusChartData && (
                  <Doughnut
                    data={statusChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Bar Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>💰 Doanh thu 7 ngày gần đây</h3>
            </div>
            <div className="chart-body">
              {revenueChartData && (
                <Bar
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) =>
                            value.toLocaleString("vi-VN") + "đ",
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Recent Bookings Table */}
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
