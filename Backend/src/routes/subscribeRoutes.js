import { Router } from "express";
import { subscribe } from "../controllers/subscribeController.js";
import { validateSubscribe } from "../middleware/validate.js";

const router = Router();

router.post("/subscribe", validateSubscribe, subscribe);

export default router;
