import { publicApi } from "../config/api";

// 1. Lấy danh sách user
export const getAllUsers = async () => {
  // API này trả về mảng user (cần có trường id, username, full_name, role, is_active)
  const response = await publicApi.get("/auth/users");
  return response.data;
};

// 2. Tạo user mới
export const createNewUser = async (userData) => {
  const response = await publicApi.post("/auth/create-user", userData);
  return response.data;
};

// --- 👇 CÁC HÀM MỚI BỔ SUNG 👇 ---

// 3. Cập nhật thông tin User (Edit)
export const updateUser = async (id, userData) => {
  // Gửi method PUT kèm ID trên URL và dữ liệu mới trong Body
  // Lưu ý: Backend cần có route PUT /api/auth/users/:id
  const response = await publicApi.put(`/auth/users/${id}`, userData);
  return response.data;
};

// 4. Đổi trạng thái Khóa/Mở khóa (Deactivate)
export const toggleUserStatus = async (id, isActive) => {
  // Gửi method PATCH để cập nhật 1 trường nhỏ
  // Body gửi lên: { is_active: true } hoặc { is_active: false }
  // Lưu ý: Backend cần có route PATCH /api/auth/users/:id/status
  const response = await publicApi.patch(`/auth/users/${id}/status`, { is_active: isActive });
  return response.data;
};