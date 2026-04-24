import { Router } from "express";
import express from "express";
import { checkout, getUserOrders, updatePaymentStatus, generatePayhereHash, payhereNotify } from "../controllers/orderController.js";

const router = Router();

router.post("/checkout", checkout);
router.get("/api/user/orders", getUserOrders);
router.post("/api/orders/update-payment-status", updatePaymentStatus);
router.post("/generate-payhere-hash", generatePayhereHash);
router.post("/payhere-notify", express.urlencoded({ extended: true }), payhereNotify);

export default router;
