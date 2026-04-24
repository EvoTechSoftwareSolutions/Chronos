import { Router } from "express";
import { register, login, googleRegister } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-register", googleRegister);

export default router;
