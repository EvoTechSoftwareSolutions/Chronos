import { Router } from "express";
import { register, login, googleRegister } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateGoogleRegister } from "../middleware/validate.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google-register", validateGoogleRegister, googleRegister);

export default router;
