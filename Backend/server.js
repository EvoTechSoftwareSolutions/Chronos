import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database: "chronos_db",
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
              db.query("ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(100) AFTER total");
            }
            if (!cols.includes('payment_method')) {
              db.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100) AFTER shipping_method");
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
  }
});


//REGISTER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, password], (err, result) => {
  console.log(result); // use it

    if (err) {
      return res.json({ success: false, message: "Error saving data" });
    }
    return res.json({ success: true, message: "User Registered" });
  });
});


//GOOGLE REGISTER
app.post("/google-register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, password], (err, result) => {
  console.log(result); // use it

    if (err) {
      return res.json({ success: false });
    }
    return res.json({ success: true });
  });
});

//LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "Server error" });
    }

    if (result.length > 0) {
      return res.json({ success: true, user: result[0] });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
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



//CHECKOUT - Save order to DB
app.post("/checkout", (req, res) => {
  console.log("Incoming checkout payload:", req.body);
  const { items, subtotal, discount, total, shippingDetails, shippingMethod, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.json({ success: false, message: "No items in order" });
  }

  const { firstName, lastName, address, mobile, city, province, zipCode } = shippingDetails || {};

  const sql = `
    INSERT INTO orders 
    (items, subtotal, discount, total, shipping_method, payment_method, first_name, last_name, address, mobile, city, province, zip_code) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    JSON.stringify(items), 
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

  console.log("Inserting values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log("Error saving order:", err);
      return res.json({ success: false, message: "Error saving order" });
    }
    return res.json({ success: true, message: "Order placed successfully!", orderId: result.insertId });
  });
});


//START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});