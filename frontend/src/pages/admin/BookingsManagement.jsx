import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import {
  formatCurrency,
  formatBookingStatus,
  getStatusClass,
} from "../../utils/formatters";
import "./Management.css";

function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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
          bookingId: b.id, // ID thật để update status
          customer: b.customer_name,
          email: b.customer_email,
          phone: b.customer_phone || "N/A",
          field: b.pitch_name,
          bookingDate: b.booking_date,
          date: b.booking_date
            ? new Date(b.booking_date).toLocaleDateString("vi-VN")
            : "",
          time: b.start_time ? b.start_time.slice(0, 5) : "",
          endTime: b.end_time ? b.end_time.slice(0, 5) : "",
          price: b.total_price,
          status: b.status,
          createdAt: b.created_at,
        }))
      );

      setStats(statsRes.data.stats || null);
    } catch (error) {
      console.error("Failed to load bookings", error);
      alert("Lỗi khi tải dữ liệu đơn đặt sân");
    }
  };

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

  // Xem chi tiết
  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // Xác nhận đơn
  const handleConfirm = async (booking) => {
    if (!window.confirm(`Xác nhận đơn đặt sân ${booking.id}?`)) return;

    try {
      await adminAPI.updateBookingStatus(booking.bookingId, "confirmed");
      alert("Xác nhận đơn thành công!");
      fetchData(); // Reload
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Lỗi khi xác nhận đơn");
    }
  };

  // Hủy đơn
  const handleCancel = async (booking) => {
    if (!window.confirm(`Hủy đơn đặt sân ${booking.id}?`)) return;

    try {
      await adminAPI.updateBookingStatus(booking.bookingId, "cancelled");
      alert("Hủy đơn thành công!");
      fetchData(); // Reload
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Lỗi khi hủy đơn");
    }
  };

  // Hoàn thành đơn
  const handleComplete = async (booking) => {
    if (!window.confirm(`Đánh dấu đơn ${booking.id} đã hoàn thành?`)) return;

    try {
      await adminAPI.updateBookingStatus(booking.bookingId, "completed");
      alert("Đơn đã được đánh dấu hoàn thành!");
      fetchData(); // Reload
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật đơn");
    }
  };

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý đơn đặt sân</h1>
            <p>Xem, theo dõi và quản lý các đơn đặt sân</p>
          </div>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Tất cả</div>
              <div className="stat-value">{stats ? stats.total : 0}</div>
            </div>
            <div className="stat-card pending">
              <div className="stat-label">Chờ xác nhận</div>
              <div className="stat-value">{stats ? stats.pending : 0}</div>
            </div>
            <div className="stat-card confirmed">
              <div className="stat-label">Đã xác nhận</div>
              <div className="stat-value">{stats ? stats.confirmed : 0}</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-label">Đã hoàn thành</div>
              <div className="stat-value">{stats ? stats.completed : 0}</div>
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
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {search || date
                      ? "Không tìm thấy đơn đặt sân nào"
                      : "Chưa có đơn đặt sân nào"}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
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
                      <div>
                        {booking.date}
                        <div className="time-badge">
                          {booking.time} - {booking.endTime}
                        </div>
                      </div>
                    </td>
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
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetail(booking)}
                          title="Xem chi tiết"
                        >
                          Xem
                        </button>

                        {booking.status === "pending" && (
                          <button
                            className="btn-confirm"
                            onClick={() => handleConfirm(booking)}
                            title="Xác nhận đơn"
                          >
                            Xác nhận
                          </button>
                        )}

                        {booking.status === "confirmed" && (
                          <button
                            className="btn-complete"
                            onClick={() => handleComplete(booking)}
                            title="Đánh dấu hoàn thành"
                          >
                            Hoàn thành
                          </button>
                        )}

                        {(booking.status === "pending" ||
                          booking.status === "confirmed") && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancel(booking)}
                            title="Hủy đơn"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT - GIỐNG MODAL SERVICES */}
      {showDetailModal && selectedBooking && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn đặt sân</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {/* Mã đơn và Trạng thái */}
              <div className="form-row">
                <div className="form-group">
                  <label>Mã đơn</label>
                  <input
                    type="text"
                    value={selectedBooking.id}
                    disabled
                    className="input-readonly"
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <input
                    type="text"
                    value={formatBookingStatus(selectedBooking.status)}
                    disabled
                    className="input-readonly"
                  />
                </div>
              </div>

              {/* Tên khách hàng */}
              <div className="form-group">
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  value={selectedBooking.customer}
                  disabled
                  className="input-readonly"
                />
              </div>

              {/* Email và Số điện thoại */}
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedBooking.email}
                    disabled
                    className="input-readonly"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={selectedBooking.phone}
                    disabled
                    className="input-readonly"
                  />
                </div>
              </div>

              {/* Sân */}
              <div className="form-group">
                <label>Sân</label>
                <input
                  type="text"
                  value={selectedBooking.field}
                  disabled
                  className="input-readonly"
                />
              </div>

              {/* Ngày đặt và Giờ */}
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày đặt</label>
                  <input
                    type="text"
                    value={selectedBooking.date}
                    disabled
                    className="input-readonly"
                  />
                </div>

                <div className="form-group">
                  <label>Giờ</label>
                  <input
                    type="text"
                    value={`${selectedBooking.time} - ${selectedBooking.endTime}`}
                    disabled
                    className="input-readonly"
                  />
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="form-group">
                <label>Tổng tiền</label>
                <input
                  type="text"
                  value={formatCurrency(selectedBooking.price)}
                  disabled
                  className="input-readonly input-price"
                />
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>

                {selectedBooking.status === "pending" && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleConfirm(selectedBooking);
                    }}
                  >
                    Xác nhận đơn
                  </button>
                )}

                {(selectedBooking.status === "pending" ||
                  selectedBooking.status === "confirmed") && (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleCancel(selectedBooking);
                    }}
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default BookingsManagement;
