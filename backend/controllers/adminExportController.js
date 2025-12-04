const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const db = require("../config/database");

// Export PDF
exports.exportPDF = async (req, res) => {
  try {
    // Lấy dữ liệu
    const response = await getFullReportData();

    // Tạo PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bao-cao-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    doc.pipe(res);

    // Tiêu đề
    doc.fontSize(20).text("BÁO CÁO QUẢN LÝ SÂN BÓNG", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Ngày xuất: ${new Date().toLocaleString("vi-VN")}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Tổng quan
    doc.fontSize(16).text("TỔNG QUAN");
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Tổng số sân: ${response.overview.total_fields}`);
    doc.text(`Tổng khách hàng: ${response.overview.total_customers}`);
    doc.text(`Tổng đơn đặt: ${response.overview.total_bookings}`);
    doc.text(
      `Tổng doanh thu: ${Number(response.overview.total_revenue).toLocaleString(
        "vi-VN"
      )} VND`
    );

    doc.moveDown(2);

    // Doanh thu theo sân
    doc.fontSize(16).text("DOANH THU THEO SÂN");
    doc.moveDown();
    doc.fontSize(10);
    response.fieldRevenue.forEach((field, index) => {
      doc.text(
        `${index + 1}. ${field.pitch_name} - ${Number(
          field.total_revenue
        ).toLocaleString("vi-VN")} VND (${field.total_bookings} đơn)`
      );
    });

    doc.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Lỗi khi xuất PDF" });
  }
};

// Export Excel
exports.exportExcel = async (req, res) => {
  try {
    // Lấy dữ liệu
    const response = await getFullReportData();

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Doanh thu theo sân
    const sheet1 = workbook.addWorksheet("Doanh thu theo sân");
    sheet1.columns = [
      { header: "Sân bóng", key: "pitch_name", width: 30 },
      { header: "Loại", key: "type", width: 15 },
      { header: "Địa điểm", key: "location", width: 20 },
      { header: "Số đơn", key: "total_bookings", width: 10 },
      { header: "Doanh thu", key: "total_revenue", width: 20 },
    ];
    sheet1.addRows(response.fieldRevenue);

    // Sheet 2: Top khách hàng
    const sheet2 = workbook.addWorksheet("Top khách hàng");
    sheet2.columns = [
      { header: "Tên", key: "full_name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "SĐT", key: "phone", width: 15 },
      { header: "Số đơn", key: "total_bookings", width: 10 },
      { header: "Tổng chi", key: "total_spent", width: 20 },
    ];
    sheet2.addRows(response.topCustomers);

    // Sheet 3: Thống kê tháng
    const sheet3 = workbook.addWorksheet("Thống kê tháng");
    sheet3.columns = [
      { header: "Tháng", key: "month", width: 15 },
      { header: "Số đơn", key: "total_bookings", width: 10 },
      { header: "Doanh thu", key: "revenue", width: 20 },
    ];
    sheet3.addRows(response.monthlyStats);

    // Set headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bao-cao-${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Lỗi khi xuất Excel" });
  }
};

// Helper function
async function getFullReportData() {
  const [[overview]] = await db.query(`
    SELECT 
      COUNT(DISTINCT p.id) as total_fields,
      COUNT(DISTINCT u.id) as total_customers,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_revenue
    FROM bookings b
    LEFT JOIN pitches p ON b.pitch_id = p.id
    LEFT JOIN users u ON b.user_id = u.id
  `);

  const [fieldRevenue] = await db.query(`
    SELECT 
      p.name as pitch_name,
      p.type,
      p.location,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_revenue
    FROM pitches p
    LEFT JOIN bookings b ON p.id = b.pitch_id
    GROUP BY p.id
    ORDER BY total_revenue DESC
  `);

  const [topCustomers] = await db.query(`
    SELECT 
      u.full_name,
      u.email,
      u.phone,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_spent
    FROM users u
    INNER JOIN bookings b ON u.id = b.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY total_spent DESC
    LIMIT 10
  `);

  const [monthlyStats] = await db.query(`
    SELECT 
      DATE_FORMAT(b.booking_date, '%m/%Y') as month,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as revenue
    FROM bookings b
    WHERE b.booking_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m')
    ORDER BY DATE_FORMAT(b.booking_date, '%Y-%m') DESC
    LIMIT 12
  `);

  return {
    overview,
    fieldRevenue,
    topCustomers,
    monthlyStats: monthlyStats.reverse(),
  };
}
