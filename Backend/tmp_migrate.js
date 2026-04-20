import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database: "chronos_db",
});

db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
    process.exit(1);
  } else {
    console.log("MySQL Connected");
    
    const queries = [
        "ALTER TABLE orders ADD COLUMN first_name VARCHAR(100)",
        "ALTER TABLE orders ADD COLUMN last_name VARCHAR(100)",
        "ALTER TABLE orders ADD COLUMN address TEXT",
        "ALTER TABLE orders ADD COLUMN mobile VARCHAR(20)",
        "ALTER TABLE orders ADD COLUMN city VARCHAR(100)",
        "ALTER TABLE orders ADD COLUMN province VARCHAR(100)",
        "ALTER TABLE orders ADD COLUMN zip_code VARCHAR(20)"
    ];

    let completed = 0;
    
    queries.forEach((sql) => {
        db.query(sql, (err) => {
            if (err) {
                console.log("Error on query or already exists:", sql, err.message);
            } else {
                console.log("Success:", sql);
            }
            completed++;
            if (completed === queries.length) {
                console.log("Migration complete.");
                process.exit(0);
            }
        });
    });
  }
});
