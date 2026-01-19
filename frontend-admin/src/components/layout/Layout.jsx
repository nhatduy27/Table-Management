import React from "react";
import { Outlet } from "react-router-dom";
// Import 2 file con vừa tạo
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Header ở trên cùng */}
      <Navbar />

      {/* 2. Nội dung chính (Outlet) */}
      {/* Thêm padding-top (pt-16) để không bị Navbar đè lên vì Navbar đang fixed */}
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <Outlet />
      </main>

      {/* 3. Footer ở dưới cùng */}
      <Footer />
    </div>
  );
};

export default Layout;