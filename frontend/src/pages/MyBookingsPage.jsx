import React, { useState, useEffect, useContext } from "react";
import { bookingAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReviewForm from "../components/Reviews/ReviewForm";
import reviewService from "../services/reviewService";

const MyBookingsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewByBookingId, setReviewByBookingId] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadMyBookings();
    loadMyReviews();
  }, [user, navigate]);

  const loadMyBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.bookings);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn đặt");
    } finally {
      setLoading(false);
    }
  };

  const loadMyReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await reviewService.getMyReviews(1, 200);
      const list = response?.data?.data?.reviews || [];
      const map = {};
      for (const r of list) {
        if (r?.booking_id) map[String(r.booking_id)] = r;
      }
      setReviewByBookingId(map);
    } catch (error) {
      setReviewByBookingId({});
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn đặt này?")) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      toast.success("Hủy đơn đặt thành công");
      loadMyBookings();
    } catch (error) {
      toast.error("Không thể hủy đơn đặt");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: "warning", text: "Chờ xác nhận" },
      confirmed: { class: "success", text: "Đã xác nhận" },
      cancelled: { class: "danger", text: "Đã hủy" },
      completed: { class: "info", text: "Hoàn thành" },
    };
    const { class: badgeClass, text } = statusMap[status] || {
      class: "secondary",
      text: status,
    };
    return <span className={`badge bg-${badgeClass}`}>{text}</span>;
  };

  const handleOpenReview = (booking) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để đánh giá");
      navigate("/login");
      return;
    }

    if (!booking || booking.status !== "completed") {
      toast.error("Chỉ có thể đánh giá sau khi đơn đặt hoàn thành");
      return;
    }

    const existing = reviewByBookingId[String(booking.id)] || null;
    setSelectedBooking(booking);
    setExistingReview(existing);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = async () => {
    await loadMyReviews();
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 my-bookings-page">
      <h2 className="mb-4">📋 Đơn đặt sân của tôi</h2>

      {bookings.length === 0 ? (
        <div className="alert alert-info">
          Bạn chưa có đơn đặt sân nào. <a href="/">Đặt sân ngay</a>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-success">
              <tr>
                <th>Mã đơn</th>
                <th>Sân bóng</th>
                <th>Địa điểm</th>
                <th>Ngày đặt</th>
                <th>Giờ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.booking_code}</strong>
                  </td>
                  <td>{booking.pitch_name}</td>
                  <td>{booking.location}</td>
                  <td>{new Date(booking.date).toLocaleDateString("vi-VN")}</td>
                  <td>
                    {booking.start_time} - {booking.end_time}
                  </td>
                  <td>
                    <strong>
                      {Number(booking.total_price).toLocaleString("vi-VN")} đ
                    </strong>
                  </td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    {booking.status === "pending" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Hủy
                      </button>
                    )}

                    {booking.status === "completed" && (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleOpenReview(booking)}
                        disabled={loadingReviews}
                      >
                        {reviewByBookingId[String(booking.id)]
                          ? "Sửa đánh giá"
                          : "Đánh giá"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReviewForm
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        booking={
          selectedBooking
            ? {
                id: selectedBooking.id,
                pitch_id: selectedBooking.pitch_id,
                pitch_name: selectedBooking.pitch_name,
              }
            : null
        }
        existingReview={existingReview}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default MyBookingsPage;
