import Customer from "../models/customer.js"; 
import VerifiedEmail from "../models/verifiedEmail.js";
import jwt from "jsonwebtoken";
import OTPService from "./otp.service.js";
import emailService from "./email.service.js";
import { Op } from 'sequelize';

class CustomerService {

    // Tạo token với uid
    generateAccessToken(customer){
        return jwt.sign(
            {
                uid: customer.uid,        
                username: customer.username,
                email: customer.email,
                role: "customer"
            },
            process.env.JWT_SECRET || "customer-token-secret",
            { expiresIn: "24h" }
        );
    }

    verifyToken(token){
        try{
            return jwt.verify(token, process.env.JWT_SECRET || "customer-token-secret");
        }catch(error){
            throw new Error("Token không hợp lệ");
        } 
    }

    // Đăng ký với OTP
    async register(username, email, password, auth_method){
        const existAccount = await Customer.findOne({
            where: { email: email }
        });

        if(existAccount){
            throw new Error("Email đã được sử dụng");
        }

        // Tạo customer
        const customer = await Customer.create({username, email, password, auth_method});
        
        // Tạo OTP và gửi email
        try {
            const otp = OTPService.generateOTP();
            const otpExpires = new Date(Date.now() + 2 * 60 * 1000);
            
            await VerifiedEmail.create({
                customer_uid: customer.uid,
                email: customer.email,
                auth_method : customer.auth_method,
                otp_code: otp,
                otp_expires: otpExpires,
                is_verified: false
            });

            // Gửi email OTP
            await emailService.sendOTPEmail(email, otp, username);
            
        } catch (emailError) {
            console.error("Không thể gửi email OTP:", emailError);
            // Vẫn tạo customer nhưng log lỗi email
            if (process.env.NODE_ENV === 'production') {
                throw new Error("Không thể gửi email xác thực. Vui lòng thử lại sau.");
            }
        }

        const accessToken = this.generateAccessToken(customer);

        return {
            customer, 
            accessToken,
            needsVerification: true,
            message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực."
        };
    }

    async syncGoogleUser(username, email, auth_method) {
        try {
            
            // 1. Tìm customer hiện có
            let customer = await Customer.findOne({
                where: { 
                    email: email.toLowerCase(),
                    auth_method: auth_method,
                }
            });
            console.log('[DEBUG] Customer found:', customer ? customer.uid : 'Not found');

            if (customer) {
                // Cập nhật username nếu có thay đổi
                if (username && username !== customer.username) {
                    console.log('Đã đăng nhâp trước đó');
                }
            } else {
                console.log('[DEBUG] Creating new Google user');
                // Tạo password tạm cho Google user
                const tempPassword = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                // Tạo customer mới
                customer = await Customer.create({
                    username: username || email.split('@')[0], // Fallback nếu không có username
                    password: tempPassword,
                    email: email.toLowerCase(),
                    auth_method: auth_method
                });
                console.log('[DEBUG] Customer created:', customer.uid);

                // Tạo VerifiedEmail record
                try {
                    const verifiedEmailData = {
                        customer_uid: customer.uid,
                        email: customer.email,
                        auth_method: customer.auth_method,
                        otp_code: null,
                        otp_expires: null,
                        is_verified: true
                    };
                    
                    console.log('[DEBUG] Creating VerifiedEmail with data:', verifiedEmailData);
                    const verifiedEmail = await VerifiedEmail.create(verifiedEmailData);
                    console.log('[DEBUG] VerifiedEmail created:', verifiedEmail.id);
                } catch (verifiedEmailError) {
                    console.error('[DEBUG] VerifiedEmail creation error:', verifiedEmailError);
                    console.error('[DEBUG] VerifiedEmail error details:', {
                        message: verifiedEmailError.message,
                        errors: verifiedEmailError.errors,
                        stack: verifiedEmailError.stack
                    });
                    // Tiếp tục dù có lỗi VerifiedEmail
                }
            }

            // Tạo token
            const accessToken = this.generateAccessToken(customer);
            console.log('[DEBUG] Access token generated for customer:', customer.uid);

            return {
                customer,
                accessToken
            };

        } catch (error) {
            console.error('[DEBUG] syncGoogleUser ERROR:', {
                error: error.message,
                errors: error.errors, // Sequelize validation errors
                stack: error.stack,
                input: { username, email, auth_method }
            });
            
            // Ném lại lỗi để xử lý ở controller
            throw error;
        }
    }

    // Đăng nhập - kiểm tra email đã verify chưa
    async login(email,  password, auth_method = 'email'){
        const customer = await Customer.findOne({
            where: { 
                email: email,
                auth_method : auth_method
             }
        })

        if(!customer){
            throw new Error("Email chưa được đăng ký");
        }

        const isValid = await customer.comparePassword(password);
        if(!isValid) {
            throw new Error("Sai mật khẩu hoặc email");
        }

        
        const verifiedEmail = await VerifiedEmail.findOne({
            where: {
                customer_uid: customer.uid,
                email: customer.email,
                auth_method : customer.auth_method,
                is_verified: true
            }
        });

        // Nếu chưa verified, trả về thông tin để redirect
        if (!verifiedEmail) {
            const activeOTP = await VerifiedEmail.findOne({
                where: {
                    customer_uid: customer.uid,
                    email: customer.email,
                    is_verified: false,
                    otp_expires: {
                        $gt: new Date()
                    }
                }
            });

            // Nếu không có OTP active, tạo mới và gửi email
            if (!activeOTP) {
                const otp = OTPService.generateOTP();
                const otpExpires = new Date(Date.now() + 2 * 60 * 1000);
                
                await VerifiedEmail.create({
                    customer_uid: customer.uid,
                    email: customer.email,
                    otp_code: otp,
                    otp_expires: otpExpires,
                    is_verified: false
                });

                await emailService.sendOTPEmail(customer.email, otp, customer.username);
            }
            throw new Error("EMAIL_NOT_VERIFIED");
        }

        const accessToken = this.generateAccessToken(customer);
        return { 
            customer, 
            accessToken,
            isEmailVerified: true 
        };
    }

    async sendForgotPasswordOTP(email) {
        try {
            const verificationRecord = await VerifiedEmail.findOne({
                where: {
                    email: email
                },
                order: [['created_at', 'DESC']]
            });

            if(!verificationRecord){
                throw new Error("Email chưa được đăng ký");
            }

            
            // Tạo OTP
            const otp = OTPService.generateOTP();
            const otpExpires = new Date(Date.now() + 2 * 60 * 1000); 

            // Lưu OTP vào database
            verificationRecord.is_verified = true;
            verificationRecord.otp_code = otp;
            verificationRecord.otp_expires = otpExpires;
            await verificationRecord.save();

            // Gửi email
            await emailService.sendOTPEmail(email, otp, "");

            return {
                success: true,
                message: "Mã OTP đã được gửi đến email của bạn",
                email: email
            };
        } catch (error) {
            console.error("Send forgot password OTP error:", error);
            throw error;
        }
    }   

    async verifyForgotPasswordOTP(email, otp) {
        try {
            const verificationRecord = await VerifiedEmail.findOne({ 
            where: { 
                email,
                otp_code: otp,
            }
            });

            if (!verificationRecord) {
                throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
            }

            //Kiểm tra hạn của mã 
            if (verificationRecord.otp_expires < new Date()) {
                throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            }

            return {
                success: true,
                message: "Xác thực OTP thành công",
                email: email
            };
        } catch (error) {
            console.error("Verify forgot password OTP error:", error);
            throw error;
        }
    }

    // Thêm vào class CustomerService

    // Cập nhật thông tin customer (chỉ username và phone)

    async updateCustomerProfile(uid, updateData) {
        try {
            const customer = await Customer.findByPk(uid);
            if (!customer) throw new Error("Không tìm thấy tài khoản");

            // Chỉ lấy các trường được phép cập nhật
            const allowedUpdates = {};
            
            // Kiểm tra và xử lý username
            if (updateData.username !== undefined) {
                // Trim và validate
                const newUsername = updateData.username.trim();
                
                if (newUsername !== customer.username) {
                    // SỬA LỖI Ở ĐÂY: Thay $ne bằng Op.ne
                    const exists = await Customer.findOne({ 
                        where: { 
                            username: newUsername,
                            uid: { [Op.ne]: uid } // SỬA: $ne → [Op.ne]
                        } 
                    });
                    if (exists) throw new Error("Username đã tồn tại");
                    
                    if (newUsername.length < 3 || newUsername.length > 30) {
                        throw new Error("Username phải từ 3-30 ký tự");
                    }
                    
                    allowedUpdates.username = newUsername;
                }
            }

            // Kiểm tra và xử lý phone
            if (updateData.phone !== undefined) {
                const newPhone = updateData.phone.trim();
                
                if (newPhone !== customer.phone) {
                    // Validate định dạng số điện thoại
                    const phoneRegex = /^[0-9]+$/;
                    if (!phoneRegex.test(newPhone)) {
                        throw new Error("Số điện thoại chỉ được chứa chữ số");
                    }
                    
                    if (newPhone.length !== 10) {
                        throw new Error("Số điện thoại phải có đúng 10 chữ số");
                    }
                    
        
                    
                    allowedUpdates.phone = newPhone;
                }
            }

            // Nếu không có gì để cập nhật
            if (Object.keys(allowedUpdates).length === 0) {
                throw new Error("Không có thông tin nào để cập nhật");
            }

            // Thực hiện cập nhật
            await customer.update(allowedUpdates);
            
            // Lấy lại thông tin đã cập nhật (loại bỏ password)
            const updatedCustomer = await Customer.findByPk(uid, {
                attributes: { exclude: ['password'] }
            });

            return {
                success: true,
                message: "Cập nhật thông tin thành công",
                customer: updatedCustomer
            };
            
        } catch (error) {
            console.error("Update customer profile error:", error);
            throw error;
        }
    }

    // Đổi mật khẩu (cần password cũ)
    async changePassword(uid, oldPassword, newPassword) {
        try {
            const customer = await Customer.findByPk(uid);
            if (!customer) throw new Error("Không tìm thấy tài khoản");

            // Kiểm tra mật khẩu cũ
            const isValid = await customer.comparePassword(oldPassword);
            if (!isValid) {
                throw new Error("Mật khẩu cũ không đúng");
            }

            // Không cho đổi cùng mật khẩu cũ
            if (oldPassword === newPassword) {
                throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
            }

            // Validate độ dài mật khẩu mới
            if (newPassword.length < 6) {
                throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
            }

            // Cập nhật mật khẩu
            customer.password = newPassword;
            await customer.save();

            return {
                success: true,
                message: "Đổi mật khẩu thành công"
            };
            
        } catch (error) {
            console.error("Change password error:", error);
            throw error;
        }
    }

   
    async updateAvatar(uid, avatarUrl) {
        try {
            const customer = await Customer.findByPk(uid);
            if (!customer) throw new Error("Không tìm thấy tài khoản");

            // Validate URL (có thể thêm logic validate image URL)
            if (!avatarUrl || typeof avatarUrl !== 'string') {
                throw new Error("URL avatar không hợp lệ");
            }

            // Cập nhật avatar
            await customer.update({ avatar: avatarUrl });
            
            return {
                success: true,
                message: "Cập nhật ảnh đại diện thành công",
                avatarUrl: avatarUrl
            };
            
        } catch (error) {
            console.error("Update avatar error:", error);
            throw error;
        }
    }

    async deleteAvatar(uid) {
        try {
            const customer = await Customer.findByPk(uid);
            if (!customer) throw new Error("Không tìm thấy tài khoản");

            // Lưu avatar cũ để xóa trên Cloudinary (nếu muốn)
                const oldAvatar = customer.avatar;
                
                // Xóa avatar (set thành null)
                await customer.update({ avatar: null });
                
                // TODO: Nếu muốn xóa ảnh trên Cloudinary
                // if (oldAvatar && oldAvatar.includes('cloudinary.com')) {
                //   await deleteFromCloudinary(oldAvatar);
                // }
            
            return {
                success: true,
                message: "Xóa ảnh đại diện thành công",
                data: {
                    avatar: null
                }
            };
            
        } catch (error) {
            console.error("Delete avatar error:", error);
            throw error;
        }
    }


    async resetPasswordWithoutOld(email, newPassword) {
        try {
            
            const customer = await Customer.findOne({
                where: { email }
            });

            if (!customer) {
                throw new Error("Tài khoản không tồn tại");
            }

            await customer.update({ password: newPassword });
            
            return {
                success: true,
                message: "Đặt lại mật khẩu thành công"
            };
        } catch (error) {
            console.error("Reset password without old error:", error);
            throw error;
        }
    }

    // Lấy thông tin khách hàng bằng uid
    async getCustomer(uid){  // NHỚ: parameter là uid
        const customer = await Customer.findByPk(uid, {
            attributes: { exclude: ["password"] } 
        })

        if(!customer) throw new Error("Tài khoản không tồn tại");
        return customer;
    }

