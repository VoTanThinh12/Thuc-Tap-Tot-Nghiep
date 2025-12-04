import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function FieldsManagement() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentField, setCurrentField] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "5v5",
    price_per_hour: "",
    status: "active",
    description: "",
  });

  // Fetch fields
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFields();
      setFields(response.data.fields || []);
    } catch (error) {
      console.error("Failed to load fields", error);
      alert("Lỗi khi tải danh sách sân");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new field
  const handleAddNew = () => {
    setModalMode("add");
    setFormData({
      name: "",
      location: "",
      type: "5v5",
      price_per_hour: "",
      status: "active",
      description: "",
    });
    setCurrentField(null);
    setShowModal(true);
  };

  // Open modal for editing field
  const handleEdit = (field) => {
    setModalMode("edit");
    setFormData({
      name: field.name,
      location: field.location,
      type: field.type,
      price_per_hour: field.price_per_hour,
      status: field.status,
      description: field.description || "",
    });
    setCurrentField(field);
    setShowModal(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.location || !formData.price_per_hour) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      if (modalMode === "add") {
        await adminAPI.createField(formData);
        alert("Thêm sân mới thành công!");
      } else {
        await adminAPI.updateField(currentField.id, formData);
        alert("Cập nhật sân thành công!");
      }

      setShowModal(false);
      fetchFields(); // Reload list
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Handle delete
  const handleDelete = async (field) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sân "${field.name}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteField(field.id);
      alert("Xóa sân thành công!");
      fetchFields(); // Reload list
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Có lỗi khi xóa sân");
    }
  };

  // Filter fields by search term
  const filteredFields = fields.filter(
    (field) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý sân bóng</h1>
            <p>Quản lý danh sách sân bóng, giá cả, và khung giờ hoạt động</p>
          </div>
          <button className="btn-primary" onClick={handleAddNew}>
            <span>+</span> Thêm sân mới
          </button>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Tên sân</th>
                <th>Địa điểm</th>
                <th>Loại</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredFields.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    {searchTerm ? "Không tìm thấy sân nào" : "Chưa có sân nào"}
                  </td>
                </tr>
              ) : (
                filteredFields.map((field) => (
                  <tr key={field.id}>
                    <td>
                      <strong>{field.name}</strong>
                    </td>
                    <td>{field.location}</td>
                    <td>{field.type}</td>
                    <td>
                      <span className="price-tag">
                        {field.price_per_hour != null
                          ? `${Number(field.price_per_hour).toLocaleString(
                              "vi-VN"
                            )} VND`
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          field.status === "active"
                            ? "active"
                            : field.status === "maintenance"
                            ? "inactive"
                            : "inactive"
                        }`}
                      >
                        {field.status === "active"
                          ? "Hoạt động"
                          : field.status === "maintenance"
                          ? "Bảo trì"
                          : "Không hoạt động"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(field)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(field)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM/SỬA SÂN */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "add" ? "Thêm sân mới" : "Sửa thông tin sân"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Tên sân <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên sân"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Địa điểm <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Nhập địa điểm"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại sân</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="5v5">5v5</option>
                    <option value="7v7">7v7</option>
                    <option value="11v11">11v11</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Giá/giờ (VND) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="price_per_hour"
                    value={formData.price_per_hour}
                    onChange={handleInputChange}
                    placeholder="Nhập giá"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Hoạt động</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả về sân"
                  rows="3"
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === "add" ? "Thêm mới" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default FieldsManagement;
