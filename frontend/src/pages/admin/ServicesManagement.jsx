import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("Tất cả");

  useEffect(() => {
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
      }
    };

    fetchServices();
  }, [filter]);

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý dịch vụ bổ sung</h1>
            <p>Quản lý các dịch vụ và tiện ích tại sân</p>
          </div>
          <button className="btn-primary">
            <span>+</span> Thêm dịch vụ
          </button>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            className="search-input"
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
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <strong>{service.name}</strong>
                  </td>
                  <td>
                    <span className="sub-text">{service.description}</span>
                  </td>
                  <td>
                    <span className="price-tag">
                      {service.price != null
                        ? `${Number(service.price).toLocaleString("vi-VN")} VND`
                        : "-"}
                    </span>
                  </td>
                  <td>
                    <span className="badge-count">
                      {service.category === "equipment"
                        ? "Đồ dùng củ bóng đá"
                        : service.category === "beverage"
                        ? "Nước uống & Đồ ăn"
                        : "Dịch vụ khác"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        service.status === "active" ? "active" : "inactive"
                      }`}
                    >
                      {service.status === "active"
                        ? "Hoạt động"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ServicesManagement;
