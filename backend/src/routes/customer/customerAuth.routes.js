import express from "express";
import { 
  register, 
  login, 
  getMe, 
  updateMe, 
  checkEmailExists,
  verifyEmailOTP,
  resendOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword
} from "../../controllers/customer/customerAuth.Controller.js";
import authCustomer from "../../middlewares/authCustomer.middleware.js"; 

const router = express.Router();

// ========== PUBLIC ROUTES (không cần auth) ==========

// Đăng ký/Đăng nhập
router.post("/register", register);
router.post("/login", login);

// Kiểm tra email đã tồn tại chưa
router.get("/check-email", checkEmailExists);

// OTP routes cho xác thực email
router.post("/verify-email", verifyEmailOTP);

//Gửi lại mã OTP
router.post("/resend-otp", resendOTP);

// Gửi OTP quên mật khẩu
router.post("/forgot-password/send-otp", sendForgotPasswordOTP);

// Xác thực OTP quên mật khẩu
router.post("/forgot-password/verify-otp", verifyForgotPasswordOTP);

// Đặt lại mật khẩu sau khi xác thực OTP
router.post("/forgot-password/reset", resetPassword);

// ========== PROTECTED ROUTES (cần auth) ==========

router.get("/me", authCustomer, getMe);
router.put("/me", authCustomer, updateMe);  

export default router;