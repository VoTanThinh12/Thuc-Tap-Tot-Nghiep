-- Tạo bảng admins
CREATE TABLE IF NOT EXISTS admins (
  admin_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_email (email)
);

-- Thêm admin mặc định (username: admin, password: admin123)
-- Mật khẩu đã được mã hóa bằng bcrypt
INSERT INTO admins (username, password, email, full_name, phone, role, status) 
VALUES 
('admin', '$2a$10$xQZvK5YgKjX5h8JpL9vqKOqL5ZzW5nYJ5F.L5KqV5D5yZzW5nYJ5F', 'admin@soccerhub.com', 'Quản Trị Viên', '0901234567', 'super_admin', 'active'),
('manager', '$2a$10$xQZvK5YgKjX5h8JpL9vqKOqL5ZzW5nYJ5F.L5KqV5D5yZzW5nYJ5F', 'manager@soccerhub.com', 'Quản Lý', '0912345678', 'manager', 'active');

-- Thêm cột category vào bảng services nếu chưa có
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Đồ dùng củ bóng đá' AFTER description;

-- Cập nhật category cho các dịch vụ hiện có
UPDATE services 
SET category = CASE 
  WHEN name LIKE '%áo%' OR name LIKE '%bóng%' THEN 'Đồ dùng củ bóng đá'
  WHEN name LIKE '%nước%' THEN 'Nước uống & Đồ ăn'
  ELSE 'Dịch vụ khác'
END
WHERE category IS NULL OR category = '';

-- Tạo view cho báo cáo nhanh
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM fields) as total_fields,
  (SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = CURDATE()) as today_bookings,
  (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
  (SELECT COALESCE(SUM(total_price), 0) FROM bookings 
   WHERE MONTH(booking_date) = MONTH(CURDATE()) 
   AND YEAR(booking_date) = YEAR(CURDATE())
   AND status IN ('confirmed', 'completed')) as month_revenue;

-- Grant quyền cho view
GRANT SELECT ON admin_dashboard_stats TO 'root'@'localhost';

COMMIT;