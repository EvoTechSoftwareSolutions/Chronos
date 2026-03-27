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


//START SERVER
app.listen(5000, () => {

  console.log("Server running on port 5000");
});