import "dotenv/config";
import db from "./src/config/db.js";
import { initializeSchema } from "./src/models/schema.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

// Connect to database and start server
db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
  } else {
    console.log("MySQL Connected");
    initializeSchema(db);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
