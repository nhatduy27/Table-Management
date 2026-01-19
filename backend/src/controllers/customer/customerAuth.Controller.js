import customerService from "../../services/customer.service.js";
import otpService from "../../services/otp.service.js";  
import customerValidator from "../../validators/customer.validator.js";
import Customer from "../../models/customer.js";
import { uploadBufferToCloudinary } from "../../../utils/cloudinary.js";

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
    const auth_method = 'email'
    const result = await customerService.register(username, email, password, auth_method);

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
          phone : customerData.phone || null,
          avatar: customerData.avatar || null,
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


// --- SYNC GOOGLE USER ---
export const syncGoogleUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Validate input cơ bản
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email là bắt buộc"
      });
    }

    const auth_method = 'google'
    // Gọi service để xử lý logic đồng bộ
    const result = await customerService.syncGoogleUser(
      username || email.split('@')[0],
      email,
      auth_method
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Google thành công",
      data: {
        customer: {
          username: result.customer.username,
          email: result.customer.email,
          phone : result.customer.phone || null,
          avatar: result.customer.avatar || null,
        },
        accessToken: result.accessToken
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: error.message || "Không thể đồng bộ với Google"
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
      
      const result = await customerService.login(email, password);

      const customerData = result.customer.toJSON();
      delete customerData.password;

      console.log("Customer data from login:", customerData);
      console.log("Phone field exists:", 'phone' in customerData);
      console.log("Phone value:", customerData.phone);

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

export const updateProfile = async (req, res) => {
  try {
    const uid = req.customer?.uid || req.user?.uid;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false,
        error: "Không tìm thấy thông tin người dùng" 
      });
    }

    // Validate chỉ username và phone
    const { error } = customerValidator.update.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }

    // Kiểm tra có trường không được phép không
    const allowedFields = ['username', 'phone'];
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Chỉ được phép cập nhật username và phone. Trường không hợp lệ: ${invalidFields.join(', ')}`
      });
    }

    const result = await customerService.updateCustomerProfile(uid, req.body);

    return res.status(200).json({
      success: true,
      message: result.message || "Cập nhật thông tin thành công",
      data: {
        customer: result.customer
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};


export const deleteAvatar = async (req, res) => {
  try {
    const customerId = req.user?.uid || req.user?.id;
    
    if (!customerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Không tìm thấy thông tin người dùng" 
      });
    }

    // Gọi service để xóa avatar
    const result = await customerService.deleteAvatar(customerId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error('Delete avatar error:', error);
    
    // Phân loại lỗi
    let statusCode = 500;
    let errorMessage = "Lỗi server khi xóa avatar";
    
    if (error.message.includes('Không tìm thấy')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes('Cloudinary') || error.message.includes('upload')) {
      errorMessage = "Lỗi khi xóa ảnh trên Cloudinary";
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// --- CHANGE PASSWORD ---
export const changePassword = async (req, res) => {
  try {
    const uid = req.customer?.uid || req.user?.uid;
    
    if (!uid) {
      return res.status(401).json({ 
        success: false,
        error: "Không tìm thấy thông tin người dùng" 
      });
    }

    // Validate input
    const { error } = customerValidator.changePassword.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }

    const { oldPassword, newPassword } = req.body;

    const result = await customerService.changePassword(uid, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: result.message || "Đổi mật khẩu thành công"
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// --- UPDATE AVATAR ---
export const updateAvatar = async (req, res) => {
  try {
    // Lấy customer ID từ middleware auth
     const customerId = req.user?.uid || req.user?.id;
    
    if (!customerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Không tìm thấy thông tin người dùng" 
      });
    }

    // Kiểm tra có file upload không
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng chọn ảnh đại diện" 
      });
    }

    // Tìm customer
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const file = req.file;
    const timestamp = Date.now();
    const filename = `avatar_${customerId}_${timestamp}`;
    const folder = 'restaurant/customer-avatars';

    console.log('Uploading avatar to Cloudinary:', {
      customerId,
      originalname: file.originalname,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    // Upload lên Cloudinary
    const avatarUrl = await uploadBufferToCloudinary(
      file.buffer,
      folder,
      filename,
      {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:best',
        format: 'webp'
      }
    );

    // Cập nhật vào database
    customer.avatar = avatarUrl;
    await customer.save();

    console.log('Avatar updated successfully:', avatarUrl);

    // Trả về response
    return res.status(200).json({
      success: true,
      message: "Cập nhật ảnh thành công",
      data: {
        avatar: avatarUrl
      }
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật avatar",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
          avatar: customerData.avatar || null,
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