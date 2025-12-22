const db = require("../config/database");

exports.getPublicSettings = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT setting_key, setting_value FROM settings");

    const settingsData = {};
    rows.forEach((row) => {
      settingsData[row.setting_key] = row.setting_value;
    });

    const settings = {
      system: {
        businessName: settingsData.business_name || "SoccerHub",
        address: settingsData.business_address || "",
        phone: settingsData.business_phone || "",
        email: settingsData.business_email || "",
        description: settingsData.business_description || "",
        logo: settingsData.business_logo || "",
      },
    };

    res.json({
      success: true,
      settings,
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
