import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentService, setCurrentService] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "equipment",
    status: "active",
  });

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    try {
      let params;
      if (filter !== "Tất cả") {
        const categoryMap = {
          "Đồ dùng củ bóng đá": "equipment",
          "Nước uống & Đồ ăn": "beverage",
          "Dịch vụ khác": "other",
        };
        const category = categoryMap[filter];
        params = category ? { category } : undefined;
      }

      const response = await adminAPI.getServices(params);
      setServices(response.data.services || []);
    } catch (error) {
      console.error("Failed to load services", error);
      alert("Lỗi khi tải danh sách dịch vụ");
    }
  };

  // Open modal for adding new service
  const handleAddNew = () => {
    setModalMode("add");
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "equipment",
      status: "active",
    });
    setCurrentService(null);
    setShowModal(true);
  };

  // Open modal for editing service
  const handleEdit = (service) => {
    setModalMode("edit");
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      category: service.category,
      status: service.status,
    });
    setCurrentService(service);
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
    if (!formData.name || !formData.price) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      if (modalMode === "add") {
        await adminAPI.createService(formData);
        alert("Thêm dịch vụ mới thành công!");
      } else {
        await adminAPI.updateService(currentService.id, formData);
        alert("Cập nhật dịch vụ thành công!");
      }

      setShowModal(false);
      fetchServices(); // Reload list
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Handle delete
  const handleDelete = async (service) => {
    if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteService(service.id);
      alert("Xóa dịch vụ thành công!");
      fetchServices(); // Reload list
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Có lỗi khi xóa dịch vụ");
    }
  };

  // Filter services by search term
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get category label
  const getCategoryLabel = (category) => {
    switch (category) {
      case "equipment":
        return "Đồ dùng củ bóng đá";
      case "beverage":
        return "Nước uống & Đồ ăn";
      case "other":
        return "Dịch vụ khác";
      default:
        return category;
    }
  };

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý dịch vụ bổ sung</h1>
            <p>Quản lý các dịch vụ và tiện ích tại sân</p>
          </div>
          <button className="btn-primary" onClick={handleAddNew}>
            <span>+</span> Thêm dịch vụ
          </button>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-buttons">
            {[
              "Tất cả",
              "Đồ dùng củ bóng đá",
              "Nước uống & Đồ ăn",
              "Dịch vụ khác",
            ].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    {searchTerm
                      ? "Không tìm thấy dịch vụ nào"
                      : "Chưa có dịch vụ nào"}
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <strong>{service.name}</strong>
                    </td>
                    <td>
                      <span className="sub-text">
                        {service.description || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="price-tag">
                        {service.price != null
                          ? `${Number(service.price).toLocaleString(
                              "vi-VN"
                            )} VND`
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="category-badge">
                        {getCategoryLabel(service.category)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          service.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {service.status === "active"
                          ? "HOẠT ĐỘNG"
                          : "KHÔNG HOẠT ĐỘNG"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(service)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(service)}
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

      {/* MODAL THÊM/SỬA DỊCH VỤ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "add"
                  ? "Thêm dịch vụ mới"
                  : "Sửa thông tin dịch vụ"}
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
                  Tên dịch vụ <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên dịch vụ"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả về dịch vụ"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Giá (VND) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Nhập giá"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="equipment">Đồ dùng củ bóng đá</option>
                    <option value="beverage">Nước uống & Đồ ăn</option>
                    <option value="other">Dịch vụ khác</option>
                  </select>
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
                  <option value="inactive">Không hoạt động</option>
                </select>
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

export default ServicesManagement;
