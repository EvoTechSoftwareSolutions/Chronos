import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// ────────────────────────────────────────────────────────────
//  AUTH
// ────────────────────────────────────────────────────────────

// POST /api/admin/login
export function adminLogin(req, res) {
  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });

  const sql = "SELECT * FROM admin_profile WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid admin credentials" });

    const admin = results[0];
    const isMatch = bcrypt.compareSync(password, admin.password);

    if (isMatch) {
      const token = jwt.sign(
        { adminId: admin.id, email: admin.email, role: admin.role || "Admin" },
        jwtSecret,
        { expiresIn: "8h" }
      );
      res.json({
        message: "Login successful!",
        user: { name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar_url },
        token,
      });
    } else {
      res.status(401).json({ error: "Invalid admin credentials" });
    }
  });
}

// ────────────────────────────────────────────────────────────
//  DASHBOARD
// ────────────────────────────────────────────────────────────

// GET /api/admin/dashboard
export function getDashboard(req, res) {
  const stats = {
    revenue: { value: "$0.00" },
    orders: { value: 0 },
    customers: { value: 0 },
    products: { value: 0 },
  };

  db.query("SELECT SUM(total) as revenue, COUNT(*) as count FROM orders", (err, result) => {
    if (!err && result[0]) {
      stats.revenue.value = "$" + (result[0].revenue || 0).toLocaleString();
      stats.orders.value = result[0].count;
    }

    db.query("SELECT COUNT(*) as count FROM customers", (err, result) => {
      if (!err && result[0]) stats.customers.value = result[0].count;

      db.query("SELECT COUNT(*) as count FROM products", (err, result) => {
        if (!err && result[0]) stats.products.value = result[0].count;

        db.query("SELECT * FROM orders ORDER BY id DESC", (err, allOrders) => {
          const orders = allOrders || [];
          const recentOrders = orders.slice(0, 5).map((o) => {
            let parsedItems = [];
            try {
              parsedItems = JSON.parse(o.items);
            } catch (e) {}
            return {
              id: "ORD-" + String(o.id).padStart(4, "0"),
              customer: o.first_name + " " + o.last_name,
              product: parsedItems[0]?.name || "Multiple Items",
              amount: "$" + o.total,
              status: o.payment_status || "Pending",
            };
          });

          // Top Products Aggregation
          const freq = {};
          orders.forEach((o) => {
            let pItems = [];
            try {
              pItems = JSON.parse(o.items);
            } catch (e) {}
            pItems.forEach((item) => {
              freq[item.name] = (freq[item.name] || 0) + (item.quantity || 1);
            });
          });
          const topProducts = Object.keys(freq)
            .map((k) => ({ name: k, value: freq[k] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          db.query(
            "SELECT DATE_FORMAT(created_at, '%b') as month, SUM(total) as value FROM orders GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY created_at ASC LIMIT 6",
            (err, trends) => {
              const data = {
                stats,
                recentOrders,
                revenueTrend: trends && trends.length > 0 ? trends : [{ month: "Jan", value: 0 }],
                topProducts: topProducts.length > 0 ? topProducts : [],
              };
              res.json(data);
            }
          );
        });
      });
    });
  });
}

// ────────────────────────────────────────────────────────────
//  PRODUCTS (Admin)
// ────────────────────────────────────────────────────────────

// GET /api/admin/products
export function getAdminProducts(req, res) {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    const uniqueCategories = new Set();
    let inStock = 0;

    products.forEach((p) => {
      if (p.category) uniqueCategories.add(p.category);
      if (p.stock_quantity > 0) inStock++;
    });

    const stats = {
      totalProducts: products.length,
      inStockCount: inStock,
      outOfStockCount: products.length - inStock,
      categoriesCount: uniqueCategories.size,
    };

    res.json({ products, stats });
  });
}

// POST /api/admin/products
export function createAdminProduct(req, res) {
  const { name, price, stock_quantity, brand, category, color, strap_size, description } = req.body;

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map((f) => `/uploads/${f.filename}`);
  }

  const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
  const imagesJson = JSON.stringify(imageUrls);

  const sql = `INSERT INTO products (name, price, stock_quantity, brand, category, color, strap_size, description, image_url, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [name, "$" + Number(price).toLocaleString(), Number(stock_quantity), brand, category, color, strap_size, description, firstImageUrl, imagesJson];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// PUT /api/admin/products/:id
export function updateAdminProduct(req, res) {
  const { name, price, stock_quantity, brand, category, color, strap_size, description } = req.body;
  const { id } = req.params;

  let existingImages = [];
  if (req.body.existingImages) {
    try {
      existingImages = JSON.parse(req.body.existingImages);
    } catch (e) {}
  }

  let newImageUrls = [];
  if (req.files && req.files.length > 0) {
    newImageUrls = req.files.map((f) => `/uploads/${f.filename}`);
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
}

// DELETE /api/admin/products/:id
export function deleteAdminProduct(req, res) {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// ────────────────────────────────────────────────────────────
//  ORDERS (Admin)
// ────────────────────────────────────────────────────────────

// GET /api/admin/orders
export function getAdminOrders(req, res) {
  db.query("SELECT * FROM orders ORDER BY id DESC", (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });

    let pending = 0;
    let shipped = 0;
    let delivered = 0;

    const mapped = orders.map((o) => {
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
        total: "$" + o.total,
        status: stat,
      };
    });

    const stats = {
      totalOrders: orders.length,
      pendingCount: pending,
      shippedCount: shipped,
      deliveredCount: delivered,
    };

    res.json({ orders: mapped, stats });
  });
}

// PUT /api/admin/orders/:id
export function updateAdminOrder(req, res) {
  const { id } = req.params;
  const { order_status } = req.body;

  if (!order_status) return res.status(400).json({ error: "Order status is required" });

  const numericId = id.replace("ORD-", "");

  const sql = "UPDATE orders SET order_status = ? WHERE id = ?";
  db.query(sql, [order_status, numericId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// ────────────────────────────────────────────────────────────
//  CUSTOMERS (Admin)
// ────────────────────────────────────────────────────────────

// GET /api/admin/customers
export function getAdminCustomers(req, res) {
  db.query("SELECT * FROM customers ORDER BY id DESC", (err, customers) => {
    if (err) return res.status(500).json({ error: err.message });

    let active = 0;
    let newMonth = 0;
    const now = new Date();
    customers.forEach((c) => {
      if (c.status === "Active") active++;
      if (c.join_date && new Date(c.join_date).getMonth() === now.getMonth()) newMonth++;
      if (c.join_date) c.join_date = new Date(c.join_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      if (c.total_spent) c.total_spent = "$" + Number(c.total_spent).toLocaleString();
    });

    const stats = {
      totalCustomers: customers.length,
      activeCount: active,
      newMonthCount: newMonth,
    };

    res.json({ customers, stats });
  });
}

// POST /api/admin/customers
export function createAdminCustomer(req, res) {
  const { name, email, orders_count, total_spent, join_date, status, initials } = req.body;
  const sql = `INSERT INTO customers (name, email, orders_count, total_spent, join_date, status, initials) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [name, email, Number(orders_count), Number(total_spent), join_date, status, initials];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// PUT /api/admin/customers/:id
export function updateAdminCustomer(req, res) {
  const { name, email, orders_count, total_spent, join_date, status, initials } = req.body;
  const sql = `UPDATE customers SET name=?, email=?, orders_count=?, total_spent=?, join_date=?, status=?, initials=? WHERE id=?`;
  const values = [name, email, Number(orders_count), Number(total_spent), join_date, status, initials, req.params.id];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// DELETE /api/admin/customers/:id
export function deleteAdminCustomer(req, res) {
  db.query("DELETE FROM customers WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// ────────────────────────────────────────────────────────────
//  SETTINGS
// ────────────────────────────────────────────────────────────

// GET /api/admin/settings
export function getSettings(req, res) {
  db.query("SELECT * FROM settings WHERE id=1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
}

// PUT /api/admin/settings
export function updateSettings(req, res) {
  const { store_name, contact_email, phone_number, dark_mode, accent_color, email_alerts_orders, low_stock_alerts } = req.body;
  if (req.auth?.role === "Store Information Admin") {
    return res.status(403).json({ error: "Permission denied for this role" });
  }
  const sql = `UPDATE settings SET store_name=?, contact_email=?, phone_number=?, dark_mode=?, accent_color=?, email_alerts_orders=?, low_stock_alerts=? WHERE id=1`;
  db.query(sql, [store_name, contact_email, phone_number, dark_mode, accent_color, email_alerts_orders, low_stock_alerts], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// ────────────────────────────────────────────────────────────
//  PROFILE
// ────────────────────────────────────────────────────────────

// GET /api/admin/profile
export function getProfile(req, res) {
  db.query("SELECT * FROM admin_profile WHERE id=1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
}

// PUT /api/admin/profile
export function updateProfile(req, res) {
  const { first_name, last_name, email, role } = req.body;
  const name = `${first_name || ""} ${last_name || ""}`.trim();
  db.query("UPDATE admin_profile SET name=?, email=?, role=? WHERE id=1", [name, email, role], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
}

// POST /api/admin/profile/security
export function updateProfileSecurity(req, res) {
  const { currentPassword, newPassword } = req.body;
  db.query("SELECT password FROM admin_profile WHERE id=1", (err, results) => {
    if (results && results.length > 0 && bcrypt.compareSync(currentPassword, results[0].password)) {
      const newHashedPassword = bcrypt.hashSync(newPassword, 10);
      db.query("UPDATE admin_profile SET password=? WHERE id=1", [newHashedPassword], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    } else {
      res.status(401).json({ error: "Incorrect current password" });
    }
  });
}

// POST /api/admin/profile/avatar
export function updateProfileAvatar(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  const avatar_url = `/uploads/${req.file.filename}`;
  db.query("UPDATE admin_profile SET avatar_url=? WHERE id=1", [avatar_url], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, avatar_url });
  });
}
