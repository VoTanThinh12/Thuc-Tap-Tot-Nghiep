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

    // MySQL dump command (adjust based on your config)
    const command = `mysqldump -u root -p mini_soccer_db > ${filepath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Backup error:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi backup dữ liệu",
        });
      }

      res.json({
        success: true,
        message: "Backup thành công",
        filename: filename,
        downloadUrl: `/backups/${filename}`,
      });
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

    // Delete all sessions for this admin (implement based on your session management)
    await db.query("DELETE FROM admin_sessions WHERE admin_id = ?", [adminId]);

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
