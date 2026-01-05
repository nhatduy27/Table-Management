// backend/src/services/email.service.js
import transporter from '../config/email.js';

class EmailService {
  // Gửi OTP cho đăng ký
  async sendOTPEmail(email, otp, username = '') {
    try {
      console.log(`📧 Sending OTP to: ${email}, OTP: ${otp}`);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Smart Restaurant" <noreply@smartrestaurant.com>',
        to: email,
        subject: 'Mã xác thực OTP - Smart Restaurant',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #D97706, #F59E0B); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
              .otp-container { text-align: center; margin: 30px 0; }
              .otp-code { 
                display: inline-block; 
                background-color: #f3f4f6; 
                padding: 20px 40px; 
                border-radius: 10px; 
                border: 2px dashed #D97706;
                font-family: 'Courier New', monospace;
              }
              .otp-digits { 
                font-size: 32px; 
                font-weight: bold; 
                letter-spacing: 10px; 
                color: #D97706; 
              }
              .warning { 
                background-color: #fef3c7; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 25px 0; 
                text-align: center;
                border-left: 4px solid #D97706;
              }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Smart Restaurant</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; text-align: center;">Xin chào ${username}!</h2>
              
              <p style="color: #4b5563; text-align: center;">
                Sử dụng mã OTP bên dưới để hoàn tất xác thực email
              </p>
              
              <div class="otp-container">
                <div class="otp-code">
                  <div class="otp-digits">${otp}</div>
                </div>
              </div>
              
              <div class="warning">
                <p style="color: #92400e; margin: 0;">
                  ⏳ <strong>Mã OTP có hiệu lực trong 15 phút</strong>
                </p>
                <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">
                  Không chia sẻ mã này với bất kỳ ai
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Nếu bạn không thực hiện xác thực này, vui lòng bỏ qua email này.<br>
                Đây là email tự động, vui lòng không trả lời.
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Smart Restaurant. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
        text: `Xin chào ${username}, mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 15 phút.`
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ OTP email sent! Message ID:', info.messageId);
      return true;
      
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      
      // Trong development, log và tiếp tục
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Development mode: Email not sent, but continuing...');
        return true; // Trả về true để không fail register
      }
      
      throw new Error(`Không thể gửi email OTP: ${error.message}`);
    }
  }

  // Gửi email thông báo xác thực thành công
  async sendVerificationSuccessEmail(email, username = '') {
    try {
      console.log(`📧 Sending verification success email to: ${email}`);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Smart Restaurant" <noreply@smartrestaurant.com>',
        to: email,
        subject: '🎉 Xác thực email thành công - Smart Restaurant',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #34d399); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; text-align: center; }
              .success-icon { font-size: 60px; color: #10b981; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Smart Restaurant</h1>
            </div>
            
            <div class="content">
              <div class="success-icon">✅</div>
              <h2 style="color: #10b981;">Xác thực email thành công!</h2>
              <p>Chúc mừng <strong>${username}</strong>,</p>
              <p>Email của bạn đã được xác thực thành công tại Smart Restaurant.</p>
              <p>Bây giờ bạn có thể đăng nhập và sử dụng đầy đủ tính năng của chúng tôi.</p>
              
              <div style="margin-top: 30px; padding: 15px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="color: #166534; margin: 0;">
                  🎉 Cảm ơn bạn đã tham gia cùng chúng tôi!
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Smart Restaurant</p>
              <p>Hotline: 1900 1234 | Email: support@smartrestaurant.com</p>
            </div>
          </body>
          </html>
        `,
        text: `Chúc mừng ${username}! Email của bạn đã được xác thực thành công tại Smart Restaurant.`
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Verification success email sent! Message ID:', info.messageId);
      return true;
      
    } catch (error) {
      console.error('❌ Error sending verification success email:', error.message);
      return false; // Không throw error vì đây chỉ là email thông báo
    }
  }
}

// Export instance
export default new EmailService();