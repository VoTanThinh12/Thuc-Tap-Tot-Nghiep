const db = require("../config/database");

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM settings");

    // Convert rows to object
    const settingsData = {};
    rows.forEach((row) => {
      settingsData[row.setting_key] = row.setting_value;
    });

    // Group by category
    const settings = {
      system: {
        businessName: settingsData.business_name || "SoccerHub",
        address: settingsData.business_address || "",
        phone: settingsData.business_phone || "",
        email: settingsData.business_email || "",
        description: settingsData.business_description || "",
        logo: settingsData.business_logo || "",
      },
      booking: {
        slotDuration: parseInt(settingsData.booking_slot_duration || "90"),
        openTime: settingsData.booking_open_time || "06:00",
        closeTime: settingsData.booking_close_time || "23:00",
        advanceBookingDays: parseInt(settingsData.booking_advance_days || "30"),
        minCancelHours: parseInt(settingsData.booking_min_cancel_hours || "24"),
        autoConfirm: settingsData.booking_auto_confirm === "1",
      },
      payment: {
        requireDeposit: settingsData.payment_require_deposit === "1",
        depositPercentage: parseInt(
          settingsData.payment_deposit_percentage || "30"
        ),
        paymentMethods: settingsData.payment_methods
          ? settingsData.payment_methods.split(",")
          : ["cash"],
      },
      notification: {
        emailOnNewBooking: settingsData.notification_email_new_booking === "1",
        emailOnCancel: settingsData.notification_email_cancel === "1",
        reminderBeforeHours: parseInt(
          settingsData.notification_reminder_hours || "2"
        ),
        sendCustomerReminder:
          settingsData.notification_send_customer_reminder === "1",
      },
    };

    res.json({
      success: true,
      settings: settings,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải cài đặt",
      error: error.message,
    });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const { type } = req.params;
    const data = req.body;

    let updates = [];

    if (type === "system") {
      updates = [
        ["business_name", data.businessName],
        ["business_address", data.address],
        ["business_phone", data.phone],
        ["business_email", data.email],
        ["business_description", data.description],
        ["business_logo", data.logo || ""],
      ];
    } else if (type === "booking") {
      updates = [
        ["booking_slot_duration", data.slotDuration.toString()],
        ["booking_open_time", data.openTime],
        ["booking_close_time", data.closeTime],
        ["booking_advance_days", data.advanceBookingDays.toString()],
        ["booking_min_cancel_hours", data.minCancelHours.toString()],
        ["booking_auto_confirm", data.autoConfirm ? "1" : "0"],
      ];
    } else if (type === "payment") {
      updates = [
        ["payment_require_deposit", data.requireDeposit ? "1" : "0"],
        ["payment_deposit_percentage", data.depositPercentage.toString()],
        ["payment_methods", data.paymentMethods.join(",")],
      ];
    } else if (type === "notification") {
      updates = [
        ["notification_email_new_booking", data.emailOnNewBooking ? "1" : "0"],
        ["notification_email_cancel", data.emailOnCancel ? "1" : "0"],
        ["notification_reminder_hours", data.reminderBeforeHours.toString()],
        [
          "notification_send_customer_reminder",
          data.sendCustomerReminder ? "1" : "0",
        ],
      ];
    }

    // Update each setting
    for (const [key, value] of updates) {
      await db.query(
        "UPDATE settings SET setting_value = ? WHERE setting_key = ?",
        [value, key]
      );
    }

    res.json({
      success: true,
      message: "Cập nhật cài đặt thành công",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật cài đặt",
      error: error.message,
    });
  }
};

// Change password (giữ nguyên)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    const [admin] = await db.query("SELECT password FROM admins WHERE id = ?", [
      adminId,
    ]);

    if (!admin[0]) {
      return res.status(404).json({
        success: false,
        message: "Admin không tồn tại",
      });
    }

    if (admin[0].password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    await db.query("UPDATE admins SET password = ? WHERE id = ?", [
      newPassword,
      adminId,
    ]);

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đổi mật khẩu",
      error: error.message,
    });
  }
};

// Backup & Logout (giữ nguyên)
exports.backupData = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Backup thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi backup",
    });
  }
};

exports.logoutAllSessions = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Đã đăng xuất tất cả phiên",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng xuất",
    });
  }
};
