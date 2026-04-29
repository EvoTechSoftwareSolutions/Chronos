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
