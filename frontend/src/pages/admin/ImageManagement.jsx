import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Table,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";

import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import pitchImageService from "../../services/pitchImageService";

const SERVER_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function toAbsoluteImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SERVER_URL}${url}`;
  return `${SERVER_URL}/${url}`;
}

function ImageManagement() {
  const [fields, setFields] = useState([]);
  const [selectedPitchId, setSelectedPitchId] = useState("");

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    if (!selectedPitchId) {
      setImages([]);
      return;
    }
    loadImages();
  }, [selectedPitchId]);

  const normalizedLinkUrl = useMemo(() => {
    const v = String(linkUrl || "").trim();
    if (!v) return "";

    if (v.startsWith("http://") || v.startsWith("https://")) return v;

    // Non-http: treat as upload path or filename => /uploads/...
    if (v.startsWith("/uploads/")) return v;
    if (v.startsWith("uploads/")) return `/${v}`;
    if (v.startsWith("/")) return `/uploads${v}`;
    return `/uploads/${v}`;
  }, [linkUrl]);

  const isAllowedUploadExt = useMemo(() => {
    const clean = String(normalizedLinkUrl || "")
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();
    const allowed = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".svg",
    ];
    return allowed.some((ext) => clean.endsWith(ext));
  }, [normalizedLinkUrl]);

  const selectedField = useMemo(() => {
    return fields.find((f) => String(f.id) === String(selectedPitchId)) || null;
  }, [fields, selectedPitchId]);

  const loadFields = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminAPI.getFields();
      const list = response.data.fields || [];
      setFields(list);
      if (list.length > 0) {
        setSelectedPitchId(String(list[0].id));
      }
    } catch (e) {
      setError("Không thể tải danh sách sân");
    } finally {
      setLoading(false);
    }
  };

  const handleAddByLink = async (e) => {
    e.preventDefault();

    if (!selectedPitchId) {
      toast.error("Vui lòng chọn sân");
      return;
    }

    const url = normalizedLinkUrl;
    if (!url) {
      toast.error("Vui lòng nhập link ảnh");
      return;
    }

    const isHttp = url.startsWith("http://") || url.startsWith("https://");
    const isUploadPath = url.startsWith("/uploads/");

    if (!isHttp && !isUploadPath) {
      toast.error(
        "Link ảnh chỉ hỗ trợ: link website (http/https) hoặc đường dẫn /uploads/... (hoặc nhập tên file)"
      );
      return;
    }

    if (isUploadPath && !isAllowedUploadExt) {
      toast.error(
        "Đường dẫn upload chỉ hỗ trợ đuôi ảnh: .jpg, .jpeg, .png, .gif, .webp, .bmp, .svg"
      );
      return;
    }

    setAddingLink(true);
    try {
      await pitchImageService.adminCreateByUrl(selectedPitchId, url);
      toast.success("Thêm ảnh bằng link thành công");
      setLinkUrl("");
      await loadImages();
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Thêm ảnh bằng link thất bại");
    } finally {
      setAddingLink(false);
    }
  };

  const loadImages = async () => {
    setLoadingImages(true);
    setError("");
    try {
      const response = await pitchImageService.adminGetAll({
        pitch_id: selectedPitchId,
      });
      setImages(response.data.data || []);
    } catch (e) {
      setError("Không thể tải danh sách ảnh");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedPitchId) {
      toast.error("Vui lòng chọn sân");
      return;
    }

    if (!file) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setUploading(true);
    try {
      await pitchImageService.adminUpload(selectedPitchId, file);
      toast.success("Upload ảnh thành công");
      setFile(null);
      await loadImages();
    } catch (e) {
      toast.error(e.response?.data?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await pitchImageService.adminSetPrimary(imageId);
      toast.success("Đã đặt ảnh chính");
      await loadImages();
    } catch (e) {
      toast.error("Không thể đặt ảnh chính");
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      await pitchImageService.adminDelete(imageId);
      toast.success("Xóa ảnh thành công");
      await loadImages();
    } catch (e) {
      toast.error("Không thể xóa ảnh");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h2 className="mb-0">Quản lý ảnh sân</h2>
            <p className="text-muted">
              Upload, đặt ảnh chính và xóa ảnh theo từng sân
            </p>
          </Col>
        </Row>

        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        <Row className="mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Chọn sân</Form.Label>
                  <Form.Select
                    value={selectedPitchId}
                    onChange={(e) => setSelectedPitchId(e.target.value)}
                  >
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {selectedField && (
                  <div className="text-muted">
                    <div>
                      <strong>ID:</strong> {selectedField.id}
                    </div>
                    {selectedField.location && (
                      <div>
                        <strong>Khu vực:</strong> {selectedField.location}
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Form onSubmit={handleAddByLink}>
                  <Form.Group className="mb-2">
                    <Form.Label>Thêm ảnh bằng link</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      disabled={addingLink}
                    />
                  </Form.Group>

                  {normalizedLinkUrl && (
                    <div className="mb-2">
                      <div className="small text-muted mb-1">Preview</div>
                      <img
                        src={toAbsoluteImageUrl(normalizedLinkUrl)}
                        alt="preview"
                        style={{ width: 120, height: 70, objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={addingLink || !linkUrl.trim()}>
                    {addingLink ? "Đang thêm..." : "Thêm link"}
                  </Button>
                </Form>

                <div className="mt-3">
                  <Form onSubmit={handleUpload}>
                    <Form.Group className="mb-3">
                      <Form.Label>Upload ảnh</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        disabled={uploading}
                      />
                    </Form.Group>
                    <Button type="submit" disabled={uploading || !file}>
                      {uploading ? "Đang upload..." : "Upload"}
                    </Button>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Danh sách ảnh</h5>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={loadImages}
              >
                Tải lại
              </Button>
            </div>

            {loadingImages ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" />
              </div>
            ) : images.length === 0 ? (
              <Alert variant="info" className="mb-0">
                Chưa có ảnh nào cho sân này.
              </Alert>
            ) : (
              <Table responsive hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>URL</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((img) => (
                    <tr key={img.id}>
                      <td style={{ width: 120 }}>
                        <img
                          src={toAbsoluteImageUrl(img.image_url)}
                          alt="pitch"
                          style={{ width: 100, height: 70, objectFit: "cover" }}
                        />
                      </td>
                      <td>
                        <div style={{ maxWidth: 520, wordBreak: "break-all" }}>
                          {img.image_url}
                        </div>
                      </td>
                      <td>
                        {img.is_primary ? (
                          <Badge bg="success">Ảnh chính</Badge>
                        ) : (
                          <Badge bg="secondary">Phụ</Badge>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {!img.is_primary && (
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleSetPrimary(img.id)}
                            >
                              Đặt ảnh chính
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(img.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
}

export default ImageManagement;
