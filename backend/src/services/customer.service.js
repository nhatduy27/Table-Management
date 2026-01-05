import Customer from "../models/customer.js"; 
import VerifiedEmail from "../models/verifiedEmail.js";
import jwt from "jsonwebtoken";
import OTPService from "./otp.service.js";
import emailService from "./email.service.js";

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
    async register(username, email, password){
        const existAccount = await Customer.findOne({
            where: { email: email }
        });

        if(existAccount){
            throw new Error("Email đã được sử dụng");
        }

        // Tạo customer
        const customer = await Customer.create({username, email, password});
        
        // Tạo OTP và gửi email
        try {
            const otp = OTPService.generateOTP();
            const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
            
            await VerifiedEmail.create({
                customer_uid: customer.uid,
                email: customer.email,
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

    // Đăng nhập - kiểm tra email đã verify chưa
    async login(email,  password){
        const customer = await Customer.findOne({
            where: { email: email }
        })

        if(!customer){
            throw new Error("Sai mật khẩu hoặc tên đăng nhập");
        }

        const isValid = await customer.comparePassword(password);
        if(!isValid) {
            throw new Error("Sai mật khẩu hoặc tên đăng nhập");
        }

        // Kiểm tra email đã verified chưa
        const verifiedEmail = await VerifiedEmail.findOne({
            where: {
                customer_uid: customer.uid,
                email: customer.email,
                is_verified: true
            }
        });

        // Nếu chưa verified, trả về thông tin để redirect
        if (!verifiedEmail) {
            // Tạo OTP mới nếu không có OTP đang active
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
                const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
                
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

    // Đổi mật khẩu bằng uid
    async changePassword(uid, oldPassword, newPassword){  // NHỚ: parameter là uid
        const customer = await Customer.findByPk(uid);
        if(!customer) throw new Error("Tài khoản không tồn tại");

        const isValid = await customer.comparePassword(oldPassword);
        if(!isValid) throw new Error("Mật khẩu cũ không đúng");

        await customer.update({password: newPassword});
        return true;
    }

    // Kiểm tra email tồn tại
    async checkEmailExists(email) {
        const customer = await Customer.findOne({
            where: { email: email }
        });
        return {
            exists: !!customer,
            email: email
        };
    }

    // Xác thực OTP
    async verifyEmailOTP(customerId, email, otp) {
        const customer = await Customer.findOne({
            where: { 
                uid: customerId,
                email: email 
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