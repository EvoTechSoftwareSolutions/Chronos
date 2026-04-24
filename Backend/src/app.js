import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Direct controller import for the special featured-reviews route
import { getFeaturedReviews } from "./controllers/reviewController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Global Middleware ───────────────────────────────────────
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Static file serving
app.use("/uploads", express.static(uploadsDir));
app.use("/uploads", express.static(path.join(__dirname, "../../Admin Panel/backend/public/uploads")));

// ── Route Mounting ──────────────────────────────────────────
// Auth routes (top-level: /register, /login, /google-register)
app.use("/", authRoutes);

// Product routes (/api/products/*)
app.use("/api/products", productRoutes);

// Order routes (top-level: /checkout, /generate-payhere-hash, etc.)
app.use("/", orderRoutes);

// Subscribe route (/subscribe)
app.use("/", subscribeRoutes);

// Review routes (/api/reviews/*)
app.use("/api/reviews", reviewRoutes);

// Featured reviews (separate path — not under /api/reviews prefix)
app.get("/api/reviews-featured", getFeaturedReviews);

// Admin routes (/api/admin/*)
app.use("/api/admin", adminRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`Resource NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Resource not found" });
});

export default app;
