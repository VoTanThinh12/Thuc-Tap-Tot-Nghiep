const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads")); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất: timestamp-tên-gốc
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Lọc chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  const allowedExts = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
  ];
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const extOk = allowedExts.includes(ext);
  const mimeOk = allowedMimes.includes(String(file.mimetype).toLowerCase());

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp, bmp, svg)"
      )
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

module.exports = upload;
