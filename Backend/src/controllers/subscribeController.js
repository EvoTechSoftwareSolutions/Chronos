import db from "../config/db.js";

// POST /subscribe
export function subscribe(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

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
        if (err.code === "ER_DUP_ENTRY") {
          return res.json({ success: false, message: "Email is already subscribed" });
        }
        return res.json({ success: false, message: "Error saving subscription" });
      }
      return res.json({ success: true, message: "Thanks for subscribing!" });
    });
  });
}
