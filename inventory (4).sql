-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 20, 2026 at 12:12 PM
-- Server version: 8.4.8
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `min_stock` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `stock`, `min_stock`, `created_at`) VALUES
(1, 'Mouse', 45, 10, '2026-03-16 03:24:03'),
(2, 'Mousepad', 42, 10, '2026-03-16 03:24:03'),
(3, 'Keyboard', 5, 5, '2026-03-16 03:24:03'),
(4, 'Headset', 15, 5, '2026-03-16 03:24:03'),
(5, 'Camera', 20, 15, '2026-03-16 03:24:03'),
(6, 'UPS', 35, 10, '2026-03-16 03:24:03'),
(7, 'CPU', 20, 10, '2026-03-16 03:24:03'),
(8, 'Monitor', 20, 20, '2026-03-16 03:24:03'),
(9, 'Fan', 20, 6, '2026-03-16 03:28:22'),
(10, 'Xiaomi', 20, 5, '2026-03-16 03:38:36'),
(11, 'Ipad', 10, 5, '2026-03-16 03:58:33'),
(12, 'RAM', 65, 20, '2026-03-18 07:55:26'),
(13, 'Chair', 15, 5, '2026-03-18 07:56:41'),
(14, 'Razer viper v3 pro', 50, 5, '2026-03-20 12:11:40');

-- --------------------------------------------------------

--
-- Table structure for table `stock_history`
--

CREATE TABLE `stock_history` (
  `id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `type` varchar(10) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_history`
--

INSERT INTO `stock_history` (`id`, `product_id`, `type`, `quantity`, `created_at`) VALUES
(1, 1, 'IN', 15, '2026-03-15 17:06:51'),
(2, 2, 'IN', 12, '2026-03-15 17:07:00'),
(3, 3, 'OUT', 5, '2026-03-15 17:07:08'),
(4, 1, 'IN', 0, '2026-03-15 18:39:19'),
(5, 5, 'IN', 5, '2026-03-15 19:14:26'),
(6, 1, 'IN', 10, '2026-03-16 03:16:34'),
(7, 5, 'OUT', 5, '2026-03-16 03:30:05'),
(8, 12, 'IN', 10, '2026-03-18 07:56:03'),
(9, 5, 'IN', 5, '2026-03-18 08:00:07'),
(10, 12, 'IN', 5, '2026-03-18 08:01:04'),
(11, 5, 'OUT', 5, '2026-03-18 08:12:07'),
(12, 1, 'IN', 5, '2026-03-18 08:19:32'),
(13, 13, 'IN', 5, '2026-03-19 02:56:29'),
(14, 6, 'IN', 20, '2026-03-19 02:56:41'),
(15, 1, 'OUT', 5, '2026-03-19 02:56:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `password_hash`, `created_at`) VALUES
(1, 'admin', '1234', 'admin', 'c27c6e9e299a516fcf125e77c1f4e093:7d3427698c8c18f64c18af810c0b5d9ee6168157e9f62fdc6259b7ad7585e75ebb48e3a69b7656db67003c584ace43293d04af1ff68abab9d22e5ebc7e4c13a9', '2026-03-16 03:24:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock_history`
--
ALTER TABLE `stock_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stock_history_product` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_users_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `stock_history`
--
ALTER TABLE `stock_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `stock_history`
--
ALTER TABLE `stock_history`
  ADD CONSTRAINT `fk_stock_history_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
