import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { FaStar, FaChartLine } from "react-icons/fa";
import { toast } from "react-toastify";
import reviewService from "../../services/reviewService";
import { pitchAPI } from "../../services/api";
import StarRating from "../../components/Reviews/StarRating";

const PitchReviewStats = () => {
  const [pitches, setPitches] = useState([]);
  const [selectedPitchId, setSelectedPitchId] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPitches, setLoadingPitches] = useState(true);

  useEffect(() => {
    loadPitches();
  }, []);

  useEffect(() => {
    if (selectedPitchId) {
      loadStats();
    }
  }, [selectedPitchId]);

  const loadPitches = async () => {
    try {
      const response = await pitchAPI.getAll();
      setPitches(response.data.pitches || response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách sân");
    } finally {
      setLoadingPitches(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getReviewStats(selectedPitchId);
      setStats(response?.data?.data || null);
    } catch (error) {
      toast.error("Không thể tải thống kê");
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingPercentage = (count) => {
    if (!stats || stats.total_reviews === 0) return 0;
    return ((count / stats.total_reviews) * 100).toFixed(1);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            <FaChartLine className="text-info me-2" />
            Thống kê đánh giá theo sân
          </h2>
          <p className="text-muted">Xem chi tiết đánh giá của từng sân bóng</p>
        </Col>
      </Row>

      {/* Pitch Selector */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Form.Group>
                <Form.Label>Chọn sân bóng</Form.Label>
                {loadingPitches ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Form.Select
                    value={selectedPitchId}
                    onChange={(e) => setSelectedPitchId(e.target.value)}
                    size="lg"
                  >
                    <option value="">-- Chọn sân --</option>
                    {pitches.map((pitch) => (
                      <option key={pitch.id} value={pitch.id}>
                        {pitch.name} - {pitch.location}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Statistics Display */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải thống kê...</p>
        </div>
      ) : selectedPitchId && stats ? (
        <>
          {stats.total_reviews === 0 ? (
            <Alert variant="info">Sân này chưa có đánh giá nào</Alert>
          ) : (
            <>
              {/* Overview Cards */}
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="border-0 shadow-sm text-center">
                    <Card.Body>
                      <h6 className="text-muted mb-3">Đánh giá trung bình</h6>
                      <h1 className="display-3 text-warning mb-2">
                        {stats.average_rating || 0}
                      </h1>
                      <StarRating
                        rating={stats.average_rating || 0}
                        size={24}
                      />
                      <p className="text-muted mt-2">
                        {stats.total_reviews} đánh giá
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={8}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="mb-3">Phân bố đánh giá</h6>
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = parseInt(
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
                          ] || 0
                        );
                        const percentage = getRatingPercentage(count);

                        return (
                          <div key={star} className="mb-3">
                            <div className="d-flex align-items-center mb-1">
                              <span
                                style={{ minWidth: "80px" }}
                                className="me-2"
                              >
                                {star} <FaStar color="#ffc107" size={14} />
                              </span>
                              <div
                                className="progress flex-grow-1"
                                style={{ height: "25px" }}
                              >
                                <div
                                  className={`progress-bar ${
                                    star >= 4
                                      ? "bg-success"
                                      : star === 3
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
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
                                className="ms-3"
                                style={{ minWidth: "60px" }}
                              >
                                <Badge bg="secondary">{count} đánh giá</Badge>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Summary */}
              <Row>
                <Col>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="mb-3">Tóm tắt</h6>
                      <Row>
                        <Col md={3}>
                          <div className="text-center p-3 bg-light rounded">
                            <h2 className="text-success mb-0">
                              {stats.five_star + stats.four_star}
                            </h2>
                            <p className="text-muted mb-0 small">
                              Đánh giá tích cực
                            </p>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center p-3 bg-light rounded">
                            <h2 className="text-warning mb-0">
                              {stats.three_star}
                            </h2>
                            <p className="text-muted mb-0 small">
                              Đánh giá trung bình
                            </p>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center p-3 bg-light rounded">
                            <h2 className="text-danger mb-0">
                              {stats.two_star + stats.one_star}
                            </h2>
                            <p className="text-muted mb-0 small">
                              Đánh giá tiêu cực
                            </p>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center p-3 bg-light rounded">
                            <h2 className="text-primary mb-0">
                              {stats.total_reviews > 0
                                ? (
                                    ((stats.five_star + stats.four_star) /
                                      stats.total_reviews) *
                                    100
                                  ).toFixed(0)
                                : 0}
                              %
                            </h2>
                            <p className="text-muted mb-0 small">
                              Tỷ lệ hài lòng
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </>
      ) : (
        !loading && (
          <Alert variant="info">Vui lòng chọn sân bóng để xem thống kê</Alert>
        )
      )}
    </Container>
  );
};

export default PitchReviewStats;
