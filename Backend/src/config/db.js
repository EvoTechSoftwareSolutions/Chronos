import mysql from "mysql2";

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "chronos_db",
});

// Handle connection errors to prevent server crash (ECONNRESET)
db.on("error", (err) => {
  console.error("Database connection error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
    console.log("Attempting to reconnect or handling reset...");
  } else {
    console.log("Encountered DB error but continuing server operation.");
  }
});

export default db;
