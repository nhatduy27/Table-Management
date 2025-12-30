// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { getAllUsers, createNewUser } from "../../services/authService"; // Đảm bảo đường dẫn import đúng

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Mặc định role là 'admin' luôn
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "admin", 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err); // Log lỗi nếu có
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi role 'admin' đi
      await createNewUser(formData);
      alert("Đã tạo tài khoản Admin thành công!");
      setShowForm(false);
      setFormData({ username: "", password: "", full_name: "", role: "admin" });
      fetchUsers();
    } catch (err) {
      alert(err.message || "Lỗi tạo tài khoản");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Chủ Nhà Hàng (Admin)</h1>
          <p className="text-sm text-gray-500">Danh sách các tài khoản quản lý chi nhánh</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
        >
          <span>{showForm ? "Đóng" : "+ Tạo Admin Mới"}</span>
        </button>
      </div>

      {/* FORM TẠO ADMIN */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-blue-800">Cấp tài khoản Admin mới</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: admin_quan1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="********"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Họ tên chủ quán</label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>
            {/* Ẩn input Role đi vì mặc định là admin rồi */}
            
            <div className="md:col-span-3 flex justify-end mt-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700">
                Xác nhận tạo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DANH SÁCH ADMIN */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4 border-b">STT</th>
              <th className="p-4 border-b">Họ tên</th>
              <th className="p-4 border-b">Username</th>
              <th className="p-4 border-b">Ngày tạo</th>
              <th className="p-4 border-b">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500">Chưa có Admin nào. Hãy tạo mới!</td></tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500">{index + 1}</td>
                  <td className="p-4 font-medium text-gray-900">{user.full_name}</td>
                  <td className="p-4 font-mono text-blue-600">{user.username}</td>
                  <td className="p-4 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;