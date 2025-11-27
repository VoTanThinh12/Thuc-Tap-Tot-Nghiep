-- Tạo database
CREATE DATABASE IF NOT EXISTS mini_football_db;
USE mini_football_db;

-- Bảng Users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Bảng Pitches (Sân bóng)
CREATE TABLE pitches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  type ENUM('5v5', '7v7') NOT NULL,
  location VARCHAR(255) NOT NULL,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  description TEXT,
  images JSON,
  facilities JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Timeslots (Khung giờ)
CREATE TABLE timeslots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pitch_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_timeslot (pitch_id, date, start_time)
);

-- Bảng Bookings (Đơn đặt sân)
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  pitch_id INT NOT NULL,
  timeslot_id INT NOT NULL,
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  booking_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE,
  FOREIGN KEY (timeslot_id) REFERENCES timeslots(id) ON DELETE CASCADE,
  INDEX idx_booking_code (booking_code)
);

-- Thêm dữ liệu mẫu Admin (password: admin123)
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin', 'admin@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0909123456', 'admin');

-- Thêm dữ liệu mẫu sân
INSERT INTO pitches (name, type, location, price_per_hour, description, images, facilities) VALUES
('Sân Mini ABC', '5v5', 'Quận 1, TP.HCM', 200000, 'Sân cỏ nhân tạo chất lượng cao', '["https://via.placeholder.com/300x200"]', '["Đèn chiếu sáng", "Phòng thay đồ"]'),
('Sân XYZ', '7v7', 'Quận 3, TP.HCM', 350000, 'Sân rộng rãi, thoáng mát', '["https://via.placeholder.com/300x200"]', '["Bãi đỗ xe", "Căng tin"]'),
('Sân Thể Thao 123', '5v5', 'Quận 10, TP.HCM', 180000, 'Sân chuẩn FIFA, giá rẻ', '["https://via.placeholder.com/300x200"]', '["Nước uống miễn phí", "WiFi"]');

-- Thêm dữ liệu mẫu timeslots
INSERT INTO timeslots (pitch_id, date, start_time, end_time, price, is_available) VALUES
(1, '2025-11-28', '06:00:00', '07:00:00', 200000, TRUE),
(1, '2025-11-28', '07:00:00', '08:00:00', 200000, TRUE),
(1, '2025-11-28', '17:00:00', '18:00:00', 250000, TRUE),
(2, '2025-11-28', '06:00:00', '07:30:00', 350000, TRUE),
(2, '2025-11-28', '18:00:00', '19:30:00', 400000, TRUE);