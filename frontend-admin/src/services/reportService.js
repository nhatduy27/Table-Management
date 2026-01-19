// 👇 SỬA LỖI IMPORT: Thêm dấu ngoặc nhọn { } 
// Vì file api.js của bạn export const chứ không phải export default
import { publicApi } from "../config/api"; 

const reportService = {
  // 1. Lấy thống kê 4 thẻ trên cùng
  getDashboardStats: async () => {
    const response = await publicApi.get("/admin/reports/stats");
    return response.data;
  },

  // 2. Lấy dữ liệu biểu đồ doanh thu
  getRevenueChart: async (fromDate, toDate) => {
    const response = await publicApi.get("/admin/reports/revenue", {
      params: { fromDate, toDate }
    });
    return response.data;
  },

  // 3. Lấy Top món bán chạy
  getTopItems: async (fromDate, toDate) => {
    const response = await publicApi.get("/admin/reports/top-items", {
      params: { fromDate, toDate }
    });
    return response.data;
  },

  getPeakHours: async () => {
    // API này thường không cần lọc theo ngày (lấy trung bình chung) 
    // hoặc lấy theo khoảng thời gian tùy bạn. Ở đây mình lấy mặc định.
    const response = await publicApi.get("/admin/reports/peak-hours");
    return response.data;
  }
};

export default reportService;