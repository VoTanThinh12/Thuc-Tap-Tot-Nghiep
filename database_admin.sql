-- ================================================================
-- SCRIPT SETUP HỆ THỐNG ADMIN CHO MINI SOCCER DB
-- Sử dụng bảng users hiện có, chỉ cần thêm tài khoản admin
-- ================================================================

USE mini_soccer_db;

-- --------------------------------------------------------
-- Thêm tài khoản admin mặc định vào bảng users
-- Email: admin@soccerhub.com
-- Password: admin123
-- --------------------------------------------------------

INSERT INTO `users` (`full_name`, `email`, `password`, `phone`, `address`, `role`, `is_active`, `created_at`) 
VALUES 
(
  'Quản Trị Viên',
  'admin@soccerhub.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '0901234567',
  'TP. Hồ Chí Minh',
  'admin',
  1,
  NOW()
)
ON DUPLICATE KEY UPDATE 
  full_name = 'Quản Trị Viên',
  password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  role = 'admin',
  is_active = 1;

-- --------------------------------------------------------
-- Tạo VIEW để hỗ trợ Admin Dashboard
-- --------------------------------------------------------

CREATE OR REPLACE VIEW `v_admin_dashboard_stats` AS
SELECT 
  (SELECT COUNT(*) FROM pitches) AS total_pitches,
  (SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = CURDATE()) AS today_bookings,
  (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
  (SELECT COALESCE(SUM(total_price), 0) FROM bookings 
   WHERE MONTH(booking_date) = MONTH(CURDATE()) 
   AND YEAR(booking_date) = YEAR(CURDATE())
   AND status IN ('confirmed', 'completed')) AS month_revenue;

-- --------------------------------------------------------
-- Tạo VIEW để thống kê doanh thu theo sân
-- --------------------------------------------------------

CREATE OR REPLACE VIEW `v_revenue_by_pitch` AS
SELECT 
  p.id AS pitch_id,
  p.name AS pitch_name,
  p.type AS pitch_type,
  COUNT(b.id) AS total_bookings,
  COALESCE(SUM(b.total_price), 0) AS total_revenue,
  ROUND((COUNT(b.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM bookings), 0)), 2) AS usage_percentage
FROM pitches p
LEFT JOIN bookings b ON p.id = b.pitch_id AND b.status IN ('confirmed', 'completed')
GROUP BY p.id, p.name, p.type
ORDER BY total_revenue DESC;

-- --------------------------------------------------------
-- Tạo VIEW để thống kê khách hàng
-- --------------------------------------------------------

CREATE OR REPLACE VIEW `v_customer_stats` AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.phone,
  u.created_at,
  COUNT(DISTINCT b.id) AS total_bookings,
  COALESCE(SUM(b.total_price), 0) AS total_spent,
  MAX(b.booking_date) AS last_booking_date
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
WHERE u.role = 'customer'
GROUP BY u.id, u.full_name, u.email, u.phone, u.created_at;

-- --------------------------------------------------------
-- Thêm index để tăng tốc query cho admin
-- --------------------------------------------------------

-- Index cho bảng bookings (nếu chưa có)
ALTER TABLE `bookings` 
ADD INDEX IF NOT EXISTS `idx_status_date` (`status`, `booking_date`);

-- Index cho bảng pitches (nếu chưa có)
ALTER TABLE `pitches`
ADD INDEX IF NOT EXISTS `idx_name` (`name`);

-- Index cho bảng users (nếu chưa có)
ALTER TABLE `users`
ADD INDEX IF NOT EXISTS `idx_role_active` (`role`, `is_active`);

-- --------------------------------------------------------
-- HOÀN TẤT CÀI ĐẶT
-- --------------------------------------------------------

SELECT 'Cài đặt hệ thống Admin hoàn tất!' AS status;
SELECT 'Tổng số admin:' AS info, COUNT(*) AS count FROM users WHERE role = 'admin';
SELECT 
  'Thông tin đăng nhập Admin' AS title,
  'Email: admin@soccerhub.com' AS credential,
  'Password: admin123' AS password;

COMMIT;