import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";

// POST /register
export function register(req, res) {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const account_id = "ACC-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const sql = "INSERT INTO users (account_id, name, email, password) VALUES (?, ?, ?, ?)";

  db.query(sql, [account_id, name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return res.json({ success: false, message: "Email already exists" });
      return res.json({ success: false, message: "Error saving data" });
    }

    // Also update Customers page of admin panel
    const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
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
}

// POST /login
export function login(req, res) {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (result.length > 0) {
      const user = result[0];

      // Check if account is active
      if (user.is_active === 0) {
        return res.json({ success: false, message: "Your account has been deactivated. Please contact support." });
      }

      const isMatch = bcrypt.compareSync(password, user.password || "");
      if (isMatch) {
        return res.json({
          success: true,
          user: {
            name: user.name,
            email: user.email,
            account_id: user.account_id,
            avatar: user.avatar,
          },
        });
      }
    }
    return res.json({ success: false, message: "Invalid email or password" });
  });
}

// POST /google-register
export function googleRegister(req, res) {
  const { name, email, password } = req.body;
  const account_id = "ACC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const generatedPassword = password || crypto.randomBytes(12).toString("hex");
  const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

  const sql = "INSERT INTO users (account_id, name, email, password) VALUES (?, ?, ?, ?)";

  db.query(sql, [account_id, name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.json({ success: true });
      }
      return res.json({ success: false });
    }

    // Also add to customers
    const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
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
}

// GET /api/user/profile
export function getProfile(req, res) {
  const { email } = req.query;
  if (!email) return res.json({ success: false, message: "Email required" });
  
  db.query("SELECT name, email, phone, address, city, zip_code, avatar, is_active FROM users WHERE email = ?", [email], (err, result) => {
    if (err || result.length === 0) return res.json({ success: false, message: "User not found" });
    if (result[0].is_active === 0) {
      return res.json({ success: false, isDeactivated: true, message: "Your account has been deactivated." });
    }
    return res.json({ success: true, user: result[0] });
  });
}

// PUT /api/user/profile
export function updateProfile(req, res) {
  const { email, name, phone, address, city, zip_code } = req.body;
  if (!email) return res.json({ success: false, message: "Email required" });

  const sql = "UPDATE users SET name = ?, phone = ?, address = ?, city = ?, zip_code = ? WHERE email = ?";
  db.query(sql, [name, phone, address, city, zip_code, email], (err) => {
    if (err) return res.json({ success: false, message: "Failed to update profile" });
    return res.json({ success: true, message: "Profile updated successfully" });
  });
}

// POST /api/user/avatar
export function uploadAvatar(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  
  db.query("UPDATE users SET avatar = ? WHERE email = ?", [avatarUrl, email], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Database update failed" });
    
    // Also update customer profile in admin panel if exists
    db.query("UPDATE customers SET initials = ? WHERE email = ?", [avatarUrl, email]); 

    res.json({ success: true, avatar_url: avatarUrl });
  });
}

// PUT /api/user/password
export function updatePassword(req, res) {
  const { email, currentPassword, newPassword } = req.body;
  
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  db.query("SELECT password FROM users WHERE email = ?", [email], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    const user = result[0];
    const isMatch = bcrypt.compareSync(currentPassword, user.password || "");

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, message: "Failed to update password" });
      res.json({ success: true, message: "Password updated successfully" });
    });
  });
}

// GET /api/user/payment-methods
export function getPaymentMethods(req, res) {
  const { email } = req.query;
  if (!email) return res.json({ success: false, message: "Email required" });

  db.query("SELECT id, card_type, card_last_four, expiry FROM payment_methods WHERE user_email = ? ORDER BY created_at DESC", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, paymentMethods: results });
  });
}

// POST /api/user/payment-methods
export function addPaymentMethod(req, res) {
  const { email, cardNumber, expiry, cardType } = req.body;
  if (!email || !cardNumber || !expiry) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const lastFour = cardNumber.slice(-4);
  const type = cardType || (cardNumber.startsWith('4') ? 'Visa' : 'Mastercard'); // Simple logic

  db.query("INSERT INTO payment_methods (user_email, card_type, card_last_four, expiry) VALUES (?, ?, ?, ?)", [email, type, lastFour, expiry], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to save payment method" });
    res.json({ success: true, message: "Payment method added", methodId: result.insertId });
  });
}

// DELETE /api/user/payment-methods/:id
export function deletePaymentMethod(req, res) {
  const { id } = req.params;
  const { email } = req.query; // to ensure the user owns it

  db.query("DELETE FROM payment_methods WHERE id = ? AND user_email = ?", [id, email], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete payment method" });
    res.json({ success: true, message: "Payment method removed" });
  });
}
