import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pitchAPI, bookingAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PitchDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPitchDetail();
  }, [id]);

  const loadPitchDetail = async () => {
    try {
      const response = await pitchAPI.getById(id);
      setPitch(response.data.pitch);
    } catch (error) {
      toast.error('Không thể tải thông tin sân');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt sân');
      navigate('/login');
      return;
    }

    if (!bookingDate || !selectedTime) {
      toast.error('Vui lòng chọn ngày và giờ đặt sân');
      return;
    }

    setSubmitting(true);

    try {
      // Tạm thời giả lập booking (cần tạo timeslot trước trong thực tế)
      const bookingData = {
        pitch_id: pitch.id,
        timeslot_id: 1, // Giả lập - cần logic tạo/chọn timeslot thực tế
        booking_date: bookingDate,
        total_price: pitch.price_per_hour
      };

      await bookingAPI.create(bookingData);
      toast.success('Đặt sân thành công!');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt sân thất bại');
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
    <div className="container mt-4">
      <div className="row">
        {/* Hình ảnh sân */}
        <div className="col-md-6">
          <img
            src={pitch.images && pitch.images[0] ? pitch.images[0] : 'https://via.placeholder.com/600x400'}
            alt={pitch.name}
            className="img-fluid rounded shadow"
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
          />
        </div>

        {/* Thông tin sân */}
        <div className="col-md-6">
          <h2>{pitch.name}</h2>
          <p className="text-muted">
            <span className="badge bg-primary me-2">{pitch.type}</span>
            <span>📍 {pitch.location}</span>
          </p>

          <hr />

          <h4 className="text-success">
            {pitch.price_per_hour.toLocaleString('vi-VN')} đ/giờ
          </h4>

          <div className="mt-3">
            <h5>Mô tả:</h5>
            <p>{pitch.description || 'Chưa có mô tả'}</p>
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
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Chọn giờ:</label>
                  <select
                    className="form-select"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn khung giờ --</option>
                    <option value="06:00">06:00 - 07:00</option>
                    <option value="07:00">07:00 - 08:00</option>
                    <option value="08:00">08:00 - 09:00</option>
                    <option value="17:00">17:00 - 18:00</option>
                    <option value="18:00">18:00 - 19:00</option>
                    <option value="19:00">19:00 - 20:00</option>
                    <option value="20:00">20:00 - 21:00</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : 'Đặt sân ngay'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDetailPage;