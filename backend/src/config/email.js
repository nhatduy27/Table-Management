// backend/src/config/email.js
import nodemailer from 'nodemailer';

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // false cho TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Tắt SSL certificate verification
  }
});

// Test connection (optional)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email server connection error:', error.message);
    console.log('⚠️ Email service will run in development mode');
  } else {
    console.log('✅ Email server is ready');
  }
});

export default transporter;