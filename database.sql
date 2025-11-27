-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th11 27, 2025 lúc 09:30 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `mini_football_db`
--
CREATE DATABASE IF NOT EXISTS `mini_football_db`;
USE `mini_football_db`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `avatar` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `avatar`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', '123 Đường Lê Lợi, Quận 1, TP HCM', 'admin', NULL, 1, NOW(), NOW()),
(2, 'Nguyễn Văn A', 'nguyenvana@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0912345678', '123 Đường Lê Lợi, Quận 1, TP HCM', 'customer', NULL, 1, NOW(), NOW());

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pitches`
--

CREATE TABLE `pitches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('5v5','7v7','11v11') NOT NULL,
  `location` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `description` text DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `price_per_hour` decimal(10,2) NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `facilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`facilities`)),
  `status` enum('active','maintenance','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_location` (`location`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `pitches`
--

INSERT INTO `pitches` (`id`, `name`, `type`, `location`, `address`, `description`, `capacity`, `price_per_hour`, `images`, `facilities`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Sân bóng Thể Vinh', '5v5', 'Quận 1, TP HCM', '123 Đường Lê Lợi, Quận 1, TP HCM', 'Sân bóng mini chất lượng cao, được bảo dưỡng thường xuyên', 10, 150000.00, '["https://via.placeholder.com/600x400"]', '["Bãi đỗ xe", "Nhà vệ sinh", "Quán nước", "Khu thay đồ"]', 'active', NOW(), NOW()),
(2, 'Sân bóng Kỹ Nguyễn', '7v7', 'Quận 3, TP HCM', '456 Đường Nguyễn Huệ, Quận 3, TP HCM', 'Sân cỏ nhân tạo chất lượng, ánh sáng đầy đủ', 14, 200000.00, '["https://via.placeholder.com/600x400"]', '["Bãi đỗ xe", "Nhà vệ sinh", "Máy lạnh", "Wifi miễn phí"]', 'active', NOW(), NOW()),
(3, 'Sân bóng Bầu Trời', '5v5', 'Quận 7, TP HCM', '789 Đường Nguyễn Văn Linh, Quận 7, TP HCM', 'Sân trong nhà có mái che, tránh nắng mưa', 10, 120000.00, '["https://via.placeholder.com/600x400"]', '["Bãi đỗ xe", "Khu thay đồ", "Bóng đá"]', 'active', NOW(), NOW());

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `timeslots`
--

CREATE TABLE `timeslots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pitch_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_timeslot` (`pitch_id`,`date`,`start_time`),
  KEY `idx_date` (`date`),
  KEY `idx_available` (`is_available`),
  FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `timeslots`
--

INSERT INTO `timeslots` (`id`, `pitch_id`, `date`, `start_time`, `end_time`, `price`, `is_available`) VALUES
(1, 1, '2025-11-28', '06:00:00', '07:00:00', 150000.00, 1),
(2, 1, '2025-11-28', '07:00:00', '08:00:00', 150000.00, 1),
(3, 1, '2025-11-28', '17:00:00', '18:00:00', 180000.00, 1),
(4, 1, '2025-11-28', '18:00:00', '19:00:00', 180000.00, 1),
(5, 2, '2025-11-28', '06:00:00', '07:30:00', 200000.00, 1),
(6, 2, '2025-11-28', '18:00:00', '19:30:00', 230000.00, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pitch_id` int(11) NOT NULL,
  `timeslot_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) DEFAULT 0.00,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(15) NOT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_pitch_id` (`pitch_id`),
  KEY `idx_timeslot_id` (`timeslot_id`),
  KEY `idx_status` (`status`),
  KEY `idx_booking_date` (`booking_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`timeslot_id`) REFERENCES `timeslots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `category` enum('equipment','beverage','other') DEFAULT 'other',
  `status` enum('active','inactive') DEFAULT 'active',
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `services`
--

INSERT INTO `services` (`id`, `name`, `description`, `price`, `unit`, `category`, `status`) VALUES
(1, 'Áo bib', 'Bộ áo phân đội màu khác nhau', 5000.00, 'cái', 'equipment', 'active'),
(2, 'Bóng thi đấu', 'Bóng FIFA chính hãng', 10000.00, 'trái', 'equipment', 'active'),
(3, 'Nước suối', 'Nước suối lạnh 500ml', 10000.00, 'chai', 'beverage', 'active'),
(4, 'Nước thể thao', 'Nước thể thao Pocari/Aquarius 500ml', 20000.00, 'chai', 'beverage', 'active'),
(5, 'Thuê trọng tài', 'Trọng tài có kinh nghiệm tại sân', 200000.00, 'trận', 'other', 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_services`
--

CREATE TABLE `booking_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_service_id` (`service_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `payment_method` enum('cash','transfer','momo','vnpay') DEFAULT 'cash',
  `amount` decimal(10,2) NOT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pitch_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_pitch_id` (`pitch_id`),
  KEY `idx_rating` (`rating`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;