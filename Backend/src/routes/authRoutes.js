import { Router } from "express";
import { register, login, googleRegister, getProfile, updateProfile } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateGoogleRegister } from "../middleware/validate.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google-register", validateGoogleRegister, googleRegister);

router.get("/api/user/profile", getProfile);
router.put("/api/user/profile", updateProfile);

export default router;
