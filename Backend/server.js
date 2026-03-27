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


//START SERVER
app.listen(5000, () => {

  console.log("Server running on port 5000");
});