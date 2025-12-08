import React from "react";
import { Link } from "react-router-dom";

const PitchCard = ({ pitch }) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow-sm">
        {/* Wrap image trong Link */}
        <Link to={`/pitch/${pitch.id}`} style={{ textDecoration: "none" }}>
          <img
            src={
              pitch.images && pitch.images[0]
                ? pitch.images[0]
                : "https://via.placeholder.com/300x200"
            }
            className="card-img-top"
            alt={pitch.name}
            style={{
              height: "200px",
              objectFit: "cover",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>

        <div className="card-body">
          {/* Wrap tên sân trong Link */}
          <Link
            to={`/pitch/${pitch.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h5 className="card-title" style={{ cursor: "pointer" }}>
              {pitch.name}
            </h5>
          </Link>

          <p className="card-text">
            <span className="badge bg-primary">{pitch.type}</span>
            <span className="ms-2">📍 {pitch.location}</span>
          </p>

          <p className="card-text text-success fw-bold fs-5">
            {Number(pitch.price_per_hour).toLocaleString("vi-VN")} đ/giờ
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
