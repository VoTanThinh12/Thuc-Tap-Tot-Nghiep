import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, statsRes] = await Promise.all([
          adminAPI.getBookings(),
          adminAPI.getBookingStats(),
        ]);

        const data = bookingsRes.data.bookings || [];
        setBookings(
          data.map((b) => ({
            id: b.booking_code,
            customer: b.customer_name,
            email: b.customer_email,
            field: b.pitch_name,
            bookingDate: b.booking_date,
            date: b.booking_date
              ? new Date(b.booking_date).toLocaleDateString("vi-VN")
              : "",
            time: b.start_time ? b.start_time.slice(0, 5) : "",
            price: b.total_price,
            status: b.status,
          }))
        );

        setStats(statsRes.data.stats || null);
      } catch (error) {
        console.error("Failed to load bookings", error);
      }
    };

    fetchData();
  }, []);

  const statusFilterMap = {
    "Tất cả": null,
    "Chờ xác nhận": "pending",
    "Đã xác nhận": "confirmed",
    "Đã hoàn thành": "completed",
    "Đã hủy": "cancelled",
  };

  const filteredBookings = bookings.filter((booking) => {
    const statusFilter = statusFilterMap[filter];
    if (statusFilter && booking.status !== statusFilter) return false;

    if (search) {
      const keyword = search.toLowerCase();
      if (
        !booking.customer.toLowerCase().includes(keyword) &&
        !booking.email.toLowerCase().includes(keyword) &&
        !booking.id.toLowerCase().includes(keyword)
      ) {
        return false;
      }
    }

    if (date) {
      const bookingDateStr = booking.bookingDate
        ? String(booking.bookingDate).slice(0, 10)
        : "";
      if (bookingDateStr !== date) return false;
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý đơn đặt sân</h1>
            <p>Xem, theo dõi và quản lý các đơn đặt sân</p>
          </div>
          <div className="stats-mini">
            <div className="stat-mini">
              Tất cả: <strong>{stats ? stats.total : 0}</strong>
            </div>
            <div className="stat-mini">
              Chờ xác nhận: <strong>{stats ? stats.pending : 0}</strong>
            </div>
            <div className="stat-mini">
              Đã xác nhận: <strong>{stats ? stats.confirmed : 0}</strong>
            </div>
            <div className="stat-mini">
              Đã hoàn thành: <strong>{stats ? stats.completed : 0}</strong>
            </div>
          </div>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc mã đơn..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-buttons">
            {[
              "Tất cả",
              "Chờ xác nhận",
              "Đã xác nhận",
              "Đã hoàn thành",
              "Đã hủy",
            ].map((status) => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <input
            type="date"
            className="date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
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
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <span className="booking-id">{booking.id}</span>
                  </td>
                  <td>
                    <div>
                      <strong>{booking.customer}</strong>
                      <div className="sub-text">{booking.email}</div>
                    </div>
                  </td>
                  <td>{booking.field}</td>
                  <td>
                    {booking.date}
                    <br />
                    <span className="time-badge">{booking.time}</span>
                  </td>
                  <td>
                    <span className="price-tag">
                      {booking.price != null
                        ? `${Number(booking.price).toLocaleString("vi-VN")} VND`
                        : "-"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {renderStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view">Xem</button>
                      {booking.status === "Chờ xác nhận" && (
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
  switch (status) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "";
  }
}

function renderStatusLabel(status) {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "completed":
      return "Đã hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export default BookingsManagement;
