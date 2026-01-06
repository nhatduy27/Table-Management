import { customerApi, publicApi } from "../config/api";

class CustomerService {
  // ========== PUBLIC METHODS ==========

  //Đăng ký
  async register(username, email, password) {
    try {
      const response = await publicApi.post("/customer/register", {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Đăng ký thất bại");
    }
  }

  //Đăng nhập
  async login(username, password) {
    try {
      const response = await publicApi.post("/customer/login", {
        username,
        password,
      });

      const { customer, accessToken } = response.data;

      localStorage.setItem("customer_token", accessToken);
      localStorage.setItem("customer_info", JSON.stringify(customer));

      return response.data;
    } catch (error) {
      throw new Error(error.message || "Đăng nhập thất bại");
    }
  }

  // ========== ORDER METHODS ==========

  //Tạo order
  async createOrder(tableId, totalAmount) {
    const numericTotal = Number(totalAmount);

    if (isNaN(numericTotal) || numericTotal <= 0) {
      throw new Error("Tổng tiền không hợp lệ");
    }

    const orderData = {
      table_id: tableId,
      total_amount: numericTotal,
    };

    const token = this.getToken();
    const apiExecutor = token ? customerApi : publicApi;
    const response = await apiExecutor.post("/customer/orders", orderData);

    return response.data;
  }

  // ========== ORDER ITEM METHODS ==========
  async createOrderWithItems(tableId, cartItems) {
    // 1. Tính tổng tiền
    let totalAmount = 0;

    cartItems.forEach((item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || 1;
      totalAmount += itemPrice * itemQuantity;
    });

    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error("Tổng tiền không hợp lệ");
    }

    const orderRes = await this.createOrder(tableId, totalAmount);
    const orderId = orderRes.data?.id;

    if (!orderId) {
      throw new Error("Không thể khởi tạo ID đơn hàng");
    }

    const token = this.getToken();
    const apiExecutor = token ? customerApi : publicApi;

    const itemPromises = cartItems.map(async (item) => {
      const itemData = {
        order_id: orderId,
        menu_item_id: item.id,
        quantity: Number(item.quantity) || 1,
        price_at_order: Number(item.price) || 0,
        notes: item.notes || "",
        modifiers: item.modifiers
      };
      return await apiExecutor.post("/customer/order-items", itemData);
    });

    await Promise.all(itemPromises);

    return {
      success: true,
      orderId: orderId,
      totalAmount: totalAmount,
      message: "Đặt món thành công",
      itemsCount: cartItems.length,
    };
  }

  async getOrderWithItems(orderId) {
    try {
      const token = this.getToken();
      const apiExecutor = token ? customerApi : publicApi;

      const response = await apiExecutor.get(
        `/customer/order-items/order/${orderId}`
      );

      const items = response.data.data || [];

      if (!response.data.success) {
        throw new Error(response.data.message || "Không thể lấy danh sách món");
      }
      const orderInfo = items.length > 0 ? items[0].Order : { id: orderId };

      return {
        success: true,
        order: orderInfo,
        items: items,
        message: "Lấy dữ liệu thành công",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        order: null,
        items: [],
      };
    }
  }

  getToken() {
    return localStorage.getItem("customer_token");
  }

  async getOrders(queryParams = {}) {
    try {
      if (!this.isLoggedIn()) {
        return { success: true, data: [] };
      }

      const response = await customerApi.get("/customer/orders", {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getOrders:", error);
      throw error;
    }
  }

  // ========== HELPER METHODS ==========
  isLoggedIn() {
    const token = localStorage.getItem("customer_token");
    const customerInfo = localStorage.getItem("customer_info");
    return !!(token && customerInfo);
  }

  getCurrentCustomer() {
    try {
      const customerInfo = localStorage.getItem("customer_info");
      return customerInfo ? JSON.parse(customerInfo) : null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_info");
  }
}

export default new CustomerService();
