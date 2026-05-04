import { Router } from "express";
import { getAllProducts, searchProducts, getProductById } from "../controllers/productController.js";

const router = Router();

// Search must be defined before :id to avoid conflicts
router.get("/search", searchProducts);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;
