import React, { useState, useEffect } from "react";
import { Card, Alert, Spinner, Button, Pagination } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import StarRating from "./StarRating";
import reviewService from "../../services/reviewService";
import "./ReviewList.css";

const ReviewList = ({ pitchId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
  }, [pitchId, currentPage]);

  const loadReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await reviewService.getReviewsByPitch(
        pitchId,
        currentPage,
        5
      );
      setReviews(response.data.reviews);
      setStats(response.data.stats);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="review-list">
      {/* Thống kê tổng quan */}
      {stats && stats.total_reviews > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <div className="row align-items-center">
              <div className="col-md-4 text-center border-end">
                <h1 className="display-4 mb-0 fw-bold text-warning">
                  {stats.average_rating || 0}
                </h1>
                <StarRating rating={stats.average_rating || 0} size={24} />
                <p className="text-muted mt-2">
                  {stats.total_reviews} đánh giá
                </p>
              </div>
              <div className="col-md-8">
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count =
                      stats[
                        `${
                          [
                            "",
                            "",
                            "",
                            "",
                            "one",
                            "two",
                            "three",
                            "four",
                            "five",
                          ][star]
                        }_star`
                      ] || 0;
                    const percentage =
                      stats.total_reviews > 0
                        ? ((count / stats.total_reviews) * 100).toFixed(0)
                        : 0;

                    return (
                      <div
                        key={star}
                        className="d-flex align-items-center mb-2"
                      >
                        <span className="me-2" style={{ minWidth: "60px" }}>
                          {star} <FaStar color="#ffc107" size={14} />
                        </span>
                        <div
                          className="progress flex-grow-1"
                          style={{ height: "20px" }}
                        >
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {percentage}%
                          </div>
                        </div>
                        <span
                          className="ms-2 text-muted"
                          style={{ minWidth: "40px" }}
                        >
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Danh sách đánh giá */}
      <h5 className="mb-3">Đánh giá từ khách hàng</h5>

      {reviews.length === 0 ? (
        <Alert variant="info">
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sân này!
        </Alert>
      ) : (
        <>
          {reviews.map((review) => (
            <Card key={review.id} className="mb-3 review-card">
              <Card.Body>
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.user_name}
                        className="rounded-circle"
                        width="50"
                        height="50"
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                        style={{ width: "50px", height: "50px" }}
                      >
                        <FaUser color="white" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{review.user_name}</h6>
                        <StarRating rating={review.rating} size={16} />
                      </div>
                      <small className="text-muted">
                        {formatDate(review.created_at)}
                      </small>
                    </div>
                    {review.comment && (
                      <p className="mb-0 text-muted">{review.comment}</p>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;