    // Lấy customer bằng uid và email
    async getCustomerByUid(uid) {
        const customer = await Customer.findByPk(uid, {
            attributes: { exclude: ["password"] } 
        });
        
        if(!customer) throw new Error("Không tìm thấy tài khoản");
        return customer;
    }

    // Cập nhật thông tin bằng uid
    async updateCustomer(uid, updateData){  // NHỚ: parameter là uid
        const customer = await Customer.findByPk(uid);
        if(!customer) throw new Error("Không tìm thấy tài khoản");

        if(updateData.username && updateData.username !== customer.username){
            const exists = await Customer.findOne({ 
                where: { username: updateData.username } 
            });
            if (exists) throw new Error("Username đã tồn tại");
        }

        if (updateData.email && updateData.email !== customer.email) {
            const exists = await Customer.findOne({ 
                where: { email: updateData.email } 
            });
            if (exists) throw new Error("Email đã được sử dụng");
        }

        // Nếu thay đổi email, cần verify lại
        if (updateData.email && updateData.email !== customer.email) {
            // Tạo OTP cho email mới
            const otp = OTPService.generateOTP();
            const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
            
            await VerifiedEmail.create({
                customer_uid: customer.uid,
                email: updateData.email,
                otp_code: otp,
                otp_expires: otpExpires,
                is_verified: false
            });

            await emailService.sendOTPEmail(updateData.email, otp, customer.username);
            
            // Đánh dấu email cũ là không verified
            await VerifiedEmail.update(
                { is_verified: false },
                { 
                    where: { 
                        customer_uid: customer.uid,
                        email: customer.email 
                    } 
                }
            );
        }

        await customer.update(updateData);
        return customer;
    }

    // Kiểm tra email tồn tại
    async checkEmailExists(email, auth_method = 'email') {
        const customer = await Customer.findOne({
            where: { 
                email: email,
                auth_method : auth_method
             }
        });
        return {
            exists: !!customer,
            email: email
        };
    }

    // Xác thực OTP
    async verifyEmailOTP(customerId, email, otp, auth_method = 'email') {
        const customer = await Customer.findOne({
            where: { 
                uid: customerId,
                email: email,
                auth_method : auth_method
            }
        });

        if (!customer) {
            throw new Error("Không tìm thấy tài khoản");
        }

        // Tìm OTP record mới nhất
        const verificationRecord = await VerifiedEmail.findOne({
            where: {
                customer_uid: customerId,
                email: email,
                auth_method : auth_method,
                is_verified: false
            },
            order: [['created_at', 'DESC']]
        });

        if (!verificationRecord) {
            throw new Error("Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.");
        }

        // Kiểm tra OTP hết hạn
        if (verificationRecord.otp_expires < new Date()) {
            throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        // Kiểm tra OTP có đúng không
        if (verificationRecord.otp_code !== otp) {
            throw new Error("Mã OTP không đúng");
        }

        // Xác thực thành công
        verificationRecord.is_verified = true;
        verificationRecord.verified_at = new Date();
        verificationRecord.otp_code = null;
        verificationRecord.otp_expires = null;
        await verificationRecord.save();

        // Gửi email thông báo thành công
        await emailService.sendVerificationSuccessEmail(email, customer.username);

        return {
            success: true,
            customer: {
                uid: customer.uid,
                username: customer.username,
                email: customer.email,
                isEmailVerified: true
            }
        };
    }

    // Gửi lại OTP
    async resendOTP(customerId, email) {
        const customer = await Customer.findOne({
            where: { 
                uid: customerId,
                email: email 
            }
        });

        if (!customer) {
            throw new Error("Không tìm thấy tài khoản");
        }

        // Kiểm tra email đã verified chưa
        const isVerified = await VerifiedEmail.findOne({
            where: {
                customer_uid: customerId,
                email: email,
                is_verified: true
            }
        });

        if (isVerified) {
            throw new Error("Email này đã được xác thực rồi.");
        }

        // Tạo OTP mới
        const otp = OTPService.generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        // Tạo record OTP mới
        await VerifiedEmail.create({
            customer_uid: customerId,
            email: email,
            otp_code: otp,
            otp_expires: otpExpires,
            is_verified: false
        });

        // Gửi email
        await emailService.sendRegistrationOTP(email, otp, customer.username);

        return {
            success: true,
            otpExpires: otpExpires,
            message: "Đã gửi lại mã OTP"
        };
    }
}

export default new CustomerService();