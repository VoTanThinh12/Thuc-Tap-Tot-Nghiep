import React, { useState, useEffect } from "react";
import { Card, Alert, Spinner, Pagination } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import api from "../../services/api";
import StarRating from "./StarRating";

const ReviewList = ({ pitchId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [pitchId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/reviews/pitch/${pitchId}?page=${currentPage}&limit=5`
      );

      if (response.data.success) {
        setReviews(response.data.data.reviews || []);

        const rawStats = response.data.data.stats || {};
        setStats({
          average_rating: Number(rawStats.average_rating) || 0,
          total_reviews: Number(rawStats.total_reviews) || 0,
          five_star: Number(rawStats.five_star) || 0,
          four_star: Number(rawStats.four_star) || 0,
          three_star: Number(rawStats.three_star) || 0,
          two_star: Number(rawStats.two_star) || 0,
          one_star: Number(rawStats.one_star) || 0,
        });
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
      // Set default stats khi có lỗi
      setStats({
        average_rating: 0,
        total_reviews: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRatingBreakdown = () => {
    if (!stats || stats.total_reviews === 0) {
      return (
        <div className="text-center text-muted py-3">Chưa có đánh giá nào</div>
      );
    }

    const ratingBars = [
      { star: 5, count: stats.five_star || 0 },
      { star: 4, count: stats.four_star || 0 },
      { star: 3, count: stats.three_star || 0 },
      { star: 2, count: stats.two_star || 0 },
      { star: 1, count: stats.one_star || 0 },
    ];

    return (
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <div className="text-center me-4">
            <h2 className="mb-0">{(Number(stats.average_rating) || 0).toFixed(1)}</h2>
            <StarRating
              rating={Number(stats.average_rating) || 0}
              size={20}
              showNumber={false}
            />
            <small className="text-muted">{stats.total_reviews} đánh giá</small>
          </div>
          <div className="flex-grow-1">
            {ratingBars.map(({ star, count }) => {
              const percentage =
                stats.total_reviews > 0
                  ? ((count / stats.total_reviews) * 100).toFixed(0)
                  : 0;

              return (
                <div key={star} className="d-flex align-items-center mb-1">
                  <span className="me-2" style={{ width: "30px" }}>
                    {star} ⭐
                  </span>
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "8px" }}
                  >
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span
                    className="ms-2 text-muted"
                    style={{ width: "40px", fontSize: "0.875rem" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading && currentPage === 1) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-4">Đánh giá & Nhận xét</h4>

        {error && (
          <Alert variant="warning" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {renderRatingBreakdown()}

        {reviews.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>Chưa có đánh giá nào cho sân này.</p>
            <small>Hãy là người đầu tiên đánh giá!</small>
          </div>
        ) : (
          <>
            <div className="reviews-list">
              {reviews.map((review) => (
                <Card key={review.id} className="mb-3 border">
                  <Card.Body>
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        {review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.user_name}
                            className="rounded-circle"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                            style={{ width: "50px", height: "50px" }}
                          >
                            <FaUser size={24} color="white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">
                              {review.user_name || "Người dùng"}
                            </h6>
                            <StarRating
                              rating={review.rating}
                              size={16}
                              showNumber={false}
                            />
                          </div>
                          <small className="text-muted">
                            {review.formatted_date ||
                              new Date(review.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
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
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
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
      </Card.Body>
    </Card>
  );
};

export default ReviewList;
