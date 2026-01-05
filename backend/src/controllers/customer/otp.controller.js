import otpService from "../../services/otp.service.js";
import otpValidator from "../../validators/otp.validator.js";

export const otpController = {
  // 1. VERIFY EMAIL OTP
  async verifyEmailOTP(req, res) {
    try {
      const { error } = otpValidator.verifyEmail.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { customerId, email, otp } = req.body;

      console.log("🔍 Verify OTP request:", { customerId, email });

      const result = await otpService.verifyOTP(customerId, email, otp);

      return res.json({
        success: true,
        message: "Xác thực email thành công!",
        data: {
          customer: {
            uid: result.customer.uid,
            username: result.customer.username,
            email: result.customer.email,
            isEmailVerified: true
          },
          verifiedAt: result.verifiedAt
        }
      });

    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Xác thực OTP thất bại"
      });
    }
  },

  // 2. RESEND OTP
  async resendOTP(req, res) {
    try {
      const { error } = otpValidator.resendOTP.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { customerId, email } = req.body;

      console.log("🔄 Resend OTP request:", { customerId, email });

      const result = await otpService.resendOTP(customerId, email);

      return res.json({
        success: true,
        message: result.message,
        data: {
          otpExpires: result.otpExpires
        }
      });

    } catch (error) {
      console.error("Resend OTP error:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Không thể gửi lại OTP"
      });
    }
  },

  // 3. CHECK VERIFICATION STATUS
  async checkVerificationStatus(req, res) {
    try {
      const { customerId, email } = req.query;

      if (!customerId || !email) {
        return res.status(400).json({
          success: false,
          error: "Thiếu thông tin customerId hoặc email"
        });
      }

      const result = await otpService.checkVerificationStatus(customerId, email);

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error("Check verification error:", error);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi kiểm tra trạng thái xác thực"
      });
    }
  }
};