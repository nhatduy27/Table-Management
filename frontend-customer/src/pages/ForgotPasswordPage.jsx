import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import customerService from "../services/customerService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Vui lòng nhập email");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      const result = await customerService.sendForgotPasswordOTP(email);
      
      if (result.success) {
        setSuccess(result.message || "Mã OTP đã được gửi đến email của bạn");
        
        // Chuyển sang trang nhập OTP
        setTimeout(() => {
          navigate("/customer/forgot-password/verify-otp", {
            state: {
              email: email,
              from: from
            }
          });
        });
      } else {
        setError(result.error || "Không thể gửi OTP");
      }
    } catch (err) {
      setError(err.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Restaurant</h1>
          <h2 className="text-xl font-semibold mt-2 text-gray-700">Quên Mật Khẩu</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Nhập email để nhận mã OTP đặt lại mật khẩu
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email của bạn
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              placeholder="Nhập email đăng ký"
              required
              disabled={loading}
            />
            <p className="text-gray-500 text-sm mt-2">
              Chúng tôi sẽ gửi mã OTP đến email này để xác thực
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"}`}
          >
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Đã nhớ mật khẩu?
            <Link
              to="/customer/login"
              state={{ from: from }}
              className="ml-2 text-amber-600 font-semibold hover:text-amber-700"
            >
              Đăng nhập ngay
            </Link>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate(from)}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;