import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function FieldsManagement() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await adminAPI.getFields();
        setFields(response.data.fields || []);
      } catch (error) {
        console.error("Failed to load fields", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý sân bóng</h1>
            <p>Quản lý danh sách sân bóng, giá cả, và khung giờ hoạt động</p>
          </div>
          <button className="btn-primary">
            <span>+</span> Thêm sân mới
          </button>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            className="search-input"
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
                  <td colSpan="6">Đang tải dữ liệu...</td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan="6">Không có sân nào</td>
                </tr>
              ) : (
                fields.map((field) => (
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
                        <button className="btn-edit">Sửa</button>
                        <button className="btn-delete">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default FieldsManagement;
