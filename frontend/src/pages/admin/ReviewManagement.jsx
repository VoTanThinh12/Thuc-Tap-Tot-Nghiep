import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { FaTrash, FaEye, FaStar, FaSearch, FaChartBar } from "react-icons/fa";
import { toast } from "react-toastify";
import reviewService from "../../services/reviewService";
import StarRating from "../../components/Reviews/StarRating";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    loadReviews();
  }, [currentPage]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getAllReviews(currentPage, 20);
      const payload = response?.data?.data;
      setReviews(payload?.reviews || []);
      setTotalPages(payload?.totalPages || 1);
      setTotalReviews(payload?.total || 0);
    } catch (error) {
      toast.error("Không thể tải danh sách đánh giá");
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    setDeleting(true);
    try {
      await reviewService.deleteReviewAdmin(reviewToDelete.id);
      toast.success("Xóa đánh giá thành công");
      setShowDeleteModal(false);
      setReviewToDelete(null);
      loadReviews();
    } catch (error) {
      toast.error("Không thể xóa đánh giá");
      console.error("Error deleting review:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter reviews based on search and rating
  const filteredReviews = reviews.filter((review) => {
    const matchSearch =
      searchTerm === "" ||
      review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.pitch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment &&
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRating =
      filterRating === "all" || review.rating === parseInt(filterRating);

    return matchSearch && matchRating;
  });

  // Calculate statistics
  const stats = {
    total: totalReviews,
    averageRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0,
    fiveStar: reviews.filter((r) => r.rating === 5).length,
    fourStar: reviews.filter((r) => r.rating === 4).length,
    threeStar: reviews.filter((r) => r.rating === 3).length,
    twoStar: reviews.filter((r) => r.rating === 2).length,
    oneStar: reviews.filter((r) => r.rating === 1).length,
  };

  if (loading && currentPage === 1) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            <FaStar className="text-warning me-2" />
            Quản lý đánh giá
          </h2>
          <p className="text-muted">Xem, tìm kiếm và quản lý đánh giá của khách hàng</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tổng đánh giá</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
                <div className="text-primary">
                  <FaChartBar size={32} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Trung bình</h6>
                  <h3 className="mb-0">
                    {stats.averageRating}{" "}
                    <FaStar className="text-warning" size={20} />
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-muted mb-2">5 sao</h6>
              <div className="d-flex align-items-center">
                <div
                  className="progress flex-grow-1"
                  style={{ height: "10px" }}
                >
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.fiveStar / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="ms-2 fw-bold">{stats.fiveStar}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-muted mb-2">1 sao</h6>
              <div className="d-flex align-items-center">
                <div
                  className="progress flex-grow-1"
                  style={{ height: "10px" }}
                >
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.oneStar / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="ms-2 fw-bold">{stats.oneStar}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên khách hàng, sân bóng, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="all">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Reviews Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredReviews.length === 0 ? (
            <Alert variant="info" className="m-4">
              Không tìm thấy đánh giá nào
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Khách hàng</th>
                      <th>Sân bóng</th>
                      <th>Đánh giá</th>
                      <th>Nội dung</th>
                      <th>Ngày tạo</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review.id}>
                        <td className="align-middle">#{review.id}</td>
                        <td className="align-middle">
                          <div>
                            <strong>{review.user_name}</strong>
                            <br />
                            <small className="text-muted">{review.email}</small>
                          </div>
                        </td>
                        <td className="align-middle">{review.pitch_name}</td>
                        <td className="align-middle">
                          <StarRating rating={review.rating} size={16} />
                        </td>
                        <td className="align-middle">
                          {review.comment ? (
                            <div style={{ maxWidth: "300px" }}>
                              {review.comment.length > 100
                                ? `${review.comment.substring(0, 100)}...`
                                : review.comment}
                            </div>
                          ) : (
                            <span className="text-muted">
                              Không có nhận xét
                            </span>
                          )}
                        </td>
                        <td className="align-middle">
                          <small>{formatDate(review.created_at)}</small>
                        </td>
                        <td className="align-middle text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewDetail(review)}
                          >
                            <FaEye /> Chi tiết
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(review)}
                          >
                            <FaTrash /> Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center py-3">
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
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && (
        <div
          className="admin-detail-modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="admin-detail-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-detail-modal-header">
              <h2>Chi tiết đánh giá #{selectedReview?.id}</h2>
              <button
                className="admin-detail-modal-close"
                onClick={() => setShowDetailModal(false)}
                type="button"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="admin-detail-modal-body no-scroll">
              {selectedReview && (
                <div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <h6 className="text-muted">Khách hàng</h6>
                      <p className="mb-0">
                        <strong>{selectedReview.user_name}</strong>
                        <br />
                        <small className="text-muted">{selectedReview.email}</small>
                      </p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted">Sân bóng</h6>
                      <p className="mb-0">
                        <strong>{selectedReview.pitch_name}</strong>
                      </p>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <h6 className="text-muted">Đánh giá</h6>
                      <StarRating rating={selectedReview.rating} size={24} />
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted">Booking ID</h6>
                      <p className="mb-0">#{selectedReview.booking_id}</p>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <h6 className="text-muted">Nhận xét</h6>
                      {selectedReview.comment ? (
                        <Card className="bg-light border-0">
                          <Card.Body>
                            <p className="mb-0">{selectedReview.comment}</p>
                          </Card.Body>
                        </Card>
                      ) : (
                        <p className="text-muted">Không có nhận xét</p>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <h6 className="text-muted">Ngày tạo</h6>
                      <p className="mb-0">{formatDate(selectedReview.created_at)}</p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted">Cập nhật lần cuối</h6>
                      <p className="mb-0">{formatDate(selectedReview.updated_at)}</p>
                    </Col>
                  </Row>
                </div>
              )}
            </div>

            <div className="admin-detail-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  setShowDetailModal(false);
                  handleDeleteClick(selectedReview);
                }}
              >
                <FaTrash className="me-2" /> Xóa đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="admin-modal-dark"
        dialogClassName="admin-modal-dark-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewToDelete && (
            <div>
              <Alert variant="warning">
                <strong>Cảnh báo!</strong> Bạn có chắc chắn muốn xóa đánh giá
                này?
              </Alert>
              <p>
                <strong>Khách hàng:</strong> {reviewToDelete.user_name}
                <br />
                <strong>Sân:</strong> {reviewToDelete.pitch_name}
                <br />
                <strong>Đánh giá:</strong>{" "}
                <StarRating rating={reviewToDelete.rating} size={16} />
              </p>
              <p className="text-muted small">
                Hành động này không thể hoàn tác!
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xóa...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Xác nhận xóa
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReviewManagement;
