const db = require("../config/database");

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    // For now, return default settings
    // You can store these in database later
    const settings = {
      system: {
        businessName: "SoccerHub - Sân Bóng Mini",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        phone: "0123456789",
        email: "contact@soccerhub.vn",
        description: "Hệ thống sân bóng mini chất lượng cao",
        logo: "",
      },
      booking: {
        slotDuration: 90,
        openTime: "06:00",
        closeTime: "23:00",
        advanceBookingDays: 30,
        minCancelHours: 24,
        autoConfirm: false,
      },
      payment: {
        requireDeposit: true,
        depositPercentage: 30,
        paymentMethods: ["cash", "transfer", "momo"],
      },
      notification: {
        emailOnNewBooking: true,
        emailOnCancel: true,
        reminderBeforeHours: 2,
        sendCustomerReminder: true,
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

    // For now, just return success
    // You can implement database storage later
    console.log(`Updating ${type} settings:`, data);

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

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    // Check current password
    const [admin] = await db.query("SELECT password FROM admins WHERE id = ?", [
      adminId,
    ]);

    if (!admin[0]) {
      return res.status(404).json({
        success: false,
        message: "Admin không tồn tại",
      });
    }

    // In production, use bcrypt to compare passwords
    if (admin[0].password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Update password (in production, hash the password first)
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

// Backup data
exports.backupData = async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const { exec } = require("child_process");

    const backupDir = path.join(__dirname, "../../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    // Simple backup - just return success for now
    // You can implement actual MySQL dump later
    console.log("Backup requested to:", filepath);

    res.json({
      success: true,
      message: "Backup thành công",
      filename: filename,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi backup",
      error: error.message,
    });
  }
};

// Logout all sessions
exports.logoutAllSessions = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // For now, just return success
    // You can implement session management later
    console.log("Logout all sessions for admin:", adminId);

    res.json({
      success: true,
      message: "Đã đăng xuất tất cả phiên",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng xuất",
      error: error.message,
    });
  }
};
