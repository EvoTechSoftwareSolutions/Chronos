import { Router } from "express";
import upload from "../middleware/upload.js";
import {
  adminLogin,
  getDashboard,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrder,
  getAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  updateProfileSecurity,
  updateProfileAvatar,
} from "../controllers/adminController.js";

const router = Router();

// Auth
router.post("/login", adminLogin);

// Dashboard
router.get("/dashboard", getDashboard);

// Products
router.get("/products", getAdminProducts);
router.post("/products", upload.array("images", 5), createAdminProduct);
router.put("/products/:id", upload.array("images", 5), updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

// Orders
router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateAdminOrder);

// Customers
router.get("/customers", getAdminCustomers);
router.post("/customers", createAdminCustomer);
router.put("/customers/:id", updateAdminCustomer);
router.delete("/customers/:id", deleteAdminCustomer);

// Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/security", updateProfileSecurity);
router.post("/profile/avatar", upload.single("avatar"), updateProfileAvatar);

export default router;
