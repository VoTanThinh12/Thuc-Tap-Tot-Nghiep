import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import StarRating from "./StarRating";
import reviewService from "../../services/reviewService";

const ReviewForm = ({
  show,
  onHide,
  booking,
  onSuccess,
  existingReview = null,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (existingReview) {
        // Cập nhật review
        await reviewService.updateReview(existingReview.id, {
          rating,
          comment,
        });
      } else {
        // Tạo review mới
        await reviewService.createReview({
          booking_id: booking.id,
          pitch_id: booking.pitch_id,
          rating,
          comment,
        });
      }

      onSuccess();
      onHide();

      // Reset form
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {existingReview ? "Chỉnh sửa đánh giá" : "Đánh giá sân bóng"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Sân bóng</Form.Label>
            <p className="fw-bold">{booking?.pitch_name}</p>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Đánh giá của bạn <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex align-items-center">
              <StarRating
                rating={rating}
                interactive={true}
                size={32}
                onRatingChange={setRating}
              />
              {rating > 0 && (
                <span className="ms-3 badge bg-primary">{rating} sao</span>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nhận xét (tùy chọn)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sân bóng này..."
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {comment.length}/500 ký tự
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || rating === 0}
            >
              {loading
                ? "Đang gửi..."
                : existingReview
                ? "Cập nhật"
                : "Gửi đánh giá"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReviewForm;
