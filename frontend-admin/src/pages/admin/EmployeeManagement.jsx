import React, { useState, useEffect } from "react";
import { getAllUsers, createNewUser } from "../../services/authService"; // Dùng lại service cũ ok

const EmployeeManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "waiter", // Mặc định là waiter
  });
  
  const fetchEmployees = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNewUser(formData);
      alert("Tạo nhân viên thành công!");
      setShowForm(false);
      setFormData({ username: "", password: "", full_name: "", role: "waiter" });
      fetchEmployees();
    } catch (err) {
      alert(err.message || "Lỗi tạo nhân viên");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Nhân viên</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Thêm Nhân viên
        </button>
      </div>

      {/* FORM TẠO NHÂN VIÊN */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6 border">
          <h3 className="font-bold mb-4">Thông tin nhân viên mới</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input 
              className="border p-2 rounded" 
              placeholder="Username" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              required
            />
            <input 
              type="password" className="border p-2 rounded" 
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
            <input 
              className="border p-2 rounded" 
              placeholder="Họ và tên"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required 
            />
            <select 
              className="border p-2 rounded bg-white"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="waiter">Phục vụ (Waiter)</option>
              <option value="kitchen">Bếp (Kitchen)</option>
            </select>
            
            <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded">Lưu lại</button>
          </form>
        </div>
      )}

      {/* DANH SÁCH */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Họ tên</th>
              <th className="p-4">Username</th>
              <th className="p-4">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-4">{u.full_name}</td>
                <td className="p-4">{u.username}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'kitchen' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;