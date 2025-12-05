import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminAPI } from "../../services/api";
import "./Management.css";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("system");
  const [loading, setLoading] = useState(false);

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    businessName: "SoccerHub - Sân Bóng Mini",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    phone: "0123456789",
    email: "contact@soccerhub.vn",
    description: "Hệ thống sân bóng mini chất lượng cao",
    logo: "",
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    slotDuration: 90,
    openTime: "06:00",
    closeTime: "23:00",
    advanceBookingDays: 30,
    minCancelHours: 24,
    autoConfirm: false,
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    requireDeposit: true,
    depositPercentage: 30,
    paymentMethods: ["cash", "transfer", "momo"],
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewBooking: true,
    emailOnCancel: true,
    reminderBeforeHours: 2,
    sendCustomerReminder: true,
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Theme Settings
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      if (response.data.settings) {
        const s = response.data.settings;
        if (s.system) setSystemSettings(s.system);
        if (s.booking) setBookingSettings(s.booking);
        if (s.payment) setPaymentSettings(s.payment);
        if (s.notification) setNotificationSettings(s.notification);
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.updateSettings("system", systemSettings);
      alert("Lưu cài đặt hệ thống thành công!");
    } catch (error) {
      alert(
        "Lỗi khi lưu cài đặt: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBookingSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.updateSettings("booking", bookingSettings);
      alert("Lưu cài đặt đặt sân thành công!");
    } catch (error) {
      alert(
        "Lỗi khi lưu cài đặt: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.updateSettings("payment", paymentSettings);
      alert("Lưu cài đặt thanh toán thành công!");
    } catch (error) {
      alert(
        "Lỗi khi lưu cài đặt: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.updateSettings("notification", notificationSettings);
      alert("Lưu cài đặt thông báo thành công!");
    } catch (error) {
      alert(
        "Lỗi khi lưu cài đặt: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = async () => {
    if (!window.confirm("Bạn có chắc muốn backup dữ liệu?")) return;

    setLoading(true);
    try {
      const response = await adminAPI.backupData();
      alert("Backup dữ liệu thành công!");

      // Download backup file if provided
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, "_blank");
      }
    } catch (error) {
      alert(
        "Lỗi khi backup: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (
      !window.confirm(
        "Đăng xuất tất cả phiên đăng nhập? Bạn sẽ phải đăng nhập lại."
      )
    )
      return;

    setLoading(true);
    try {
      await adminAPI.logoutAllSessions();
      alert("Đã đăng xuất tất cả phiên đăng nhập!");
      window.location.href = "/admin/login";
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "system":
        return (
          <form onSubmit={handleSaveSystemSettings}>
            <div className="form-group">
              <label>
                Tên doanh nghiệp <span className="required">*</span>
              </label>
              <input
                type="text"
                value={systemSettings.businessName}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    businessName: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Địa chỉ <span className="required">*</span>
              </label>
              <input
                type="text"
                value={systemSettings.address}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    address: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  value={systemSettings.phone}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={systemSettings.email}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                value={systemSettings.description}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Logo URL</label>
              <input
                type="url"
                value={systemSettings.logo}
                onChange={(e) =>
                  setSystemSettings({ ...systemSettings, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
              <small>Nhập URL hình ảnh logo của bạn</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        );

      case "booking":
        return (
          <form onSubmit={handleSaveBookingSettings}>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Thời gian mỗi slot (phút) <span className="required">*</span>
                </label>
                <select
                  value={bookingSettings.slotDuration}
                  onChange={(e) =>
                    setBookingSettings({
                      ...bookingSettings,
                      slotDuration: Number(e.target.value),
                    })
                  }
                  required
                >
                  <option value={60}>60 phút</option>
                  <option value={90}>90 phút</option>
                  <option value={120}>120 phút</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Đặt trước tối đa (ngày) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={bookingSettings.advanceBookingDays}
                  onChange={(e) =>
                    setBookingSettings({
                      ...bookingSettings,
                      advanceBookingDays: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Giờ mở cửa <span className="required">*</span>
                </label>
                <input
                  type="time"
                  value={bookingSettings.openTime}
                  onChange={(e) =>
                    setBookingSettings({
                      ...bookingSettings,
                      openTime: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Giờ đóng cửa <span className="required">*</span>
                </label>
                <input
                  type="time"
                  value={bookingSettings.closeTime}
                  onChange={(e) =>
                    setBookingSettings({
                      ...bookingSettings,
                      closeTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Thời gian tối thiểu để hủy (giờ){" "}
                <span className="required">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="72"
                value={bookingSettings.minCancelHours}
                onChange={(e) =>
                  setBookingSettings({
                    ...bookingSettings,
                    minCancelHours: Number(e.target.value),
                  })
                }
                required
              />
              <small>Khách hàng phải hủy trước ít nhất X giờ</small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={bookingSettings.autoConfirm}
                  onChange={(e) =>
                    setBookingSettings({
                      ...bookingSettings,
                      autoConfirm: e.target.checked,
                    })
                  }
                />
                Tự động xác nhận đơn đặt
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        );

      case "payment":
        return (
          <form onSubmit={handleSavePaymentSettings}>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={paymentSettings.requireDeposit}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      requireDeposit: e.target.checked,
                    })
                  }
                />
                Yêu cầu đặt cọc
              </label>
            </div>

            {paymentSettings.requireDeposit && (
              <div className="form-group">
                <label>
                  Phần trăm đặt cọc (%) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={paymentSettings.depositPercentage}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      depositPercentage: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Phương thức thanh toán</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={paymentSettings.paymentMethods.includes("cash")}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...paymentSettings.paymentMethods, "cash"]
                        : paymentSettings.paymentMethods.filter(
                            (m) => m !== "cash"
                          );
                      setPaymentSettings({
                        ...paymentSettings,
                        paymentMethods: methods,
                      });
                    }}
                  />
                  Tiền mặt
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={paymentSettings.paymentMethods.includes(
                      "transfer"
                    )}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...paymentSettings.paymentMethods, "transfer"]
                        : paymentSettings.paymentMethods.filter(
                            (m) => m !== "transfer"
                          );
                      setPaymentSettings({
                        ...paymentSettings,
                        paymentMethods: methods,
                      });
                    }}
                  />
                  Chuyển khoản
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={paymentSettings.paymentMethods.includes("momo")}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...paymentSettings.paymentMethods, "momo"]
                        : paymentSettings.paymentMethods.filter(
                            (m) => m !== "momo"
                          );
                      setPaymentSettings({
                        ...paymentSettings,
                        paymentMethods: methods,
                      });
                    }}
                  />
                  Ví MoMo
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        );

      case "notification":
        return (
          <form onSubmit={handleSaveNotificationSettings}>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailOnNewBooking}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailOnNewBooking: e.target.checked,
                    })
                  }
                />
                Gửi email khi có đơn đặt mới
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailOnCancel}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailOnCancel: e.target.checked,
                    })
                  }
                />
                Gửi email khi khách hàng hủy đơn
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationSettings.sendCustomerReminder}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      sendCustomerReminder: e.target.checked,
                    })
                  }
                />
                Gửi nhắc nhở khách hàng trước giờ đá
              </label>
            </div>

            {notificationSettings.sendCustomerReminder && (
              <div className="form-group">
                <label>
                  Nhắc trước bao nhiêu giờ <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={notificationSettings.reminderBeforeHours}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      reminderBeforeHours: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        );

      case "security":
        return (
          <div className="security-section">
            <div className="security-card">
              <h3>Đổi mật khẩu</h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>
                    Mật khẩu hiện tại <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Mật khẩu mới <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                  />
                  <small>Tối thiểu 6 ký tự</small>
                </div>

                <div className="form-group">
                  <label>
                    Xác nhận mật khẩu mới <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>

            <div className="security-card">
              <h3>Quản lý phiên đăng nhập</h3>
              <p>
                Đăng xuất tất cả các phiên đăng nhập khác (ngoại trừ phiên hiện
                tại)
              </p>
              <button
                className="btn-danger"
                onClick={handleLogoutAllSessions}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng xuất tất cả phiên"}
              </button>
            </div>

            <div className="security-card">
              <h3>Backup dữ liệu</h3>
              <p>Tạo bản sao lưu toàn bộ dữ liệu hệ thống</p>
              <button
                className="btn-secondary"
                onClick={handleBackupData}
                disabled={loading}
              >
                {loading ? "Đang backup..." : "Backup ngay"}
              </button>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div>
            <h3>Giao diện</h3>
            <div className="theme-selector">
              <div className="form-group">
                <label>Chọn chế độ hiển thị</label>
                <div className="theme-options">
                  <div
                    className={`theme-option ${
                      theme === "light" ? "active" : ""
                    }`}
                    onClick={() => setTheme("light")}
                  >
                    <div className="theme-preview light-preview">
                      <div className="preview-header"></div>
                      <div className="preview-body">
                        <div className="preview-card"></div>
                        <div className="preview-card"></div>
                      </div>
                    </div>
                    <div className="theme-name">☀️ Sáng</div>
                  </div>

                  <div
                    className={`theme-option ${
                      theme === "dark" ? "active" : ""
                    }`}
                    onClick={() => setTheme("dark")}
                  >
                    <div className="theme-preview dark-preview">
                      <div className="preview-header"></div>
                      <div className="preview-body">
                        <div className="preview-card"></div>
                        <div className="preview-card"></div>
                      </div>
                    </div>
                    <div className="theme-name">🌙 Tối</div>
                  </div>
                </div>
              </div>

              <div className="theme-info">
                <p>✅ Thay đổi được áp dụng tự động</p>
                <p>💡 Cài đặt sẽ được lưu trên trình duyệt của bạn</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1>Cài đặt</h1>
            <p>Quản lý cài đặt hệ thống và tùy chỉnh</p>
          </div>
        </div>

        <div className="settings-container">
          <div className="settings-tabs">
            <button
              className={`tab-button ${activeTab === "system" ? "active" : ""}`}
              onClick={() => setActiveTab("system")}
            >
              ⚙️ Hệ thống
            </button>
            <button
              className={`tab-button ${
                activeTab === "booking" ? "active" : ""
              }`}
              onClick={() => setActiveTab("booking")}
            >
              📅 Đặt sân
            </button>
            <button
              className={`tab-button ${
                activeTab === "payment" ? "active" : ""
              }`}
              onClick={() => setActiveTab("payment")}
            >
              💳 Thanh toán
            </button>
            <button
              className={`tab-button ${
                activeTab === "notification" ? "active" : ""
              }`}
              onClick={() => setActiveTab("notification")}
            >
              🔔 Thông báo
            </button>
            <button
              className={`tab-button ${
                activeTab === "security" ? "active" : ""
              }`}
              onClick={() => setActiveTab("security")}
            >
              🔒 Bảo mật
            </button>
            <button
              className={`tab-button ${
                activeTab === "appearance" ? "active" : ""
              }`}
              onClick={() => setActiveTab("appearance")}
            >
              🎨 Giao diện
            </button>
          </div>

          <div className="settings-content">{renderTabContent()}</div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default SettingsPage;
