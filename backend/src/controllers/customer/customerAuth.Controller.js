import customerService from "../../services/customer.service.js";
import otpService from "../../services/otp.service.js";  
import customerValidator from "../../validators/customer.validator.js";
import Customer from "../../models/customer.js";

// --- REGISTER ---
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

// --- LOGIN ---
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

export const sendForgotPasswordOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập email"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Email không hợp lệ"
            });
        }

        const result = await customerService.sendForgotPasswordOTP(email);

        return res.json({
            success: true,
            message: result.message || "Mã OTP đã được gửi đến email của bạn",
            data: {
                email: result.email
            }
        });
    } catch (error) {
        console.error("Send forgot password OTP error:", error);
        
        return res.status(400).json({
            success: false,
            error: error.message || "Không thể gửi OTP"
        });
    }
};

// --- XÁC THỰC OTP QUÊN MẬT KHẨU ---
export const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập email và mã OTP"
            });
        }

        // Validate OTP format (6 số)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                error: "Mã OTP phải gồm 6 chữ số"
            });
        }

        const result = await customerService.verifyForgotPasswordOTP(email, otp);

        return res.json({
            success: true,
            message: result.message || "Xác thực OTP thành công",
            data: {
                email: result.email,
                // Có thể tạo một token tạm thời cho bước tiếp theo
                resetToken: Buffer.from(`${email}:${otp}:${Date.now()}`).toString('base64')
            }
        });
    } catch (error) {
        console.error("Verify forgot password OTP error:", error);
        
        return res.status(400).json({
            success: false,
            error: error.message || "Xác thực OTP thất bại"
        });
    }
};

// --- ĐẶT LẠI MẬT KHẨU  ---
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        // Validate password
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Mật khẩu phải có ít nhất 6 ký tự"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: "Mật khẩu xác nhận không khớp"
            });
        }

        // Xác thực OTP trước 
        try {
            await customerService.verifyForgotPasswordOTP(email, otp);
        } catch (otpError) {
            return res.status(400).json({
                success: false,
                error: "Mã OTP không hợp lệ hoặc đã hết hạn"
            });
        }

        // Đặt lại mật khẩu mới 
        const result = await customerService.resetPasswordWithoutOld(email, newPassword);

        return res.json({
            success: true,
            message: result.message || "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        
        return res.status(400).json({
            success: false,
            error: error.message || "Không thể đặt lại mật khẩu"
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

// --- UPDATE PROFILE ---
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



// --- CHECK EMAIL EXISTS ---
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

// --- VERIFY EMAIL OTP ---
export const verifyEmailOTP = async (req, res) => {
  try {
    const { customerId, email, otp } = req.body;

    if (!customerId || !email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin xác thực"
      });
    }

    // SỬA: Gọi OTP service thay vì customer service
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

// --- RESEND OTP ---
export const resendOTP = async (req, res) => {
  try {
    const { customerId, email } = req.body;

    if (!customerId || !email) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin"
      });
    }

    // Gọi OTP service thay vì customer service
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


export const sendOtpResetPassword = async(req, res) => {

  try{




  } catch(error) {

    
  }

};