import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pitchAPI, bookingAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import ReviewList from "../components/Reviews/ReviewList";
import StarRating from "../components/Reviews/StarRating";
import reviewService from "../services/reviewService";

const PitchDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSlots, setCheckingSlots] = useState(false);

  // State cho đánh giá
  const [reviewStats, setReviewStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadPitchDetail();
    loadReviewStats();
  }, [id]);

  useEffect(() => {
    if (bookingDate && pitch) {
      generateAndCheckTimeslots();
    } else {
      setTimeslots([]);
      setSelectedTimeslot(null);
    }
  }, [bookingDate, pitch]);

  const loadPitchDetail = async () => {
    try {
      const response = await pitchAPI.getById(id);
      setPitch(response.data.pitch);
    } catch (error) {
      toast.error("Không thể tải thông tin sân");
      console.error("Error loading pitch:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load thống kê đánh giá
  const loadReviewStats = async () => {
    setLoadingStats(true);
    try {
      const response = await reviewService.getReviewsByPitch(id, 1, 1);
      setReviewStats(response.data.stats);
    } catch (error) {
      console.error("Error loading review stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // 🚀 TỰ TẠO TIMESLOTS TRÊN FRONTEND
  const generateTimeslots = () => {
    const slots = [];
    const basePrice = parseFloat(pitch.price_per_hour);

    // Tạo slots từ 6h sáng đến 22h tối, mỗi slot 2 tiếng
    for (let hour = 6; hour < 22; hour += 2) {
      const startTime = `${hour.toString().padStart(2, "0")}:00:00`;
      const endTime = `${(hour + 2).toString().padStart(2, "0")}:00:00`;

      // Giờ vàng (17h-22h) tăng giá 20%
      const price = hour >= 17 ? basePrice * 1.2 : basePrice;

      slots.push({
        start_time: startTime,
        end_time: endTime,
        price: Math.round(price),
        display_time: `${hour.toString().padStart(2, "0")}:00 - ${(hour + 2)
          .toString()
          .padStart(2, "0")}:00`,
        is_available: true, // Mặc định true, sẽ check sau
      });
    }

    return slots;
  };

  // 🔍 CHECK CONFLICT VỚI DATABASE
  const generateAndCheckTimeslots = async () => {
    setCheckingSlots(true);
    try {
      // Tạo timeslots
      const slots = generateTimeslots();

      // Check từng slot xem có bị book chưa
      const checkedSlots = await Promise.all(
        slots.map(async (slot) => {
          try {
            const response = await bookingAPI.checkAvailability({
              pitch_id: parseInt(id),
              booking_date: bookingDate,
              start_time: slot.start_time,
              end_time: slot.end_time,
            });

            return {
              ...slot,
              is_available: response.data.available,
            };
          } catch (error) {
            console.error("Error checking slot:", slot.start_time, error);
            // Nếu lỗi API, giữ available = true
            return slot;
          }
        })
      );

      setTimeslots(checkedSlots);
    } catch (error) {
      console.error("Error generating timeslots:", error);
      toast.error("Lỗi khi tải khung giờ");
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.warning("Vui lòng đăng nhập để đặt sân");
      navigate("/login");
      return;
    }

    if (!bookingDate || !selectedTimeslot) {
      toast.error("Vui lòng chọn ngày và giờ đặt sân");
      return;
    }

    setSubmitting(true);

    try {
      // Double-check lại trước khi submit
      const checkResponse = await bookingAPI.checkAvailability({
        pitch_id: parseInt(id),
        booking_date: bookingDate,
        start_time: selectedTimeslot.start_time,
        end_time: selectedTimeslot.end_time,
      });

      if (!checkResponse.data.available) {
        toast.error(
          "❌ Khung giờ này vừa được đặt. Vui lòng chọn khung giờ khác!"
        );
        generateAndCheckTimeslots(); // Refresh lại
        setSelectedTimeslot(null);
        return;
      }

      // Submit booking
      const bookingData = {
        pitch_id: parseInt(id),
        booking_date: bookingDate,
        start_time: selectedTimeslot.start_time,
        end_time: selectedTimeslot.end_time,
        total_price: selectedTimeslot.price,
        deposit_amount: 0,
        notes: "",
        services: [], // Có thể thêm services sau
      };

      const response = await bookingAPI.create(bookingData);

      if (response.data.success) {
        toast.success("✅ Đặt sân thành công! Chờ admin xác nhận.");
        navigate("/my-bookings");
      }
    } catch (error) {
      console.error("Booking error:", error);

      if (error.response?.status === 409) {
        toast.error(
          "❌ Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác!"
        );
        generateAndCheckTimeslots(); // Refresh lại
        setSelectedTimeslot(null);
      } else {
        toast.error(error.response?.data?.message || "Đặt sân thất bại");
      }
    } finally {
      setSubmitting(false);
    }
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

  if (!pitch) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Không tìm thấy sân bóng</div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="row">
        {/* Hình ảnh sân */}
        <div className="col-md-6">
          <img
            src={
              pitch.images && pitch.images[0]
                ? pitch.images[0]
                : "https://via.placeholder.com/600x400"
            }
            alt={pitch.name}
            className="img-fluid rounded shadow"
            style={{ width: "100%", height: "400px", objectFit: "cover" }}
          />
        </div>

        {/* Thông tin sân */}
        <div className="col-md-6">
          <h2>{pitch.name}</h2>
          <p className="text-muted">
            <span className="badge bg-primary me-2">{pitch.type}</span>
            <span>📍 {pitch.location}</span>
          </p>

          {/* Hiển thị đánh giá trung bình */}
          {reviewStats && reviewStats.total_reviews > 0 && (
            <div className="mb-3">
              <StarRating rating={reviewStats.average_rating || 0} size={20} />
              <span className="ms-2 text-muted">
                ({reviewStats.total_reviews} đánh giá)
              </span>
            </div>
          )}

          <hr />

          <h4 className="text-success">
            {Number(pitch.price_per_hour).toLocaleString("vi-VN")} đ/giờ
          </h4>

          <div className="mt-3">
            <h5>Mô tả:</h5>
            <p>{pitch.description || "Chưa có mô tả"}</p>
          </div>

          {pitch.facilities && pitch.facilities.length > 0 && (
            <div className="mt-3">
              <h5>Tiện ích:</h5>
              <ul>
                {pitch.facilities.map((facility, index) => (
                  <li key={index}>✅ {facility}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form đặt sân */}
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Đặt sân ngay</h5>
              <form onSubmit={handleBooking}>
                <div className="mb-3">
                  <label className="form-label">Chọn ngày:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                {bookingDate && (
                  <div className="mb-3">
                    <label className="form-label">Chọn khung giờ:</label>

                    {checkingSlots ? (
                      <div className="text-center py-3">
                        <div
                          className="spinner-border spinner-border-sm text-success"
                          role="status"
                        >
                          <span className="visually-hidden">
                            Đang kiểm tra...
                          </span>
                        </div>
                        <p className="text-muted small mt-2">
                          Đang kiểm tra khung giờ...
                        </p>
                      </div>
                    ) : timeslots.length > 0 ? (
                      <div className="row g-2">
                        {timeslots.map((slot, index) => (
                          <div key={index} className="col-6">
                            <button
                              type="button"
                              className={`btn w-100 ${
                                !slot.is_available
                                  ? "btn-secondary disabled"
                                  : selectedTimeslot?.start_time ===
                                    slot.start_time
                                  ? "btn-success"
                                  : "btn-outline-success"
                              }`}
                              onClick={() =>
                                slot.is_available && setSelectedTimeslot(slot)
                              }
                              disabled={!slot.is_available}
                              style={{ minHeight: "70px" }}
                            >
                              <div className="small">{slot.display_time}</div>
                              <div className="fw-bold">
                                {Number(slot.price).toLocaleString("vi-VN")}đ
                              </div>
                              {!slot.is_available && (
                                <div className="text-danger small">Đã đặt</div>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">Không có khung giờ nào</p>
                    )}
                  </div>
                )}

                {selectedTimeslot && (
                  <div className="alert alert-info">
                    <strong>Khung giờ đã chọn:</strong>{" "}
                    {selectedTimeslot.display_time}
                    <br />
                    <strong>Giá:</strong>{" "}
                    {Number(selectedTimeslot.price).toLocaleString("vi-VN")} đ
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={
                    submitting ||
                    !bookingDate ||
                    !selectedTimeslot ||
                    checkingSlots
                  }
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt sân ngay"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION ĐÁNH GIÁ */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Đánh giá & Nhận xét
              </h3>
              <hr />
              <ReviewList pitchId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDetailPage;
