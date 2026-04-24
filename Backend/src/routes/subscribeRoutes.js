import { Router } from "express";
import { subscribe } from "../controllers/subscribeController.js";

const router = Router();

router.post("/subscribe", subscribe);

export default router;
