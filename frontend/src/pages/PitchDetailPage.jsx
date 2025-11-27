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
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPitchDetail();
  }, [id]);

  useEffect(() => {
    if (bookingDate) {
      loadAvailableTimeslots();
    }
  }, [bookingDate]);

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

  const loadAvailableTimeslots = async () => {
    // Mock data - trong thực tế cần gọi API lấy timeslots theo pitch_id và date
    const mockTimeslots = [
      { id: 1, start_time: '06:00', end_time: '07:00', price: 150000, is_available: true },
      { id: 2, start_time: '07:00', end_time: '08:00', price: 150000, is_available: true },
      { id: 3, start_time: '17:00', end_time: '18:00', price: 180000, is_available: true },
      { id: 4, start_time: '18:00', end_time: '19:00', price: 180000, is_available: true },
      { id: 5, start_time: '19:00', end_time: '20:00', price: 180000, is_available: false },
    ];
    setTimeslots(mockTimeslots);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt sân');
      navigate('/login');
      return;
    }

    if (!bookingDate || !selectedTimeslot) {
      toast.error('Vui lòng chọn ngày và giờ đặt sân');
      return;
    }

    setSubmitting(true);

    try {
      const timeslot = timeslots.find(t => t.id.toString() === selectedTimeslot);
      
      const bookingData = {
        pitch_id: parseInt(id),
        timeslot_id: parseInt(selectedTimeslot),
        booking_date: bookingDate,
        deposit_amount: 0,
        notes: '',
        services: []
      };

      const response = await bookingAPI.create(bookingData);
      toast.success('Đặt sân thành công!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking error:', error);
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

                {bookingDate && timeslots.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Chọn khung giờ:</label>
                    <select
                      className="form-select"
                      value={selectedTimeslot}
                      onChange={(e) => setSelectedTimeslot(e.target.value)}
                      required
                    >
                      <option value="">-- Chọn khung giờ --</option>
                      {timeslots.filter(t => t.is_available).map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.start_time} - {slot.end_time} ({slot.price.toLocaleString('vi-VN')}đ)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={submitting || !bookingDate || !selectedTimeslot}
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