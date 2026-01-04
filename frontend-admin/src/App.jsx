import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom"; // Thêm Outlet
import Layout from "./components/layout/Layout";
import TableList from "./components/tables/TableList";
import TableForm from "./components/tables/TableForm";
import QRCodePage from "./components/tables/QRCodePage";
import Login from "./pages/Login";
import UserManagement from "./pages/admin/UserManagement"; 
import SuperAdminRoute from "./components/common/SuperAdminRoute";
import HomeRedirect from "./components/common/HomeRedirect";
import EmployeeManagement from "./pages/admin/EmployeeManagement";

import {
  CategoryList,
  MenuItemList,
  MenuItemForm,
  ModifierGroupList,
} from "./components/admin/menu";
import "./App.css";

// --- TẠO THÊM COMPONENT BẢO VỆ ---
// Nhiệm vụ: Kiểm tra xem có Token chưa?
// Có -> Cho vào trong (Outlet)
// Không -> Đá về trang Login
const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // Lấy vé trong túi ra xem
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    // 1. PHẢI CÓ THẺ ROUTER BAO NGOÀI CÙNG
    <Router>
      <Routes>
        {/* Route Login (Ai cũng vào được) */}
        <Route path="/login" element={<Login />} />

        {/* --- KHU VỰC BẢO VỆ (PHẢI CÓ TOKEN MỚI ĐƯỢC VÀO) --- */}
        <Route element={<ProtectedRoute />}>
          
          <Route element={<Layout />}>
            {/* - Nếu chưa có token: ProtectedRoute ở trên đã đá về /login rồi */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Admin Table routes */}
            <Route path="/tables" element={<TableList />} />
            <Route path="/tables/new" element={<TableForm />} />
            <Route path="/tables/:id" element={<TableForm />} />
            <Route path="/tables/:id/qr" element={<QRCodePage />} />

            {/* Menu Admin routes */}
            <Route path="/admin/menu/categories" element={<CategoryList />} />
            <Route path="/admin/menu/items" element={<MenuItemList />} />
            <Route path="/admin/menu/items/new" element={<MenuItemForm />} />
            <Route path="/admin/menu/items/:id" element={<MenuItemForm />} />
            <Route path="/admin/menu/modifiers" element={<ModifierGroupList />} />
            {/* Employee Management */}
            <Route path="/admin/employees" element={<EmployeeManagement />} />

            {/* Superadmin page */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
            
            {/* 404 Route... (Giữ nguyên code cũ của bạn đoạn này) */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;