import express from "express";
import mysql from "mysql2";
import cors from "cors";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MERCHANT_ID = "1234976";
const MERCHANT_SECRET = "MTk1MTkwMDYyMzIyMjgxMzc4OTgyNDAxNjY0NzM5NTE0MDMyNjM4";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, '../Admin Panel/backend/public/uploads')));

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chronos_db",
});

// Handle connection errors to prevent server crash (ECONNRESET)
db.on('error', (err) => {
  console.error("Database connection error:", err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log("Attempting to reconnect or handling reset...");
  } else {
    // For other errors, we still log but don't let it crash the process
    console.log("Encountered DB error but continuing server operation.");
  }
});

// Connect DB
db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
  } else {
    console.log("MySQL Connected");

    // Initialize Database Schema
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
        // Ensure shipping_method and payment_method columns exist (migration for existing tables)
        const checkColsSql = "SHOW COLUMNS FROM orders";
        db.query(checkColsSql, (err, result) => {
          if (!err) {
            const cols = result.map(r => r.Field);
            if (!cols.includes('shipping_method')) {
              db.query("ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(100)");
            }
            if (!cols.includes('payment_method')) {
              db.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100)");
            }
            if (!cols.includes('payment_status')) {
              db.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending'");
            }
            if (!cols.includes('email')) {
              db.query("ALTER TABLE orders ADD COLUMN email VARCHAR(255)");
            }
            if (!cols.includes('order_status')) {
              db.query("ALTER TABLE orders ADD COLUMN order_status VARCHAR(50) DEFAULT 'Pending'");
            }
            if (!cols.includes('customer_id')) {
              db.query("ALTER TABLE orders ADD COLUMN customer_id VARCHAR(50)");
            }
            if (!cols.includes('total')) {
              db.query("ALTER TABLE orders ADD COLUMN total DECIMAL(12,2) NOT NULL DEFAULT 0.00");
            }
            if (!cols.includes('subtotal')) {
              db.query("ALTER TABLE orders ADD COLUMN subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00");
            }
            if (!cols.includes('discount')) {
              db.query("ALTER TABLE orders ADD COLUMN discount DECIMAL(12,2) NOT NULL DEFAULT 0.00");
            }
            if (!cols.includes('first_name')) {
              db.query("ALTER TABLE orders ADD COLUMN first_name VARCHAR(100)");
            }
            if (!cols.includes('last_name')) {
              db.query("ALTER TABLE orders ADD COLUMN last_name VARCHAR(100)");
            }
            if (!cols.includes('address')) {
              db.query("ALTER TABLE orders ADD COLUMN address TEXT");
            }
            if (!cols.includes('mobile')) {
              db.query("ALTER TABLE orders ADD COLUMN mobile VARCHAR(20)");
            }
            if (!cols.includes('city')) {
              db.query("ALTER TABLE orders ADD COLUMN city VARCHAR(100)");
            }
            if (!cols.includes('province')) {
              db.query("ALTER TABLE orders ADD COLUMN province VARCHAR(100)");
            }
            if (!cols.includes('zip_code')) {
              db.query("ALTER TABLE orders ADD COLUMN zip_code VARCHAR(20)");
            }
          }
        });
      }
    });

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
            const cols = result.map(r => r.Field);
            if (!cols.includes('account_id')) {
              db.query("ALTER TABLE users ADD COLUMN account_id VARCHAR(50) UNIQUE AFTER id");
            }
          }
        });
      }
    });

    const createSubscribersTableSql = `
      CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(createSubscribersTableSql);

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
            const cols = result.map(r => r.Field);
            if (!cols.includes('images')) {
              db.query("ALTER TABLE products ADD COLUMN images JSON AFTER image_url");
            }
            if (!cols.includes('product_code')) {
              db.query("ALTER TABLE products ADD COLUMN product_code VARCHAR(50) UNIQUE AFTER name");
            }
          }
        });
      }
    });

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
            const cols = result.map(r => r.Field);
            if (!cols.includes('customer_id')) {
              db.query("ALTER TABLE customers ADD COLUMN customer_id VARCHAR(50) UNIQUE AFTER id");
            }
          }
        });
      }
    });

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
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            const sql = "INSERT INTO admin_profile (name, email, role, password) VALUES ('Admin', 'admin@chronos.com', 'Super Admin', ?)";
            db.query(sql, [hashedPassword]);
          }
        });
      }
    });

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
            const cols = result.map(r => r.Field);
            if (!cols.includes('customer_name')) {
              db.query("ALTER TABLE reviews ADD COLUMN customer_name VARCHAR(255) AFTER customer_id");
            }
            // Migration: Set NULL customer_names to 'Valued Client'
            db.query("UPDATE reviews SET customer_name = 'Valued Client' WHERE customer_name IS NULL OR customer_name = ''");
          }
        });
      }
    });
  }
});


//REGISTER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const account_id = 'ACC-' + crypto.randomBytes(3).toString('hex').toUpperCase();

  const sql = "INSERT INTO users (account_id, name, email, password) VALUES (?, ?, ?, ?)";

  db.query(sql, [account_id, name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: "Email already exists" });
      return res.json({ success: false, message: "Error saving data" });
    }

    // Also update Customers page of admin panel
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const insertCustSql = `
      INSERT INTO customers (customer_id, initials, name, email, join_date, status)
      VALUES (?, ?, ?, ?, CURDATE(), 'New')
      ON DUPLICATE KEY UPDATE 
        customer_id = VALUES(customer_id),
        initials = VALUES(initials),
        name = VALUES(name),
        status = 'Active'
    `;
    db.query(insertCustSql, [account_id, initials, name, email]);

    return res.json({ success: true, message: "User Registered", account_id });
  });
});


//GOOGLE REGISTER
app.post("/google-register", (req, res) => {
  const { name, email, password } = req.body;
  const account_id = 'ACC-' + crypto.randomBytes(3).toString('hex').toUpperCase();

  const sql = "INSERT INTO users (account_id, name, email, password) VALUES (?, ?, ?, ?)";

  db.query(sql, [account_id, name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // If already exists, just return success (login flow)
        return res.json({ success: true });
      }
      return res.json({ success: false });
    }

    // Also add to customers
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const insertCustSql = `
      INSERT INTO customers (customer_id, initials, name, email, join_date, status)
      VALUES (?, ?, ?, ?, CURDATE(), 'New')
      ON DUPLICATE KEY UPDATE 
        customer_id = VALUES(customer_id),
        initials = VALUES(initials),
        name = VALUES(name),
        status = 'Active'
    `;
    db.query(insertCustSql, [account_id, initials, name, email]);

    return res.json({ success: true, account_id });
  });
});

//LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) return res.json({ success: false, message: "Server error" });

    if (result.length > 0) {
      const user = result[0];
      const isMatch = bcrypt.compareSync(password, user.password || "");
      if (isMatch) {
        return res.json({
          success: true,
          user: {
            name: user.name,
            email: user.email,
            account_id: user.account_id,
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            province: user.province || '',
            zip_code: user.zip_code || '',
            avatar: user.avatar || ''
          }
        });
      }
    }
    return res.json({ success: false, message: "Invalid email or password" });
  });
});

// PROFILE UPDATE
app.put("/api/user/profile", (req, res) => {
  const { email, name, phone, address, city, province, zip_code } = req.body;
  const sql = "UPDATE users SET name=?, phone=?, address=?, city=?, province=?, zip_code=? WHERE email=?";
  db.query(sql, [name, phone, address, city, province, zip_code, email], (err, result) => {
    if (err) return res.json({ success: false, message: "Error updating profile" });
    
    // Also update customers table to keep synced
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const sqlCust = "UPDATE customers SET name=?, initials=? WHERE email=?";
    db.query(sqlCust, [name, initials, email]);

    return res.json({ success: true, message: "Profile updated successfully" });
  });
});

// SECURITY (PASSWORD CHANGE)
app.post("/api/user/security", (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const sqlSelect = "SELECT password FROM users WHERE email = ?";
  db.query(sqlSelect, [email], (err, result) => {
    if (err || result.length === 0) return res.json({ success: false, message: "User not found" });
    
    const user = result[0];
    const isMatch = bcrypt.compareSync(currentPassword, user.password || "");
    if (!isMatch) return res.json({ success: false, message: "Incorrect current password" });

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    const sqlUpdate = "UPDATE users SET password = ? WHERE email = ?";
    db.query(sqlUpdate, [hashedNewPassword, email], (err) => {
      if (err) return res.json({ success: false, message: "Error updating password" });
      res.json({ success: true, message: "Password updated successfully" });
    });
  });
});

// AVATAR UPLOAD
app.post("/api/user/avatar", upload.single("avatar"), (req, res) => {
  const { email } = req.body;
  if (!req.file) return res.json({ success: false, message: "No file uploaded" });
  const avatar_url = `/uploads/${req.file.filename}`;
  const sql = "UPDATE users SET avatar = ? WHERE email = ?";
  db.query(sql, [avatar_url, email], (err) => {
    if (err) return res.json({ success: false, message: "Error saving avatar" });
    res.json({ success: true, avatar_url });
  });
});

// NOTIFICATIONS SETTINGS
app.get("/api/user/notifications", (req, res) => {
  const { email } = req.query;
  const sql = "SELECT notif_orders, notif_promos FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err || result.length === 0) return res.json({ success: false });
    res.json({ success: true, settings: result[0] });
  });
});

app.put("/api/user/notifications", (req, res) => {
  const { email, notif_orders, notif_promos } = req.body;
  const sql = "UPDATE users SET notif_orders = ?, notif_promos = ? WHERE email = ?";
  db.query(sql, [notif_orders, notif_promos, email], (err) => {
    if (err) return res.json({ success: false });
    res.json({ success: true });
  });
});

// BILLING (PAYMENT METHODS)
app.get("/api/user/billing", (req, res) => {
  const { email } = req.query;
  const sql = "SELECT * FROM payment_methods WHERE user_email = ? ORDER BY is_default DESC, created_at DESC";
  db.query(sql, [email], (err, results) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, paymentMethods: results });
  });
});

app.post("/api/user/billing", (req, res) => {
  const { user_email, card_holder, card_number, exp_date, card_type, is_default } = req.body;
  
  if (is_default) {
    db.query("UPDATE payment_methods SET is_default = false WHERE user_email = ?", [user_email], (err) => {
      const sqlInsert = "INSERT INTO payment_methods (user_email, card_holder, card_number, exp_date, card_type, is_default) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(sqlInsert, [user_email, card_holder, card_number, exp_date, card_type, is_default], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
      });
    });
  } else {
    const sql = "INSERT INTO payment_methods (user_email, card_holder, card_number, exp_date, card_type, is_default) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [user_email, card_holder, card_number, exp_date, card_type, is_default], (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true });
    });
  }
});

app.delete("/api/user/billing/:id", (req, res) => {
  db.query("DELETE FROM payment_methods WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.json({ success: false });
    res.json({ success: true });
  });
});


//SUBSCRIBE TO NEWSLETTER
app.post("/subscribe", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  // Create table if not exists automatically so it works out of the box
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableSql, (err) => {
    if (err) {
      console.log("Error creating table:", err);
      return res.json({ success: false, message: "Database initialization error" });
    }

    const sql = "INSERT INTO subscribers (email) VALUES (?)";
    db.query(sql, [email], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.json({ success: false, message: "Email is already subscribed" });
        }
        return res.json({ success: false, message: "Error saving subscription" });
      }
      return res.json({ success: true, message: "Thanks for subscribing!" });
    });
  });
});



// GLOBAL SEARCH API
app.get("/api/products/search", (req, res) => {
  const query = req.query.q || '';
  const searchStr = `%${query}%`;
  const sql = "SELECT * FROM products WHERE name LIKE ? OR category LIKE ? OR brand LIKE ?";
  db.query(sql, [searchStr, searchStr, searchStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// NEWSLETTER AND OTHER APIS (REVIEWS HANDLED BELOW IN ADMIN/PUBLIC SECTIONS)
// (Redundant routes removed to prevent confusion)

app.post("/checkout", (req, res) => {
  const { items, subtotal, discount, total, shippingDetails, shippingMethod, paymentMethod, email, accountId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.json({ success: false, message: "No items in order" });
  }

  const userEmail = email || (shippingDetails && shippingDetails.email) || null;
  const { firstName, lastName, address, mobile, city, province, zipCode } = shippingDetails || {};

  const sql = `
    INSERT INTO orders 
    (customer_id, items, email, subtotal, discount, total, shipping_method, payment_method, first_name, last_name, address, mobile, city, province, zip_code) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    accountId || null,
    JSON.stringify(items),
    userEmail,
    subtotal,
    discount,
    total,
    shippingMethod || 'Standard Delivery',
    paymentMethod || 'Credit/Debit',
    firstName,
    lastName,
    address,
    mobile,
    city,
    province,
    zipCode
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log("Error saving order:", err);
      return res.json({ success: false, message: "Error saving order" });
    }

    // Trigger New Order Notification
    const newOrderId = result.insertId;
    const orderNotifText = `New order received: #ORD-${String(newOrderId).padStart(4, '0')} from ${firstName || 'Guest'} ${lastName || ''}`;
    db.query("INSERT INTO notifications (text, type) VALUES (?, 'order')", [orderNotifText]);


    // Deduct Stock and Trigger Notifications
    try {
      const parsedItems = JSON.parse(JSON.stringify(items)); // Ensure it's an array
      parsedItems.forEach(item => {
        // 1. Deduct Stock
        const updateStockSql = "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?";
        db.query(updateStockSql, [item.quantity, item.id], (uerr) => {
          if (uerr) console.error("Error deducting stock for product", item.id, uerr);

          // 2. Check for Low Stock Notification
          db.query("SELECT name, stock_quantity FROM products WHERE id = ?", [item.id], (serr, rows) => {
            if (!serr && rows.length > 0) {
              const p = rows[0];
              if (p.stock_quantity < 5) {
                const notifText = `Low stock alert for ${p.name}. Only ${p.stock_quantity} left in inventory!`;
                db.query("INSERT INTO notifications (text, type) VALUES (?, 'low_stock')", [notifText]);
              }
            }
          });
        });
      });
    } catch (e) {
      console.error("Stock deduction trigger error:", e);
    }

    // Automatically map into CRM if a user is logged in
    if (userEmail) {
      db.query("SELECT * FROM customers WHERE email = ?", [userEmail], (existsErr, rows) => {
        const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : "Unknown User";
        const initials = (firstName ? firstName[0].toUpperCase() : "") + (lastName ? lastName[0].toUpperCase() : "");

        if (!existsErr && rows.length === 0) {
          // NEW CUSTOMER (Absolute Guest)
          const customer_id = 'CUST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          const insertSql = `
            INSERT INTO customers (customer_id, initials, name, email, orders_count, total_spent, join_date, status)
            VALUES (?, ?, ?, ?, 1, ?, CURDATE(), 'Active')
          `;
          db.query(insertSql, [customer_id, initials, fullName, userEmail, total], (ierr) => {
            if (!ierr) {
              const notifText = `New customer registration: ${fullName} (${customer_id})`;
              db.query("INSERT INTO notifications (text, type) VALUES (?, 'customer')", [notifText]);
              console.log("New customer added from checkout:", customer_id);
            }
          });
        } else {
          // EXISTING CUSTOMER (Registered or returning guest)
          const existing = rows[0];

          // Protect Account ID prefix and registered name
          const isRegistered = existing.customer_id?.startsWith('ACC-');
          const finalId = accountId || existing.customer_id;

          const updateSql = `
            UPDATE customers 
            SET orders_count = orders_count + 1, 
                total_spent = total_spent + ?,
                status = 'Active'
                ${(!isRegistered) ? ", name = ?" : ""}
            WHERE email = ?
          `;

          const params = (!isRegistered) ? [total, fullName, userEmail] : [total, userEmail];
          db.query(updateSql, params);
        }
      });
    }

    return res.json({ success: true, message: "Order placed successfully!", orderId: result.insertId });
  });
});

// GET USER ORDERS
app.get("/api/user/orders", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const sql = "SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, orders: results });
  });
});

// UPDATE PAYMENT STATUS
app.post("/api/orders/update-payment-status", (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) return res.status(400).json({ success: false, message: "orderId and status required" });

  const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
  db.query(sql, [status, orderId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Status updated" });
  });
});

// PAYHERE HASH GENERATION
app.post("/generate-payhere-hash", (req, res) => {
  const { order_id, amount, currency } = req.body;
  const merchantSecretHash = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();

  const formattedAmount = Number(amount).toFixed(2);

  const dataToHash = MERCHANT_ID + order_id + formattedAmount + currency + merchantSecretHash;
  const hash = crypto.createHash('md5').update(dataToHash).digest('hex').toUpperCase();

  res.json({ hash, merchant_id: MERCHANT_ID });
});

// PAYHERE NOTIFY ENDPOINT (WEBHOOK)
app.post("/payhere-notify", express.urlencoded({ extended: true }), (req, res) => {
  const merchant_id = req.body.merchant_id;
  const order_id = req.body.order_id;
  const payhere_amount = req.body.payhere_amount;
  const payhere_currency = req.body.payhere_currency;
  const status_code = req.body.status_code;
  const md5sig = req.body.md5sig;

  const merchantSecretHash = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
  const dataToHash = merchant_id + order_id + payhere_amount + payhere_currency + status_code + merchantSecretHash;
  const local_md5sig = crypto.createHash('md5').update(dataToHash).digest('hex').toUpperCase();

  if (local_md5sig === md5sig) {
    let payment_status = 'Pending';
    if (status_code == 2) payment_status = 'Paid';
    else if (status_code == 0) payment_status = 'Pending';
    else if (status_code == -1) payment_status = 'Canceled';
    else if (status_code == -2) payment_status = 'Failed';
    else if (status_code == -3) payment_status = 'Chargedback';

    const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
    db.query(sql, [payment_status, order_id], (err, result) => {
      if (err) {
        console.log("Error updating payment status in DB", err);
      } else {
        console.log("Payment status updated to", payment_status, "for order_id", order_id);
      }
    });
  } else {
    console.log("Invalid MD5 signature");
  }

  res.sendStatus(200);
});

// HELPERS for Filtering/Sorting
const mapHexToColorName = (hex) => {
  if (!hex) return 'Unknown';
  const h = hex.toLowerCase();
  if (h === '#000' || h === '#000000' || h === '#111111' || h.includes('black')) return 'Black';
  if (h === '#fff' || h === '#ffffff' || h.includes('white')) return 'White';
  if (h === '#d4af37' || h.includes('gold')) return 'Gold';
  if (h === '#2563eb' || h === '#1e88e5' || h.includes('blue')) return 'Blue';
  return 'Other'; // Fallback
};

// PUBLIC PRODUCTS API
app.get("/api/products", (req, res) => {

  // 1. Fetch Products with Review Aggregates
  const sql = `
    SELECT p.*, 
           COUNT(r.id) as feedback_count, 
           COALESCE(AVG(r.rating), 0) as feedback_rate
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Fetch Orders to calculate Best Sellers
    db.query("SELECT items FROM orders WHERE order_status != 'Canceled' OR order_status IS NULL", (err, orderRows) => {
      const salesCount = {};
      if (!err) {
        orderRows.forEach(row => {
          try {
            const items = JSON.parse(row.items);
            if (Array.isArray(items)) {
              items.forEach(item => {
                const id = item.id;
                if (id) {
                  salesCount[id] = (salesCount[id] || 0) + (Number(item.quantity) || 1);
                }
              });
            }
          } catch (e) { }
        });
      }

      // 3. Process Products
      const topSellerIds = Object.entries(salesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id]) => Number(id));

      const newArrivalIds = products.slice(0, 8).map(p => Number(p.id));

      const enhancedProducts = products.map(p => {
        const pId = Number(p.id);
        return {
          ...p,
          isBestSeller: topSellerIds.includes(pId),
          isNew: newArrivalIds.includes(pId),
          color: mapHexToColorName(p.color),
          priceVal: parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0,
          // Format numeric ratings
          feedback_rate: Number(p.feedback_rate).toFixed(1),
          feedback_count: Number(p.feedback_count)
        };
      });

      res.json(enhancedProducts);
    });
  });
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, 
           COUNT(r.id) as feedback_count, 
           COALESCE(AVG(r.rating), 0) as feedback_rate
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });

    const p = result[0];
    res.json({
      ...p,
      feedback_rate: Number(p.feedback_rate).toFixed(1),
      feedback_count: Number(p.feedback_count)
    });
  });
});

