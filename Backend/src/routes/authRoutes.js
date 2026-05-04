import { Router } from "express";
import { register, login, googleRegister, getProfile, updateProfile, uploadAvatar, updatePassword, getPaymentMethods, addPaymentMethod, deletePaymentMethod } from "../controllers/authController.js";
import { validateRegister, validateLogin, validateGoogleRegister } from "../middleware/validate.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure Multer for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google-register", validateGoogleRegister, googleRegister);

router.get("/api/user/profile", getProfile);
router.put("/api/user/profile", updateProfile);
router.post("/api/user/avatar", upload.single("avatar"), uploadAvatar);
router.put("/api/user/password", updatePassword);

router.get("/api/user/payment-methods", getPaymentMethods);
router.post("/api/user/payment-methods", addPaymentMethod);
router.delete("/api/user/payment-methods/:id", deletePaymentMethod);

export default router;
