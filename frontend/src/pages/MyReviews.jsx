import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import StarRating from "../components/Reviews/StarRating";
import ReviewForm from "../components/Reviews/ReviewForm";
import reviewService from "../services/reviewService";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadMyReviews();
  }, [currentPage]);

  const loadMyReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getMyReviews(currentPage, 10);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Không thể tải đánh giá của bạn");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setShowEditModal(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await reviewService.deleteReview(reviewId);
      loadMyReviews();
    } catch (err) {
      alert("Không thể xóa đánh giá");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Đánh giá của tôi</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {reviews.length === 0 ? (
        <Alert variant="info">Bạn chưa có đánh giá nào</Alert>
      ) : (
        <>
          {reviews.map((review) => (
            <Card key={review.id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h5>{review.pitch_name}</h5>
                    <StarRating rating={review.rating} size={18} />
                    {review.comment && (
                      <p className="mt-2 mb-0">{review.comment}</p>
                    )}
                    <small className="text-muted">
                      Đánh giá ngày: {formatDate(review.created_at)}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(review)}
                    >
                      <FaEdit /> Sửa
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      <FaTrash /> Xóa
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}

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
                    active={currentPage === i + 1}
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

      {/* Modal chỉnh sửa */}
      <ReviewForm
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedReview(null);
        }}
        booking={{ pitch_name: selectedReview?.pitch_name }}
        existingReview={selectedReview}
        onSuccess={loadMyReviews}
      />
    </Container>
  );
};

export default MyReviews;
