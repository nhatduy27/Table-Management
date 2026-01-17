// src/pages/admin/EmployeeManagement.jsx
import React, { useState, useEffect } from "react";
// Import đủ các hàm từ service
import { getAllUsers, createNewUser, updateUser, toggleUserStatus } from "../../services/authService"; 
import { Edit, Lock, Unlock, UserPlus, Save, X, ChefHat, Coffee } from "lucide-react";

const EmployeeManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State form
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "waiter", // Mặc định
  });

  // 1. FETCH DATA
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(); 
  }, []);

  // 2. HANDLERS
  const resetForm = () => {
    setFormData({ username: "", password: "", full_name: "", role: "waiter" });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (user) => {
    setFormData({
      username: user.username,
      password: "", // Reset pass khi edit
      full_name: user.full_name,
      role: user.role,
    });
    setEditingId(user.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateUser(editingId, formData);
        alert("Cập nhật nhân viên thành công!");
      } else {
        await createNewUser(formData);
        alert("Tạo nhân viên mới thành công!");
      }
      resetForm();
      fetchEmployees();
    } catch (err) {
      alert(err.message || "Lỗi xử lý");
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? "KHÓA" : "MỞ KHÓA";
    if (window.confirm(`Bạn muốn ${action} nhân viên ${user.full_name}?`)) {
      try {
        await toggleUserStatus(user.id, !user.is_active);
        fetchEmployees();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  return (
    <div className="p-6 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên</h1>
          <p className="text-sm text-gray-500">Quản lý Phục vụ (Waiter) và Bếp (Kitchen)</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className={`${showForm ? 'bg-gray-500' : 'bg-blue-600'} text-white px-4 py-2 rounded shadow hover:opacity-90 flex items-center gap-2 transition-all`}
        >
           {showForm ? <><X size={18}/> Đóng</> : <><UserPlus size={18}/> Thêm Nhân viên</>}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 text-blue-800 flex items-center gap-2">
            {isEditing ? <Edit size={20}/> : <UserPlus size={20}/>}
            {isEditing ? "Cập nhật nhân viên" : "Thông tin nhân viên mới"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên đăng nhập</label>
              <input 
                className={`w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                placeholder="Username" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                disabled={isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                 Mật khẩu {isEditing && <span className="text-xs font-normal text-red-500">(Để trống nếu không đổi)</span>}
              </label>
              <input 
                type="password" 
                className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isEditing ? "Nhập mật khẩu mới..." : "********"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!isEditing} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên</label>
              <input 
                className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nguyễn Văn A"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Vai trò</label>
              <select 
                className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="waiter">Phục vụ (Waiter)</option>
                <option value="kitchen">Bếp (Kitchen)</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
               <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
               <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-700 flex items-center gap-2">
                  <Save size={18}/> Lưu lại
               </button>
            </div>
          </form>
        </div>
      )}

      {/* DANH SÁCH */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">STT</th>
              <th className="p-4">Họ tên</th>
              <th className="p-4">Username</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u, index) => (
              <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 text-gray-500">{index + 1}</td>
                <td className="p-4 font-bold text-gray-900">{u.full_name}</td>
                <td className="p-4 font-mono text-blue-600">{u.username}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    u.role === 'kitchen' 
                      ? 'bg-orange-100 text-orange-800 border-orange-200' 
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {u.role === 'kitchen' ? <ChefHat size={14}/> : <Coffee size={14}/>}
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                    {u.is_active ? (
                      <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-100">Active</span>
                    ) : (
                      <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100">Locked</span>
                    )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(u)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors" title="Sửa">
                       <Edit size={16}/>
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(u)} 
                      className={`p-2 rounded transition-colors ${u.is_active ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                      title={u.is_active ? "Khóa" : "Mở khóa"}
                    >
                       {u.is_active ? <Lock size={16}/> : <Unlock size={16}/>}
                    </button>
                  </div>
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