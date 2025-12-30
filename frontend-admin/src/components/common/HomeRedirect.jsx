// src/components/common/HomeRedirect.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const HomeRedirect = () => {
  // Lấy user từ kho
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  
  // 1. Chưa đăng nhập -> Đá về Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Phân luồng theo Role
  if (user.role === 'super_admin') {
    return <Navigate to="/admin/users" replace />;
  }
  
  if (user.role === 'kitchen') {
    return <Navigate to="/kitchen" replace />;
  }

  // Admin & Waiter -> Về trang Bàn
  return <Navigate to="/tables" replace />;
};

export default HomeRedirect;