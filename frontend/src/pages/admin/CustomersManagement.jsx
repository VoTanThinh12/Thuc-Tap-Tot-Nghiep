import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function CustomersManagement() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await adminAPI.getCustomers(
          search ? { search } : undefined
        );
        const data = response.data.customers || [];
        setCustomers(
          data.map((c) => ({
            id: c.id,
            name: c.full_name,
            email: c.email,
            phone: c.phone,
            bookings: c.total_bookings || 0,
            spent: c.total_spent || 0,
            joinDate: c.created_at
              ? new Date(c.created_at).toLocaleDateString("vi-VN")
              : "",
            active: c.is_active === 1,
          }))
        );
      } catch (error) {
        console.error("Failed to load customers", error);
      }
    };

    fetchCustomers();
  }, [search]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getCustomerStats();
        setStats(response.data.stats || null);
      } catch (error) {
        console.error("Failed to load customer stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Quản lý khách hàng</h1>
            <p>Quản lý danh sách khách hàng và lịch sử sử dụng dịch vụ</p>
          </div>
          <div className="stats-mini">
            <div className="stat-mini">
              Tổng khách hàng:{" "}
              <strong>{stats ? stats.totalCustomers : 0}</strong>
            </div>
            <div className="stat-mini">
              Khách hoạt động:{" "}
              <strong>{stats ? stats.activeCustomers : 0}</strong>
            </div>
            <div className="stat-mini">
              Tổng chi tiêu:{" "}
              <strong>
                {stats
                  ? `${Number(stats.totalRevenue || 0).toLocaleString(
                      "vi-VN"
                    )} VND`
                  : "0 VND"}
              </strong>
            </div>
            <div className="stat-mini">
              Trung bình/khách:{" "}
              <strong>
                {stats
                  ? `${Number(stats.avgSpending || 0).toLocaleString(
                      "vi-VN"
                    )} VND`
                  : "0 VND"}
              </strong>
            </div>
          </div>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Số lần đặt</th>
                <th>Tổng chi</th>
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>
                  <td>
                    <span className="sub-text">{customer.email}</span>
                  </td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className="badge-count">{customer.bookings}</span>
                  </td>
                  <td>
                    <span className="price-tag">{customer.spent}</span>
                  </td>
                  <td>{customer.joinDate}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        customer.active ? "active" : "inactive"
                      }`}
                    >
                      {customer.active ? "Hoạt động" : "Không hoạt động"}
                    </span>
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

export default CustomersManagement;
