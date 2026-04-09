-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS chronos_db;
USE chronos_db;

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (name, email, password) VALUES 
('Super Admin', 'admin@chronos.com', 'admin123')
ON DUPLICATE KEY UPDATE email=email;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, brand, category, price, stock_quantity) VALUES
('Royal Oak Chronograph', 'Audemars Piguet', 'Sport', 45000.00, 12),
('Seamaster Diver 300M', 'Omega', 'Luxury', 5200.00, 45),
('Submariner Date', 'Rolex', 'Analog', 10250.00, 0),
('Nautilus', 'Patek Philippe', 'Sport', 35000.00, 3),
('Aquaracer', 'Tag Heuer', 'Luxury', 4400.00, 28),
('Tank Must', 'Cartier', 'Luxury', 2950.00, 15),
('Speedmaster', 'Omega', 'Luxury', 6400.00, 8),
('Daytona Cosmograph', 'Rolex', 'Luxury', 14550.00, 2)
ON DUPLICATE KEY UPDATE name=name;

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    initials VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    orders_count INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    join_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (initials, name, email, orders_count, total_spent, join_date, status) VALUES
('JW', 'James Wilson', 'james.w@example.com', 4, 125000.00, '2022-01-15', 'Active'),
('SC', 'Sarah Chen', 'sarah.c@example.com', 2, 15600.00, '2023-03-22', 'Active'),
('MB', 'Michael Brown', 'm.brown@example.com', 1, 10250.00, '2023-10-10', 'New'),
('ED', 'Emma Davis', 'emma.d@example.com', 6, 42950.00, '2021-11-05', 'Active'),
('WT', 'William Taylor', 'will.t@example.com', 1, 14550.00, '2023-09-18', 'Inactive')
ON DUPLICATE KEY UPDATE name=name;

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, /* e.g. #ORD-001 */
    customer_id INT,
    product_name VARCHAR(255),
    order_date DATE,
    items_count INT,
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO orders (id, customer_id, product_name, order_date, items_count, total_amount, status) VALUES
('#ORD-001', 1, 'Royal Oak Chronograph', '2023-10-24', 1, 45000.00, 'Delivered'),
('#ORD-002', 2, 'Seamaster Diver 300M', '2023-10-23', 2, 10400.00, 'Shipped'),
('#ORD-003', 3, 'Submariner Date', '2023-10-23', 1, 10250.00, 'Pending'),
('#ORD-004', 4, 'Tank Must', '2023-10-22', 1, 2950.00, 'Delivered'),
('#ORD-005', 5, 'Daytona Cosmograph', '2023-10-21', 1, 14550.00, 'Cancelled')
ON DUPLICATE KEY UPDATE id=id;
