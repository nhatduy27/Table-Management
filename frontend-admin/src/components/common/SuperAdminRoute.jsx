// src/components/SuperAdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const SuperAdminRoute = () => {
  // 1. Lấy thông tin user từ localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Kiểm tra Role
  // Nếu không có user hoặc role không phải super_admin -> Đuổi về /tables
  if (!user || user.role !== 'super_admin') {
    // Bạn có thể redirect về trang /403 hoặc về /tables đều được
    return <Navigate to="/tables" replace />;
  }

  // 3. Nếu đúng là Super Admin -> Mời vào (Hiển thị trang con)
  return <Outlet />;
};

export default SuperAdminRoute;