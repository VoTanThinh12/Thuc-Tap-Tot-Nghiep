import React from 'react';
import { Link } from 'react-router-dom';

const PitchCard = ({ pitch }) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow-sm">
        <img 
          src={pitch.images && pitch.images[0] ? pitch.images[0] : 'https://via.placeholder.com/300x200'} 
          className="card-img-top" 
          alt={pitch.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="card-body">
          <h5 className="card-title">{pitch.name}</h5>
          <p className="card-text">
            <span className="badge bg-primary">{pitch.type}</span>
            <span className="ms-2">📍 {pitch.location}</span>
          </p>
          <p className="card-text">
            <strong>{pitch.price_per_hour.toLocaleString('vi-VN')} đ/giờ</strong>
          </p>
          <Link to={`/pitch/${pitch.id}`} className="btn btn-success w-100">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PitchCard;