-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 02, 2025 lúc 07:32 AM
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
-- Cơ sở dữ liệu: `mini_soccer_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bookings`
--

INSERT INTO `bookings` (`id`, `booking_code`, `user_id`, `pitch_id`, `timeslot_id`, `booking_date`, `start_time`, `end_time`, `total_price`, `deposit_amount`, `customer_name`, `customer_phone`, `customer_email`, `notes`, `status`, `cancellation_reason`, `created_at`, `updated_at`) VALUES
(1, 'BK001', 2, 1, 1, '2025-11-23', '06:00:00', '08:00:00', 150000.00, 50000.00, 'Nguyễn Văn A', '0912345678', 'nguyenvana@example.com', NULL, 'confirmed', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(2, 'BK002', 3, 2, 14, '2025-11-23', '07:00:00', '09:00:00', 400000.00, 150000.00, 'Trần Thị B', '0923456789', 'tranthib@example.com', NULL, 'pending', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(3, 'BK003', 4, 1, 3, '2025-11-23', '10:00:00', '12:00:00', 120000.00, 0.00, 'Lê Văn C', '0934567890', 'levanc@example.com', NULL, 'confirmed', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(4, 'BK004', 5, 2, 17, '2025-11-23', '15:00:00', '17:00:00', 180000.00, 100000.00, 'Phạm Văn D', '0945678901', 'phamvand@example.com', NULL, 'completed', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(5, 'BK005', 6, 1, 7, '2025-11-23', '20:00:00', '22:00:00', 130000.00, 0.00, 'Hoàng Thị E', '0956789012', 'hoangthie@example.com', NULL, 'cancelled', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(6, 'BK1764254639545612', 7, 2, 2, '2025-11-28', '08:00:00', '10:00:00', 150000.00, 0.00, 'Thinh Vo', '0398989898', 'thinhverchai@gmail.com', NULL, 'pending', NULL, '2025-11-27 14:43:59', '2025-11-27 14:43:59'),
(7, 'BK1764656936395788', 8, 3, 4, '2025-12-17', '14:00:00', '16:00:00', 150000.00, 0.00, 'Thinh Vo', '123456789', '1@gmail.com', NULL, 'pending', NULL, '2025-12-02 06:28:56', '2025-12-02 06:28:56');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_services`
--

CREATE TABLE `booking_services` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `booking_services`
--

INSERT INTO `booking_services` (`id`, `booking_id`, `service_id`, `quantity`, `price`, `total`) VALUES
(1, 1, 1, 2, 5000.00, 10000.00),
(2, 1, 3, 10, 10000.00, 100000.00),
(3, 2, 2, 1, 10000.00, 10000.00),
(4, 2, 4, 5, 20000.00, 100000.00),
(5, 4, 5, 1, 200000.00, 200000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `payment_method` enum('cash','transfer','momo','vnpay') DEFAULT 'cash',
  `amount` decimal(10,2) NOT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `payment_method`, `amount`, `payment_date`, `transaction_id`, `status`, `notes`) VALUES
(1, 1, 'cash', 150000.00, '2025-11-23 14:05:38', NULL, 'completed', NULL),
(2, 2, 'transfer', 150000.00, '2025-11-23 14:05:38', 'TXN20250123001', 'completed', NULL),
(3, 3, 'cash', 120000.00, '2025-11-23 14:05:38', NULL, 'completed', NULL),
(4, 4, 'momo', 380000.00, '2025-11-23 14:05:38', 'MOMO20250123002', 'completed', NULL),
(5, 5, 'cash', 0.00, '2025-11-23 14:05:38', NULL, 'refunded', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pitches`
--

CREATE TABLE `pitches` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `pitches`
--

INSERT INTO `pitches` (`id`, `name`, `type`, `location`, `address`, `description`, `capacity`, `price_per_hour`, `images`, `facilities`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Sân bóng Thể Vinh', '5v5', 'Quận 1, TP HCM', '123 Đường Lê Lợi, Quận 1, TP HCM', 'Sân bóng mini chất lượng cao, được bảo dưỡng thường xuyên', 10, 150000.00, '[\"/uploads/pitch1_1.jpg\", \"/uploads/pitch1_2.jpg\"]', '[\"Bãi đỗ xe\", \"Nhà vệ sinh\", \"Quán nước\", \"Khu thay đồ\"]', 'active', '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(2, 'Sân bóng Kỹ Nguyễn', '7v7', 'Quận 3, TP HCM', '456 Đường Nguyễn Huệ, Quận 3, TP HCM', 'Sân cỏ nhân tạo chất lượng, ánh sáng đầy đủ', 14, 200000.00, '[\"/uploads/pitch2_1.jpg\", \"/uploads/pitch2_2.jpg\"]', '[\"Bãi đỗ xe\", \"Nhà vệ sinh\", \"Máy lạnh\", \"Wifi miễn phí\"]', 'active', '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(3, 'Sân bóng Bầu Trời', '5v5', 'Quận 7, TP HCM', '789 Đường Nguyễn Văn Linh, Quận 7, TP HCM', 'Sân trong nhà có mái che, tránh nắng mưa', 10, 120000.00, '[\"/uploads/pitch3_1.jpg\"]', '[\"Bãi đỗ xe\", \"Khu thay đồ\", \"Bóng đá\"]', 'active', '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(4, 'Sân bóng Sao Vàng', '7v7', 'Bình Thạnh, TP HCM', '321 Đường Xô Viết Nghệ Tĩnh, Bình Thạnh, TP HCM', 'Sân tiêu chuẩn FIFA, có hệ thống tưới tự động', 14, 180000.00, '[\"/uploads/pitch4_1.jpg\", \"/uploads/pitch4_2.jpg\", \"/uploads/pitch4_3.jpg\"]', '[\"Bãi đỗ xe miễn phí\", \"Nhà vệ sinh\", \"Quán nước\", \"Wifi\", \"Camera an ninh\"]', 'active', '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(5, 'Sân bóng Phượng Hoàng', '5v5', 'Quận 10, TP HCM', '654 Đường 3 Tháng 2, Quận 10, TP HCM', 'Không gian rộng rãi, thoáng mát', 10, 130000.00, '[\"/uploads/pitch5_1.jpg\"]', '[\"Nhà vệ sinh\", \"Máy lạnh\"]', 'maintenance', '2025-11-23 14:05:38', '2025-11-23 14:05:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pitch_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `booking_id`, `user_id`, `pitch_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 2, 1, 5, 'Sân rất đẹp, chất lượng tốt, nhân viên nhiệt tình!', '2025-11-23 14:05:38'),
(2, 3, 4, 1, 4, 'Sân ổn, giá hợp lý. Sẽ quay lại!', '2025-11-23 14:05:38'),
(3, 4, 5, 2, 5, 'Sân chất lượng cao, không gian thoải mái, đặt lại chắc chắn.', '2025-11-23 14:05:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `category` enum('equipment','beverage','other') DEFAULT 'other',
  `status` enum('active','inactive') DEFAULT 'active',
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `services`
--

INSERT INTO `services` (`id`, `name`, `description`, `price`, `unit`, `category`, `status`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Áo bib', 'Bộ áo phân đội màu khác nhau', 5000.00, 'cái', 'equipment', 'active', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(2, 'Bóng thi đấu', 'Bóng FIFA chính hãng', 10000.00, 'trái', 'equipment', 'active', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(3, 'Nước suối', 'Nước suối lạnh 500ml', 10000.00, 'chai', 'beverage', 'active', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(4, 'Nước thể thao', 'Nước thể thao Pocari/Aquarius 500ml', 20000.00, 'chai', 'beverage', 'active', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(5, 'Thuê trọng tài', 'Trọng tài có kinh nghiệm tại sân', 200000.00, 'trận', 'other', 'active', NULL, '2025-11-23 14:05:38', '2025-11-23 14:05:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `timeslots`
--

CREATE TABLE `timeslots` (
  `id` int(11) NOT NULL,
  `pitch_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `timeslots`
--

INSERT INTO `timeslots` (`id`, `pitch_id`, `date`, `start_time`, `end_time`, `price`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-11-23', '06:00:00', '08:00:00', 150000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(2, 1, '2025-11-23', '08:00:00', '10:00:00', 150000.00, 0, '2025-11-23 14:05:38', '2025-11-27 14:43:59'),
(3, 1, '2025-11-23', '10:00:00', '12:00:00', 150000.00, 0, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(4, 1, '2025-11-23', '14:00:00', '16:00:00', 150000.00, 0, '2025-11-23 14:05:38', '2025-12-02 06:28:56'),
(5, 1, '2025-11-23', '16:00:00', '18:00:00', 150000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(6, 1, '2025-11-23', '18:00:00', '20:00:00', 180000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(7, 1, '2025-11-23', '20:00:00', '22:00:00', 180000.00, 0, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(8, 1, '2025-11-24', '06:00:00', '08:00:00', 150000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(9, 1, '2025-11-24', '08:00:00', '10:00:00', 150000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(10, 1, '2025-11-24', '18:00:00', '20:00:00', 180000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(11, 1, '2025-11-24', '20:00:00', '22:00:00', 180000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(12, 2, '2025-11-23', '07:00:00', '09:00:00', 200000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(13, 2, '2025-11-23', '09:00:00', '11:00:00', 200000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(14, 2, '2025-11-23', '11:00:00', '13:00:00', 200000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(15, 2, '2025-11-23', '15:00:00', '17:00:00', 200000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(16, 2, '2025-11-23', '17:00:00', '19:00:00', 230000.00, 0, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(17, 2, '2025-11-23', '19:00:00', '21:00:00', 230000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(18, 2, '2025-11-24', '07:00:00', '09:00:00', 200000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(19, 2, '2025-11-24', '17:00:00', '19:00:00', 230000.00, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `avatar` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `avatar`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@soccerhub.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '0901234567', '123 Đường Lê Lợi, Quận 1, TP HCM', 'admin', NULL, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(2, 'Nguyễn Văn A', 'nguyenvana@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '0912345678', '123 Đường Lê Lợi, Quận 1, TP HCM', 'customer', NULL, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(3, 'Trần Thị B', 'tranthib@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '0923456789', '456 Đường Nguyễn Huệ, Quận 3, TP HCM', 'customer', NULL, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(4, 'Lê Văn C', 'levanc@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '0934567890', '789 Đường Pasteur, Quận 3, TP HCM', 'customer', NULL, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(5, 'Phạm Văn D', 'phamvand@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '0945678901', '321 Đường Cách Mạng Tháng 8, Quận 10, TP HCM', 'customer', NULL, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(6, 'Hoàng Thị E', 'hoangthie@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '0956789012', '654 Đường 3 Tháng 2, Quận 10, TP HCM', 'customer', NULL, 1, '2025-11-23 14:05:38', '2025-11-23 14:05:38'),
(7, 'Thinh Vo', 'thinhverchai@gmail.com', '$2a$10$VCe9bQfuC2teq4wMR6wnEedEN9qYW3R6.RF4TXiDsN1SiUiM0pIze', '0398989898', 'tphcm', 'admin', NULL, 1, '2025-11-27 14:39:09', '2025-11-27 14:44:28'),
(8, 'Thinh Vo', '1@gmail.com', '$2a$10$kDNaiRbNaJn6TOCYcpJNieIphdbJbvm2QJwXkkzy7tP/6UvGrxqp.', '123456789', 'tphcm', 'customer', NULL, 1, '2025-12-02 06:28:20', '2025-12-02 06:28:20');

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_booking_details`
-- (See below for the actual view)
--
CREATE TABLE `v_booking_details` (
`id` int(11)
,`booking_code` varchar(20)
,`booking_date` date
,`start_time` time
,`end_time` time
,`total_price` decimal(10,2)
,`deposit_amount` decimal(10,2)
,`status` enum('pending','confirmed','completed','cancelled')
,`customer_name` varchar(100)
,`customer_phone` varchar(15)
,`user_name` varchar(100)
,`user_email` varchar(100)
,`pitch_name` varchar(100)
,`pitch_type` enum('5v5','7v7','11v11')
,`pitch_location` varchar(255)
,`payment_method` enum('cash','transfer','momo','vnpay')
,`payment_status` enum('pending','completed','failed','refunded')
);

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_booking_details`
--
DROP TABLE IF EXISTS `v_booking_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_booking_details`  AS SELECT `b`.`id` AS `id`, `b`.`booking_code` AS `booking_code`, `b`.`booking_date` AS `booking_date`, `b`.`start_time` AS `start_time`, `b`.`end_time` AS `end_time`, `b`.`total_price` AS `total_price`, `b`.`deposit_amount` AS `deposit_amount`, `b`.`status` AS `status`, `b`.`customer_name` AS `customer_name`, `b`.`customer_phone` AS `customer_phone`, `u`.`full_name` AS `user_name`, `u`.`email` AS `user_email`, `p`.`name` AS `pitch_name`, `p`.`type` AS `pitch_type`, `p`.`location` AS `pitch_location`, `py`.`payment_method` AS `payment_method`, `py`.`status` AS `payment_status` FROM (((`bookings` `b` join `users` `u` on(`b`.`user_id` = `u`.`id`)) join `pitches` `p` on(`b`.`pitch_id` = `p`.`id`)) left join `payments` `py` on(`b`.`id` = `py`.`booking_id`)) ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `pitch_id` (`pitch_id`),
  ADD KEY `timeslot_id` (`timeslot_id`),
  ADD KEY `idx_booking_code` (`booking_code`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_booking_date` (`booking_date`);

--
-- Chỉ mục cho bảng `booking_services`
--
ALTER TABLE `booking_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `idx_booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `pitches`
--
ALTER TABLE `pitches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_location` (`location`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_pitch_id` (`pitch_id`),
  ADD KEY `idx_rating` (`rating`);

--
-- Chỉ mục cho bảng `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `timeslots`
--
ALTER TABLE `timeslots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_timeslot` (`pitch_id`,`date`,`start_time`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_available` (`is_available`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `booking_services`
--
ALTER TABLE `booking_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `pitches`
--
ALTER TABLE `pitches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `timeslots`
--
ALTER TABLE `timeslots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`timeslot_id`) REFERENCES `timeslots` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `booking_services`
--
ALTER TABLE `booking_services`
  ADD CONSTRAINT `booking_services_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `timeslots`
--
ALTER TABLE `timeslots`
  ADD CONSTRAINT `timeslots_ibfk_1` FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
