import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MenuPage from "./components/menu/MenuPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer-facing menu route */}
        <Route path="/menu" element={<MenuPage />} />
        
        {/* Nếu khách vào trang chủ, tự động chuyển vào menu */}
        <Route path="/" element={<Navigate to="/menu" replace />} />

        {/* 404 route (Dành cho khách) */}
        <Route
          path="*"
          element={
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-lg text-gray-600 mb-8">
                Không tìm thấy trang bạn yêu cầu
              </p>
              <a
                href="/#/menu"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Quay lại Thực đơn
              </a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;