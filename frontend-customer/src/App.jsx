import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MenuPage from "./components/menu/MenuPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerProfile from "./pages/CustomerProfile"; 
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from './pages/OrderDetailPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
// Import các trang quên mật khẩu
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyForgotPasswordOTPPage from "./pages/VerifyForgotPasswordOTPPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer-facing menu route - NHẬN QUERY PARAMETERS */}
        <Route path="/menu" element={<MenuPage />} />
        
        {/* Customer auth routes */}
        <Route path="/customer/login" element={<CustomerLoginPage />} />
        <Route path="/customer/register" element={<RegisterPage />} />
        <Route path="/customer/verify-email" element={<VerifyEmailPage />} /> 
        
        {/* Forgot password routes */}
        <Route path="/customer/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/customer/forgot-password/verify-otp" element={<VerifyForgotPasswordOTPPage />} />
        <Route path="/customer/forgot-password/reset" element={<ResetPasswordPage />} />
        
        {/* Customer profile and order routes */}
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/orders" element={<OrderHistoryPage />} />
        <Route path="/customer/orders/:orderId" element={<OrderDetailPage />} />
        
        {/* Nếu khách vào trang chủ, tự động chuyển vào menu */}
        <Route path="/" element={<Navigate to="/menu" replace />} />

        {/* 404 route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-lg text-gray-600 mb-8">
                  Không tìm thấy trang bạn yêu cầu
                </p>
                <a
                  href="/#/menu"
                  className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Quay lại Thực đơn
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;