// SEACH API (Consolidated with Reviews)
app.get("/api/products/search", (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  const sql = `
    SELECT p.*, 
           COUNT(r.id) as feedback_count, 
           COALESCE(AVG(r.rating), 0) as feedback_rate
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.name LIKE ? OR p.brand LIKE ? OR p.category LIKE ?
    GROUP BY p.id
  `;
  const searchTerm = `%${query}%`;

  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const enhanced = results.map(p => ({
      ...p,
      feedback_rate: Number(p.feedback_rate).toFixed(1),
      feedback_count: Number(p.feedback_count)
    }));

    res.json(enhanced);
  });
});

// *** ADMIN APIs ***

// LOGIN (Secure Database Driven Login)
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM admin_profile WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid admin credentials" });

    const admin = results[0];
    const isMatch = bcrypt.compareSync(password, admin.password);

    if (isMatch) {
      // In a real production app, we would return a JWT token here
      res.json({
        message: "Login successful!",
        user: { name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar_url }
      });
    } else {
      res.status(401).json({ error: "Invalid admin credentials" });
    }
  });
});

// DASHBOARD
app.get("/api/admin/dashboard", (req, res) => {
  const stats = {
    revenue: { value: "$0.00" },
    orders: { value: 0 },
    customers: { value: 0 },
    products: { value: 0 }
  };

  db.query("SELECT SUM(total) as revenue, COUNT(*) as count FROM orders WHERE order_status = 'Delivered'", (err, result) => {
    if (!err && result[0]) {
      stats.revenue.value = "Rs." + (result[0].revenue || 0).toLocaleString();
      stats.orders.value = result[0].count;
    }

    db.query("SELECT COUNT(*) as count FROM customers", (err, result) => {
      if (!err && result[0]) stats.customers.value = result[0].count;

      db.query("SELECT COUNT(*) as count FROM products", (err, result) => {
        if (!err && result[0]) stats.products.value = result[0].count;

        db.query("SELECT * FROM orders ORDER BY id DESC", (err, allOrders) => {
          const orders = allOrders || [];
          const recentOrders = orders.slice(0, 5).map(o => {
            let parsedItems = [];
            try { parsedItems = JSON.parse(o.items); } catch (e) { }
            return {
              id: "ORD-" + String(o.id).padStart(4, "0"),
              customer: o.first_name + " " + o.last_name,
              product: parsedItems[0]?.name || "Multiple Items",
              amount: "Rs." + o.total,
              status: o.payment_status || "Pending"
            };
          });

          // Top Products Aggregation
          const freq = {};
          orders.forEach(o => {
            let pItems = [];
            try { pItems = JSON.parse(o.items); } catch (e) { }
            pItems.forEach(item => {
              freq[item.name] = (freq[item.name] || 0) + (item.quantity || 1);
            });
          });
          const topProducts = Object.keys(freq).map(k => ({ name: k, value: freq[k] })).sort((a, b) => b.value - a.value).slice(0, 5);

          db.query("SELECT DATE_FORMAT(created_at, '%b') as month, SUM(total) as value FROM orders GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY created_at ASC LIMIT 6", (err, trends) => {
            const data = {
              stats,
              recentOrders,
              revenueTrend: trends && trends.length > 0 ? trends : [{ month: 'Jan', value: 0 }],
              topProducts: topProducts.length > 0 ? topProducts : []
            };
            res.json(data);
          });
        });
      });
    });
  });
});

