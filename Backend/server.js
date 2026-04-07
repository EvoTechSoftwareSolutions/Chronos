import express from "express";
import mysql from "mysql2";
import cors from "cors";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

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
            if (!cols.includes('payment_status')) {
              db.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending' AFTER payment_method");
            }
            if (!cols.includes('email')) {
              db.query("ALTER TABLE orders ADD COLUMN email VARCHAR(255) AFTER id");
            }
            if (!cols.includes('order_status')) {
              db.query("ALTER TABLE orders ADD COLUMN order_status VARCHAR(50) DEFAULT 'Processing' AFTER payment_status");
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
          }
        });
      }
    });

    const createCustomersSql = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    db.query(createCustomersSql);

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
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(createReviewsSql);
  }
});


//REGISTER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: "Email already exists" });
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

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) return res.json({ success: false, message: "Server error" });
    
    if (result.length > 0) {
      const user = result[0];
      const isMatch = bcrypt.compareSync(password, user.password || "");
      if (isMatch) {
         return res.json({ success: true, user: { name: user.name, email: user.email } });
      }
    }
    return res.json({ success: false, message: "Invalid email or password" });
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
     if(err) return res.status(500).json({ error: err.message });
     res.json(results);
  });
});

// REVIEWS API
app.get("/api/reviews/:product_id", (req, res) => {
   const sql = "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC";
   db.query(sql, [req.params.product_id], (err, results) => {
       if(err) return res.status(500).json({ error: err.message });
       res.json(results);
   });
});

app.post("/api/reviews", (req, res) => {
  const { product_id, order_id, rating, comment } = req.body;
  const sql = "INSERT INTO reviews (product_id, order_id, rating, comment) VALUES (?, ?, ?, ?)";
  db.query(sql, [product_id, order_id, rating, comment], (err, result) => {
      if(err) return res.status(500).json({ success: false, error: err.message});
      res.json({ success: true, message: "Feedback submitted successfully!" });
  });
});

