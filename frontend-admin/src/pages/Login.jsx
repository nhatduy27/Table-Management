import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Import cái này để dùng axios đã cấu hình
import { publicApi } from "../config/api"; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading cho chuyên nghiệp
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Bắt đầu xoay xoay

    try {
      // 2. Thay fetch bằng publicApi.post
      const response = await publicApi.post("/auth/login", { username, password });
      
      // Axios trả dữ liệu trong response.data
      const { token, user } = response.data;

      // 3. Lưu vào kho (Giữ nguyên logic của bạn - Chuẩn)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Chuyển hướng
      if (user.role === 'super_admin') {
        navigate("/admin/users"); // Admin vào quản lý bàn
      } else if (user.role === 'admin') {
        navigate("/tables"); // Admin vào quản lý bàn
      } else if (user.role === 'waiter') {
        navigate("/waiter"); // Waiter tạm thời cũng vào bàn để nhận đơn
      } else if (user.role === 'kitchen') {
        navigate("/kitchen");
      } else {
        setError("Tài khoản này không có quyền truy cập hệ thống quản lý.");
        // Xóa token vừa lưu để tránh lỗi
        localStorage.clear();
      }

    } catch (err) {
      // Axios ném lỗi vào err.response.data
      const msg = err.message || "Đăng nhập thất bại";
      setError(msg);
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Smart Restaurant</h2>
        <h3 className="text-xl font-semibold mb-4 text-center">Đăng Nhập Quản Trị</h3>
        
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập username..."
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading} // Khóa nút khi đang tải
            className={`w-full text-white font-bold py-2 px-4 rounded transition duration-200 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;