// PRODUCTS
app.get("/api/admin/products", (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    const uniqueCategories = new Set();
    let inStock = 0;

    products.forEach(p => {
      if (p.category) uniqueCategories.add(p.category);
      if (p.stock_quantity > 0) inStock++;
    });

    const stats = {
      totalProducts: products.length,
      inStockCount: inStock,
      outOfStockCount: products.length - inStock,
      categoriesCount: uniqueCategories.size
    };

    res.json({ products, stats });
  });
});

app.post("/api/admin/products", upload.array("images", 5), (req, res) => {
  const { name, price, stock_quantity, brand, category, color, strap_size, description } = req.body;

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map(f => `/uploads/${f.filename}`);
  }

  const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
  const imagesJson = JSON.stringify(imageUrls);

  const sql = `INSERT INTO products (name, price, stock_quantity, brand, category, color, strap_size, description, image_url, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [name, "Rs." + Number(price).toLocaleString(), Number(stock_quantity), brand, category, color, strap_size, description, firstImageUrl, imagesJson];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put("/api/admin/products/:id", upload.array("images", 5), (req, res) => {
  const { name, price, stock_quantity, brand, category, color, strap_size, description } = req.body;
  const { id } = req.params;

  let existingImages = [];
  if (req.body.existingImages) {
    try { existingImages = JSON.parse(req.body.existingImages); } catch (e) { }
  }

  let newImageUrls = [];
  if (req.files && req.files.length > 0) {
    newImageUrls = req.files.map(f => `/uploads/${f.filename}`);
  }

  let combinedImages = [...existingImages, ...newImageUrls].slice(0, 5);

  const firstImageUrl = combinedImages.length > 0 ? combinedImages[0] : null;
  const imagesJson = JSON.stringify(combinedImages);

  const sql = `UPDATE products SET name=?, price=?, stock_quantity=?, brand=?, category=?, color=?, strap_size=?, description=?, image_url=?, images=? WHERE id=?`;
  const values = [name, "Rs." + Number(price).toLocaleString(), Number(stock_quantity), brand, category, color, strap_size, description, firstImageUrl, imagesJson, id];
  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete("/api/admin/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// SETTINGS & PROFILE
app.get("/api/admin/settings", (req, res) => {
  db.query("SELECT * FROM settings WHERE id=1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
});

app.put("/api/admin/settings", (req, res) => {
  const { store_name, contact_email, phone_number, dark_mode, accent_color, email_alerts_orders, low_stock_alerts } = req.body;
  const sql = `UPDATE settings SET store_name=?, contact_email=?, phone_number=?, dark_mode=?, accent_color=?, email_alerts_orders=?, low_stock_alerts=? WHERE id=1`;
  db.query(sql, [store_name, contact_email, phone_number, dark_mode, accent_color, email_alerts_orders, low_stock_alerts], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get("/api/admin/profile", (req, res) => {
  db.query("SELECT * FROM admin_profile WHERE id=1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
});

app.put("/api/admin/profile", (req, res) => {
  const { first_name, last_name, email, role } = req.body;
  const name = `${first_name || ''} ${last_name || ''}`.trim();
  db.query("UPDATE admin_profile SET name=?, email=?, role=? WHERE id=1", [name, email, role], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post("/api/admin/profile/security", (req, res) => {
  const { currentPassword, newPassword, id } = req.body;
  const adminId = id || 1;

  if (!id) {
    return res.status(400).json({ error: 'CRITICAL ERROR: Your Admin ID is missing from the session. Please log out and securely log back in.' });
  }

  db.query("SELECT * FROM admins WHERE id=?", [adminId], (err, results) => {
    if (results && results.length > 0) {
      const admin = results[0];

      if (admin.password === 'google_sso') {
         if (currentPassword !== 'google_sso') {
            return res.status(401).json({ error: "Notice: Since you created this account using Google SSO, your temporary strictly-enforced Current Password is 'google_sso'. Type that to proceed!" });
         }
      }

      const isMatch = bcrypt.compareSync(currentPassword, admin.password);
      const isPlainTextMatch = (currentPassword === admin.password);

      if (isMatch || isPlainTextMatch || (admin.password === 'google_sso' && currentPassword === 'google_sso')) {
        const newHashedPassword = bcrypt.hashSync(newPassword, 10);
        db.query("UPDATE admins SET password=? WHERE id=?", [newHashedPassword, adminId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, message: 'Password updated successfully' });
        });
      } else {
        res.status(401).json({ error: `Incorrect password! We securely evaluated your text against the account: ${admin.email}. Please try again.` });
      }
    } else {
      res.status(404).json({ error: "Admin not found" });
    }
  });
});

app.post("/api/admin/profile/avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  const avatar_url = `/uploads/${req.file.filename}`;
  db.query("UPDATE admin_profile SET avatar_url=? WHERE id=1", [avatar_url], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, avatar_url });
  });
});

// CUSTOMERS
app.get("/api/admin/customers", (req, res) => {
  db.query("SELECT * FROM customers ORDER BY id DESC", (err, customers) => {
    if (err) return res.status(500).json({ error: err.message });

    let active = 0; let newMonth = 0;
    const now = new Date();
    customers.forEach(c => {
      if (c.status === "Active" || c.status === "active") active++;
      if (c.status === "New" || c.status === "new") newMonth++;
      
      // Ensure join_date is a readable string
      if (c.join_date) c.join_date = new Date(c.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      if (c.total_spent) c.total_spent = "Rs." + Number(c.total_spent).toLocaleString();
    });

    const stats = {
      totalCustomers: customers.length,
      activeCount: active,
      newMonthCount: newMonth
    };

    res.json({ customers, stats });
  });
});

app.post("/api/admin/customers", (req, res) => {
  const { name, email, orders_count, total_spent, join_date, status, initials } = req.body;
  const sql = `INSERT INTO customers (name, email, orders_count, total_spent, join_date, status, initials) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [name, email, Number(orders_count), Number(total_spent), join_date, status, initials];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put("/api/admin/customers/:id", (req, res) => {
  const { name, email, orders_count, total_spent, join_date, status, initials } = req.body;
  const sql = `UPDATE customers SET name=?, email=?, orders_count=?, total_spent=?, join_date=?, status=?, initials=? WHERE id=?`;
  const values = [name, email, Number(orders_count), Number(total_spent), join_date, status, initials, req.params.id];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete("/api/admin/customers/:id", (req, res) => {
  db.query("DELETE FROM customers WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ORDERS
app.get("/api/admin/orders", (req, res) => {
  db.query("SELECT * FROM orders ORDER BY id DESC", (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });

    let pending = 0; let shipped = 0; let delivered = 0;

    const mapped = orders.map(o => {
      const stat = o.payment_status || "Pending";
      if (stat === "Pending") pending++;
      if (stat === "Shipped") shipped++;
      if (stat === "Delivered") delivered++;

      const cDate = new Date(o.created_at);

      return {
        id: "ORD-" + String(o.id).padStart(4, "0"),
        customer: o.first_name + " " + o.last_name,
        date: cDate.toLocaleDateString(),
        items: JSON.parse(o.items)?.length + " Items",
        total: "Rs." + o.total,
        status: stat
      };
    });

    const stats = {
      totalOrders: orders.length,
      pendingCount: pending,
      shippedCount: shipped,
      deliveredCount: delivered
    };

    res.json({ orders: mapped, stats });
  });
});

// REVIEWS
app.post("/api/reviews", (req, res) => {
  const { product_id, order_id, rating, comment, customer_name } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: "Missing product_id. Reviews can only be submitted for items purchased with the new checkout system." });
  }

  const sql = "INSERT INTO reviews (product_id, order_id, rating, comment, customer_name) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [product_id, order_id, rating, comment, customer_name], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

app.get("/api/reviews/:product_id", (req, res) => {
  const { product_id } = req.params;
  db.query("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", [product_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/reviews-featured", (req, res) => {
  const sql = `
    SELECT r.*, p.name as product_name, p.color as product_color
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.id
    WHERE r.rating = 5
    ORDER BY r.created_at DESC
    LIMIT 3
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Normalize color codes to names
    const mapped = results.map(r => ({
      ...r,
      product_color: mapHexToColorName(r.product_color)
    }));

    res.json(mapped);
  });
});

app.put("/api/admin/orders/:id", (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body;

  if (!order_status) return res.status(400).json({ error: "Order status is required" });

  // Extract numeric ID from "ORD-XXXX" if necessary, or just use it if it's the raw ID
  const numericId = id.replace("ORD-", "");

  const sql = "UPDATE orders SET order_status = ? WHERE id = ?";
  db.query(sql, [order_status, numericId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 404 Handler - Log failing requests
app.use((req, res, next) => {
  console.log(`Resource NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Resource not found" });
});

//START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