//CHECKOUT - Save order to DB
app.post("/checkout", (req, res) => {
  console.log("Incoming checkout payload:", req.body);
  const { items, subtotal, discount, total, shippingDetails, shippingMethod, paymentMethod, email } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.json({ success: false, message: "No items in order" });
  }

  const userEmail = email || (shippingDetails && shippingDetails.email) || null;

  const { firstName, lastName, address, mobile, city, province, zipCode } = shippingDetails || {};

  const sql = `
    INSERT INTO orders 
    (items, email, subtotal, discount, total, shipping_method, payment_method, first_name, last_name, address, mobile, city, province, zip_code) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
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
    
    // Automatically map into CRM if a user is logged in
    if (userEmail) {
      const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : "Unknown User";
      const initials = (firstName ? firstName[0].toUpperCase() : "") + (lastName ? lastName[0].toUpperCase() : "");
      const customerSql = `
         INSERT INTO customers (name, email, orders_count, total_spent, join_date, status, initials)
         VALUES (?, ?, 1, ?, CURDATE(), 'Active', ?)
         ON DUPLICATE KEY UPDATE 
         orders_count = orders_count + 1, 
         total_spent = total_spent + ?,
         status = 'Active'
      `;
      db.query(customerSql, [fullName, userEmail, total, initials, total], (cerr) => {
         if(cerr) console.log("Error inserting to CRM:", cerr);
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
  const merchant_id         = req.body.merchant_id;
  const order_id            = req.body.order_id;
  const payhere_amount      = req.body.payhere_amount;
  const payhere_currency    = req.body.payhere_currency;
  const status_code         = req.body.status_code;
  const md5sig              = req.body.md5sig;

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

// PUBLIC PRODUCTS API
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, products) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(products);
  });
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result[0]);
  });
});

app.get("/api/products/search", (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  
  const sql = "SELECT * FROM products WHERE name LIKE ? OR brand LIKE ? OR category LIKE ?";
  const searchTerm = `%${query}%`;
  
  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
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
  
  db.query("SELECT SUM(total) as revenue, COUNT(*) as count FROM orders", (err, result) => {
    if(!err && result[0]) {
      stats.revenue.value = "$" + (result[0].revenue || 0).toLocaleString();
      stats.orders.value = result[0].count;
    }
    
    db.query("SELECT COUNT(*) as count FROM customers", (err, result) => {
      if(!err && result[0]) stats.customers.value = result[0].count;
      
      db.query("SELECT COUNT(*) as count FROM products", (err, result) => {
        if(!err && result[0]) stats.products.value = result[0].count;
        
        db.query("SELECT * FROM orders ORDER BY id DESC", (err, allOrders) => {
          const orders = allOrders || [];
          const recentOrders = orders.slice(0, 5).map(o => {
             let parsedItems = [];
             try { parsedItems = JSON.parse(o.items); } catch(e){}
             return {
                 id: "ORD-" + String(o.id).padStart(4, "0"),
                 customer: o.first_name + " " + o.last_name,
                 product: parsedItems[0]?.name || "Multiple Items",
                 amount: "$" + o.total,
                 status: o.payment_status || "Pending"
             };
          });

          // Top Products Aggregation
          const freq = {};
          orders.forEach(o => {
             let pItems = [];
             try { pItems = JSON.parse(o.items); } catch(e){}
             pItems.forEach(item => {
               freq[item.name] = (freq[item.name] || 0) + (item.quantity || 1);
             });
          });
          const topProducts = Object.keys(freq).map(k => ({ name: k, value: freq[k] })).sort((a,b) => b.value - a.value).slice(0, 5);

          db.query("SELECT DATE_FORMAT(created_at, '%b') as month, SUM(total) as value FROM orders GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY created_at ASC LIMIT 6", (err, trends) => {
             const data = {
                stats,
                recentOrders,
                revenueTrend: trends && trends.length > 0 ? trends : [{month: 'Jan', value: 0}],
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
       if(p.category) uniqueCategories.add(p.category);
       if(p.stock_quantity > 0) inStock++;
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
  const values = [name, "$" + Number(price).toLocaleString(), Number(stock_quantity), brand, category, color, strap_size, description, firstImageUrl, imagesJson];
  
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
      try { existingImages = JSON.parse(req.body.existingImages); } catch(e){}
  }
  
  let newImageUrls = [];
  if (req.files && req.files.length > 0) {
     newImageUrls = req.files.map(f => `/uploads/${f.filename}`);
  }
  
  let combinedImages = [...existingImages, ...newImageUrls].slice(0, 5);
  
  const firstImageUrl = combinedImages.length > 0 ? combinedImages[0] : null;
  const imagesJson = JSON.stringify(combinedImages);

  const sql = `UPDATE products SET name=?, price=?, stock_quantity=?, brand=?, category=?, color=?, strap_size=?, description=?, image_url=?, images=? WHERE id=?`;
  const values = [name, "$" + Number(price).toLocaleString(), Number(stock_quantity), brand, category, color, strap_size, description, firstImageUrl, imagesJson, id];
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
      if(err) return res.status(500).json({error: err.message});
      res.json(results[0] || {});
   });
});

app.put("/api/admin/settings", (req, res) => {
   const { store_name, contact_email, phone_number, dark_mode, accent_color, email_alerts_orders, low_stock_alerts } = req.body;
   const sql = `UPDATE settings SET store_name=?, contact_email=?, phone_number=?, dark_mode=?, accent_color=?, email_alerts_orders=?, low_stock_alerts=? WHERE id=1`;
   db.query(sql, [store_name, contact_email, phone_number, dark_mode, accent_color, email_alerts_orders, low_stock_alerts], (err) => {
      if(err) return res.status(500).json({error: err.message});
      res.json({success: true});
   });
});

app.get("/api/admin/profile", (req, res) => {
   db.query("SELECT * FROM admin_profile WHERE id=1", (err, results) => {
      if(err) return res.status(500).json({error: err.message});
      res.json(results[0] || {});
   });
});

app.put("/api/admin/profile", (req, res) => {
   const { first_name, last_name, email, role } = req.body;
   const name = `${first_name || ''} ${last_name || ''}`.trim();
   db.query("UPDATE admin_profile SET name=?, email=?, role=? WHERE id=1", [name, email, role], (err) => {
      if(err) return res.status(500).json({error: err.message});
      res.json({success: true});
   });
});

app.post("/api/admin/profile/security", (req, res) => {
   const { currentPassword, newPassword } = req.body;
   db.query("SELECT password FROM admin_profile WHERE id=1", (err, results) => {
      if(results && results.length > 0 && bcrypt.compareSync(currentPassword, results[0].password)) {
         const newHashedPassword = bcrypt.hashSync(newPassword, 10);
         db.query("UPDATE admin_profile SET password=? WHERE id=1", [newHashedPassword], (err) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true});
         });
      } else {
         res.status(401).json({error: "Incorrect current password"});
      }
   });
});

app.post("/api/admin/profile/avatar", upload.single("avatar"), (req, res) => {
   if(!req.file) return res.status(400).json({error: "No image provided"});
   const avatar_url = `/uploads/${req.file.filename}`;
   db.query("UPDATE admin_profile SET avatar_url=? WHERE id=1", [avatar_url], (err) => {
      if(err) return res.status(500).json({error: err.message});
      res.json({success: true, avatar_url});
   });
});

// CUSTOMERS
app.get("/api/admin/customers", (req, res) => {
  db.query("SELECT * FROM customers ORDER BY id DESC", (err, customers) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let active = 0; let newMonth = 0;
    const now = new Date();
    customers.forEach(c => {
       if(c.status === "Active") active++;
       if(c.join_date && new Date(c.join_date).getMonth() === now.getMonth()) newMonth++;
       // Ensure join_date is a readable string
       if(c.join_date) c.join_date = new Date(c.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
       if(c.total_spent) c.total_spent = "$" + Number(c.total_spent).toLocaleString();
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
       if(stat === "Pending") pending++;
       if(stat === "Shipped") shipped++;
       if(stat === "Delivered") delivered++;
       
       const cDate = new Date(o.created_at);
       
       return {
          id: "ORD-" + String(o.id).padStart(4, "0"),
          customer: o.first_name + " " + o.last_name,
          date: cDate.toLocaleDateString(),
          items: JSON.parse(o.items)?.length + " Items",
          total: "$" + o.total,
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
  const { product_id, order_id, rating, comment } = req.body;
  const sql = "INSERT INTO reviews (product_id, order_id, rating, comment) VALUES (?, ?, ?, ?)";
  db.query(sql, [product_id, order_id, rating, comment], (err) => {
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

//START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});