import bcrypt from "bcryptjs";

/**
 * Initialize all database tables and run migrations.
 * Called once on server startup after DB connection is established.
 */
export function initializeSchema(db) {
  // ── Orders Table ──────────────────────────────────────────
  const createOrdersTableSql = `
    CREATE TABLE IF NOT EXISTS orders (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      items      JSON NOT NULL,
      subtotal   DECIMAL(12,2) NOT NULL,
      discount   DECIMAL(12,2) NOT NULL,
      total      DECIMAL(12,2) NOT NULL,
      shipping_method VARCHAR(100),
      first_name VARCHAR(100),
      last_name  VARCHAR(100),
      address    TEXT,
      mobile     VARCHAR(20),
      city       VARCHAR(100),
      province   VARCHAR(100),
      zip_code   VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createOrdersTableSql, (err) => {
    if (err) {
      console.log("Error creating orders table:", err);
    } else {
      const checkColsSql = "SHOW COLUMNS FROM orders";
      db.query(checkColsSql, (err, result) => {
        if (!err) {
          const cols = result.map((r) => r.Field);
          if (!cols.includes("shipping_method")) {
            db.query("ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(100) AFTER total");
          }
          if (!cols.includes("payment_method")) {
            db.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100) AFTER shipping_method");
          }
          if (!cols.includes("payment_status")) {
            db.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending' AFTER payment_method");
          }
          if (!cols.includes("email")) {
            db.query("ALTER TABLE orders ADD COLUMN email VARCHAR(255) AFTER id");
          }
          if (!cols.includes("order_status")) {
            db.query("ALTER TABLE orders ADD COLUMN order_status VARCHAR(50) DEFAULT 'Pending' AFTER payment_status");
          }
          if (!cols.includes("customer_id")) {
            db.query("ALTER TABLE orders ADD COLUMN customer_id VARCHAR(50) AFTER id");
          }
          if (!cols.includes("is_active")) {
            db.query("ALTER TABLE orders ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
          }
        }
      });
    }
  });

  // ── Users Table ───────────────────────────────────────────
  const createUsersTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_id VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createUsersTableSql, (err) => {
    if (!err) {
      db.query("SHOW COLUMNS FROM users", (err, result) => {
        if (!err) {
          const cols = result.map((r) => r.Field);
          if (!cols.includes("account_id")) {
            db.query("ALTER TABLE users ADD COLUMN account_id VARCHAR(50) UNIQUE AFTER id");
          }
          if (!cols.includes("phone")) {
            db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(50)");
          }
          if (!cols.includes("address")) {
            db.query("ALTER TABLE users ADD COLUMN address TEXT");
          }
          if (!cols.includes("city")) {
            db.query("ALTER TABLE users ADD COLUMN city VARCHAR(100)");
          }
          if (!cols.includes("zip_code")) {
            db.query("ALTER TABLE users ADD COLUMN zip_code VARCHAR(20)");
          }
          if (!cols.includes("is_active")) {
            db.query("ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
          }
        }
      });
    }
  });

  // ── Subscribers Table ─────────────────────────────────────
  const createSubscribersTableSql = `
    CREATE TABLE IF NOT EXISTS subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createSubscribersTableSql);

  // ── Products Table ────────────────────────────────────────
  const createProductsSql = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      product_code VARCHAR(50) UNIQUE,
      brand VARCHAR(100),
      category VARCHAR(100),
      price VARCHAR(50),
      stock_quantity INT DEFAULT 0,
      description TEXT,
      color VARCHAR(50),
      strap_size VARCHAR(50),
      image_url VARCHAR(255),
      images JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createProductsSql, (err) => {
    if (!err) {
      db.query("SHOW COLUMNS FROM products", (err, result) => {
        if (!err) {
          const cols = result.map((r) => r.Field);
          if (!cols.includes("images")) {
            db.query("ALTER TABLE products ADD COLUMN images JSON AFTER image_url");
          }
          if (!cols.includes("product_code")) {
            db.query("ALTER TABLE products ADD COLUMN product_code VARCHAR(50) UNIQUE AFTER name");
          }
          if (!cols.includes("inventory_tiers")) {
            db.query("ALTER TABLE products ADD COLUMN inventory_tiers JSON AFTER images");
          }
          if (!cols.includes("is_active")) {
            db.query("ALTER TABLE products ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
          }
        }
      });
    }
  });

  // ── Notifications Table ───────────────────────────────────
  const createNotificationsSql = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createNotificationsSql);

  // ── Customers Table ───────────────────────────────────────
  const createCustomersSql = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      orders_count INT DEFAULT 0,
      total_spent DECIMAL(12,2) DEFAULT 0,
      join_date DATE,
      status VARCHAR(50) DEFAULT 'New',
      initials VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createCustomersSql, (err) => {
    if (!err) {
      db.query("SHOW COLUMNS FROM customers", (err, result) => {
        if (!err) {
          const cols = result.map((r) => r.Field);
          if (!cols.includes("customer_id")) {
            db.query("ALTER TABLE customers ADD COLUMN customer_id VARCHAR(50) UNIQUE AFTER id");
          }
          if (!cols.includes("is_active")) {
            db.query("ALTER TABLE customers ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
          }
        }
      });
    }
  });

  // ── Settings Table ────────────────────────────────────────
  const createSettingsSql = `
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY DEFAULT 1,
      store_name VARCHAR(255) DEFAULT 'Chronos Watches',
      contact_email VARCHAR(255) DEFAULT 'contact@chronos.com',
      phone_number VARCHAR(50) DEFAULT '+1 234 567 8900',
      dark_mode BOOLEAN DEFAULT true,
      accent_color VARCHAR(50) DEFAULT '#d4af37',
      email_alerts_orders BOOLEAN DEFAULT true,
      low_stock_alerts BOOLEAN DEFAULT true
    )
  `;
  db.query(createSettingsSql, (err) => {
    if (!err) db.query("INSERT IGNORE INTO settings (id) VALUES (1)");
  });

  // ── Admin Profile Table ───────────────────────────────────
  const createAdminProfileSql = `
    CREATE TABLE IF NOT EXISTS admin_profile (
      id INT PRIMARY KEY DEFAULT 1,
      name VARCHAR(255) DEFAULT 'Kasun Silva',
      email VARCHAR(255) DEFAULT 'admin@chronos.com',
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'CEO',
      avatar_url VARCHAR(255)
    )
  `;
  db.query(createAdminProfileSql, (err) => {
    if (!err) {
      db.query("SELECT COUNT(*) as count FROM admin_profile", (err, result) => {
        if (!err && result[0].count === 0) {
          const hashedPassword = bcrypt.hashSync("admin123", 10);
          const sql = "INSERT INTO admin_profile (name, email, role, password) VALUES ('Admin', 'admin@chronos.com', 'Super Admin', ?)";
          db.query(sql, [hashedPassword]);
        }
      });
    }
  });

  // ── Reviews Table ─────────────────────────────────────────
  const createReviewsSql = `
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      order_id INT NOT NULL,
      customer_id INT,
      customer_name VARCHAR(255),
      rating INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createReviewsSql, (err) => {
    if (!err) {
      db.query("SHOW COLUMNS FROM reviews", (err, result) => {
        if (!err) {
          const cols = result.map((r) => r.Field);
          if (!cols.includes("customer_name")) {
            db.query("ALTER TABLE reviews ADD COLUMN customer_name VARCHAR(255) AFTER customer_id");
          }
          db.query("UPDATE reviews SET customer_name = 'Valued Client' WHERE customer_name IS NULL OR customer_name = ''");
        }
      });
    }
  });

  console.log("Database schema initialized.");
}
