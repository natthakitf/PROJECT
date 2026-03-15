CREATE DATABASE IF NOT EXISTS inventory;

USE inventory;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50),
password VARCHAR(50),
role VARCHAR(20)
);

INSERT INTO users(username,password,role)
VALUES("admin","1234","admin");

CREATE TABLE products(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
stock INT,
min_stock INT
);

CREATE TABLE stock_history(
id INT AUTO_INCREMENT PRIMARY KEY,
product_id INT,
type VARCHAR(10),
quantity INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);