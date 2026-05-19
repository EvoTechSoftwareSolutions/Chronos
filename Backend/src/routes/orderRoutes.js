import { Router } from "express";
import express from "express";
import { checkout, getUserOrders, updatePaymentStatus, generatePayhereHash, payhereNotify, deleteUserOrder, getOrderStatus } from "../controllers/orderController.js";

const router = Router();

router.post("/checkout", checkout);
router.get("/api/user/orders", getUserOrders);
router.get("/api/orders/:orderId/status", getOrderStatus);
router.post("/api/orders/update-payment-status", updatePaymentStatus);
router.delete("/api/user/orders/:orderId", deleteUserOrder);
router.post("/generate-payhere-hash", generatePayhereHash);
router.post("/payhere-notify", express.urlencoded({ extended: true }), payhereNotify);

export default router;
