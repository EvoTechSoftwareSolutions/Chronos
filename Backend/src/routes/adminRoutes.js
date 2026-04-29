import { Router } from "express";
import upload from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateAdminLogin,
  validateOrderStatus,
  validateCustomer,
  validateProduct,
  validateSettings,
  validateProfileSecurity,
} from "../middleware/validate.js";
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
router.post("/login", validateAdminLogin, adminLogin);
router.use(requireAuth);

// Dashboard
router.get("/dashboard", getDashboard);

// Products
router.get("/products", getAdminProducts);
router.post("/products", upload.array("images", 5), validateProduct, createAdminProduct);
router.put("/products/:id", upload.array("images", 5), validateProduct, updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

// Orders
router.get("/orders", getAdminOrders);
router.put("/orders/:id", validateOrderStatus, updateAdminOrder);

// Customers
router.get("/customers", getAdminCustomers);
router.post("/customers", validateCustomer, createAdminCustomer);
router.put("/customers/:id", validateCustomer, updateAdminCustomer);
router.delete("/customers/:id", deleteAdminCustomer);

// Settings
router.get("/settings", getSettings);
router.put("/settings", validateSettings, updateSettings);

// Profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/security", validateProfileSecurity, updateProfileSecurity);
router.post("/profile/avatar", upload.single("avatar"), updateProfileAvatar);

export default router;
