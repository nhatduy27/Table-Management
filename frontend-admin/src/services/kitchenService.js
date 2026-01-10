// src/services/kitchenService.js
import { adminApi } from "../config/api.js";

const kitchenService = {
  // Lấy danh sách orders cho Kitchen Display
  getKitchenOrders: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await adminApi.get("/kitchen/orders", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
      throw error;
    }
  },

  // Cập nhật status của order
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await adminApi.put(
        `/orders/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Lấy thống kê
  getKitchenStats: async () => {
    try {
      const response = await adminApi.get("/kitchen/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching kitchen stats:", error);
      throw error;
    }
  },
};

export default kitchenService;
