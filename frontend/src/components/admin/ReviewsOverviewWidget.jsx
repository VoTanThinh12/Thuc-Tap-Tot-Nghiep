import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import reviewService from "../../services/reviewService";

const ReviewsOverviewWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Lấy page đầu tiên để tính stats
      const response = await reviewService.getAllReviews(1, 100);
      const reviews = response.data.reviews;

      const totalReviews = response.data.total;
      const avgRating =
        reviews.length > 0
          ? (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1)
          : 0;

      setStats({
        total: totalReviews,
        average: avgRating,
        recent: reviews.slice(0, 5),
      });
    } catch (error) {
      console.error("Error loading review stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <FaStar className="text-warning me-2" />
            Đánh giá
          </h5>
          <Link to="/admin/reviews" className="btn btn-sm btn-outline-primary">
            Xem tất cả
          </Link>
        </div>

        {stats && (
          <>
            <Row className="mb-3">
              <Col>
                <div className="text-center p-3 bg-light rounded">
                  <h2 className="mb-0">{stats.total}</h2>
                  <small className="text-muted">Tổng đánh giá</small>
                </div>
              </Col>
              <Col>
                <div className="text-center p-3 bg-light rounded">
                  <h2 className="mb-0 text-warning">{stats.average}</h2>
                  <small className="text-muted">Trung bình</small>
                </div>
              </Col>
            </Row>

            <h6 className="mb-2">Đánh giá gần đây</h6>
            {stats.recent && stats.recent.length > 0 ? (
              <div className="list-group list-group-flush">
                {stats.recent.map((review) => (
                  <div key={review.id} className="list-group-item px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <small className="fw-bold">{review.user_name}</small>
                      <small className="text-warning">
                        {review.rating} <FaStar size={12} />
                      </small>
                    </div>
                    <small className="text-muted">{review.pitch_name}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">Chưa có đánh giá nào</p>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReviewsOverviewWidget;
