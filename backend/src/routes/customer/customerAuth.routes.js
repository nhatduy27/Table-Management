import express from "express";
import { 
  register, 
  login, 
  getMe, 
  updateMe, 
  changePassword,
  checkEmailExists,
  verifyEmailOTP,
  resendOTP
} from "../../controllers/customer/customerAuth.Controller.js";
import authCustomer from "../../middlewares/authCustomer.middleware.js"; 

const router = express.Router();

// Public routes (không cần auth)
router.post("/register", register);
router.post("/login", login);
router.get("/check-email", checkEmailExists);

// OTP routes (không cần auth)
router.post("/verify-email", verifyEmailOTP);
router.post("/resend-otp", resendOTP);

// Protected routes (cần auth)
router.get("/me", authCustomer, getMe);
router.put("/me", authCustomer, updateMe);  
router.put("/change-password", authCustomer, changePassword);

export default router;