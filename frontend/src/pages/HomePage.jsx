import React, { useState, useEffect } from 'react';
import { pitchAPI } from '../services/api';
import PitchCard from '../components/PitchCard';
import { toast } from 'react-toastify';

const HomePage = () => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    loadPitches();
  }, []);

  const loadPitches = async () => {
    try {
      const response = await pitchAPI.getAll();
      setPitches(response.data.pitches);
    } catch (error) {
      toast.error('Không thể tải danh sách sân');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await pitchAPI.search({ 
        type: searchType, 
        location: searchLocation 
      });
      setPitches(response.data.pitches);
    } catch (error) {
      toast.error('Tìm kiếm thất bại');
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

  return (
    <div className="container mt-4">
      {/* Banner */}
      <div className="jumbotron bg-success text-white p-5 rounded mb-4">
        <h1 className="display-4">🏟️ Đặt Sân Bóng Mini Nhanh Chóng</h1>
        <p className="lead">Hệ thống quản lý và đặt sân bóng mini tiện lợi nhất</p>
      </div>

      {/* Tìm kiếm */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>🔍 Tìm kiếm sân</h5>
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="">Tất cả loại sân</option>
                <option value="5v5">Sân 5v5</option>
                <option value="7v7">Sân 7v7</option>
              </select>
            </div>
            <div className="col-md-6">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Nhập địa điểm..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100">Tìm kiếm</button>
            </div>
          </form>
        </div>
      </div>

      {/* Danh sách sân */}
      <h3 className="mb-4">Danh sách sân ({pitches.length})</h3>
      <div className="row">
        {pitches.length > 0 ? (
          pitches.map(pitch => (
            <PitchCard key={pitch.id} pitch={pitch} />
          ))
        ) : (
          <div className="col-12 text-center">
            <p>Không tìm thấy sân nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;