import customerService from "../../services/customer.service.js";
import otpService from "../../services/otp.service.js";  // ✅ IMPORT OTP SERVICE
import customerValidator from "../../validators/customer.validator.js";
import Customer from "../../models/customer.js";

// --- 1. REGISTER ---
export const register = async (req, res) => {
  try {
    const { error } = customerValidator.register.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { username, email, password } = req.body;
    const result = await customerService.register(username, email, password);

    const customerData = result.customer.toJSON();
    delete customerData.password;

    // Chuẩn hóa response
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
      data: {
        customer: {
          uid: customerData.uid,
          username: customerData.username,
          email: customerData.email,
          isEmailVerified: false
        },
        accessToken: result.accessToken,
        needsVerification: true
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// --- 2. LOGIN ---
export const login = async (req, res) => {
  try {
    const { error } = customerValidator.login.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, password } = req.body;
    
    try {
      // Thử login
      const result = await customerService.login(email, password);

      const customerData = result.customer.toJSON();
      delete customerData.password;

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          customer: customerData,
          accessToken: result.accessToken,
          isEmailVerified: true
        }
      });
      
    } catch (loginError) {
      // Xử lý trường hợp chưa verify email
      if (loginError.message === "EMAIL_NOT_VERIFIED") {
        // Tìm customer để lấy thông tin
        const customer = await Customer.findOne({
          where: { email: email }
        });

        if (customer) {
          return res.status(200).json({
            success: false,
            needsVerification: true,
            message: "Vui lòng xác thực email trước khi đăng nhập",
            data: {
              customerId: customer.uid,
              email: customer.email,
              username: customer.username
            }
          });
        }
      }
      
      // Nếu là lỗi khác, throw lại
      throw loginError;
    }

  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({ 
      success: false,
      error: error.message || "Đăng nhập thất bại"
    });
  }
};

// --- 3. GET CUSTOMER PROFILE ---
export const getMe = async (req, res) => {
  try {
    const uid = req.user?.uid;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false,
        error: "Không tìm thấy thông tin người dùng trong request" 
      });
    }
    
    const customer = await customerService.getCustomer(uid);

    const customerData = customer.toJSON ? customer.toJSON() : customer;
    
    return res.status(200).json({
      success: true,
      data: {
        customer: {
          uid: customerData.uid,
          username: customerData.username,
          email: customerData.email,
          fullName: customerData.fullName || null,
          phone: customerData.phone || null,
          address: customerData.address || null,
          dateOfBirth: customerData.dateOfBirth || null,
          createdAt: customerData.createdAt,
          updatedAt: customerData.updatedAt
        }
      }
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(404).json({ 
      success: false,
      error: error.message || "Không thể lấy thông tin" 
    });
  }
};

// --- 4. UPDATE PROFILE ---
export const updateMe = async (req, res) => {
  try {
    const uid = req.user?.uid;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false,
        error: "Không tìm thấy thông tin người dùng" 
      });
    }

    const { error } = customerValidator.update.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }

    const updatedCustomer = await customerService.updateCustomer(uid, req.body);

    const customerData = updatedCustomer.toJSON();
    delete customerData.password;

    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: {
        customer: customerData
      }
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// --- 5. CHANGE PASSWORD ---
export const changePassword = async (req, res) => {
  try {
    const uid = req.user?.uid;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false,
        error: "Không tìm thấy thông tin người dùng" 
      });
    }

    const { error } = customerValidator.changePassword.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }

    const { oldPassword, newPassword } = req.body;
    await customerService.changePassword(uid, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: "Thay đổi mật khẩu thành công"
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// --- 6. CHECK EMAIL EXISTS ---
export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Thiếu email"
      });
    }

    const result = await customerService.checkEmailExists(email);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Check email error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi khi kiểm tra email"
    });
  }
};

// --- 7. VERIFY EMAIL OTP ---
export const verifyEmailOTP = async (req, res) => {
  try {
    const { customerId, email, otp } = req.body;

    if (!customerId || !email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin xác thực"
      });
    }

    // ✅ SỬA: Gọi OTP service thay vì customer service
    const result = await otpService.verifyOTP(customerId, email, otp);

    return res.json({
      success: true,
      message: "Xác thực email thành công!",
      data: result
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Xác thực thất bại"
    });
  }
};

// --- 8. RESEND OTP ---
export const resendOTP = async (req, res) => {
  try {
    const { customerId, email } = req.body;

    if (!customerId || !email) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin"
      });
    }

    // ✅ SỬA: Gọi OTP service thay vì customer service
    const result = await otpService.resendOTP(customerId, email);

    return res.json({
      success: true,
      message: result.message || "Đã gửi lại mã OTP",
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
};