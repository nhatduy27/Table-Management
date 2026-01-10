import { customerApi, publicApi } from "../config/api";

class CustomerService {
  // ========== PUBLIC METHODS ==========

  // Đăng ký
  async register(username, email, password) {
    try {
      const response = await publicApi.post("/customer/register", {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || error.message || "Đăng ký thất bại"
      );
    }
  }

  // Đăng nhập
  async login(email, password) {
    try {
      const response = await publicApi.post("/customer/login", {
        email,
        password,
      });

      // Kiểm tra nếu cần xác thực email
      if (response.data.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          customerId: response.data.data?.customerId,
          email: response.data.data?.email,
          username: response.data.data?.username,
          message: response.data.message || "Vui lòng xác thực email",
        };
      }

      // Nếu đăng nhập thành công
      if (response.data.success && response.data.data) {
        const { customer, accessToken } = response.data.data;

        localStorage.setItem("customer_token", accessToken);
        localStorage.setItem("customer_info", JSON.stringify(customer));

        return {
          success: true,
          customer,
          accessToken,
          message: response.data.message,
        };
      }

      throw new Error(response.data.error || "Đăng nhập thất bại");
    } catch (error) {
      throw new Error(
        error.response?.data?.error || error.message || "Đăng nhập thất bại"
      );
    }
  }

  // Xác thực Email OTP
  async verifyEmailOTP(customerId, email, otp) {
    try {
      const response = await publicApi.post("/customer/verify-email", {
        customerId,
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error("Verify OTP error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Xác thực OTP thất bại",
      };
    }
  }

  // Gửi lại OTP
  async resendOTP(customerId, email) {
    try {
      const response = await publicApi.post("/customer/resend-otp", {
        customerId,
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Resend OTP error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Không thể gửi lại OTP",
      };
    }
  }

  // Kiểm tra trạng thái xác thực
  async checkVerificationStatus(customerId, email) {
    try {
      const response = await publicApi.get("/customer/check-verification", {
        params: { customerId, email },
      });
      return response.data;
    } catch (error) {
      console.error("Check verification error:", error);
      return {
        success: false,
        error: error.message || "Không thể kiểm tra trạng thái xác thực",
      };
    }
  }

  // Kiểm tra email đã tồn tại
  async checkEmailExists(email) {
    try {
      const response = await publicApi.get("/customer/check-email", {
        params: { email },
      });
      return response.data;
    } catch (error) {
      console.error("Check email error:", error);
      return {
        success: false,
        error: error.message || "Không thể kiểm tra email",
      };
    }
  }

  // ========== FORGOT PASSWORD METHODS ==========

  // Gửi OTP quên mật khẩu
  async sendForgotPasswordOTP(email) {
    try {
      const response = await publicApi.post(
        "/customer/forgot-password/send-otp",
        {
          email,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Send forgot password OTP error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error || error.message || "Không thể gửi OTP",
      };
    }
  }

  // Xác thực OTP quên mật khẩu
  async verifyForgotPasswordOTP(email, otp) {
    try {
      const response = await publicApi.post(
        "/customer/forgot-password/verify-otp",
        {
          email,
          otp,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Verify forgot password OTP error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Xác thực OTP thất bại",
      };
    }
  }

  // Đặt lại mật khẩu sau khi xác thực OTP
  async resetPassword(email, otp, newPassword, confirmPassword) {
    try {
      const response = await publicApi.post("/customer/forgot-password/reset", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Không thể đặt lại mật khẩu",
      };
    }
  }

  // Lấy thông tin customer (protected)
  async getMe() {
    try {
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await customerApi.get("/customer/me");
      return response.data;
    } catch (error) {
      console.error("Get me error:", error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể lấy thông tin"
      );
    }
  }

  // Cập nhật profile (protected)
  async updateMe(updateData) {
    try {
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await customerApi.put("/customer/me", updateData);
      return response.data;
    } catch (error) {
      console.error("Update me error:", error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể cập nhật thông tin"
      );
    }
  }

  // Đổi mật khẩu (protected)
  async changePassword(oldPassword, newPassword) {
    try {
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await customerApi.put("/customer/change-password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw new Error(
        error.response?.data?.error || error.message || "Không thể đổi mật khẩu"
      );
    }
  }

  // ========== ORDER METHODS ==========

  // Tạo order
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

  // Tạo order với items
  async createOrderWithItems(tableId, cartItems) {    
    // Tính tổng tiền
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
      message: "Gửi món thành công", // Sửa message theo ý bạn
      data: {
          id: orderId,
          status: 'pending',        // [QUAN TRỌNG] Phải có cái này để hiện thanh màu vàng
          totalAmount: totalAmount,
          table_id: tableId,
          items: cartItems.map(item => ({ // Map lại items để hiển thị chi tiết
              ...item,
              menuItem: { name: item.name } // Format cho khớp hiển thị
          }))
      }
    };
  }

  async getOrdersByIds(orderIds) {
    try {
      const token = this.getToken();
      const apiExecutor = token ? customerApi : publicApi;

      const orderPromises = orderIds.map(async (orderId) => {
        const response = await apiExecutor.get(`/customer/orders/${orderId}`);
        return response.data;
      });

      const results = await Promise.all(orderPromises);

      return {
        success: true,
        data: results.map((r) => r.data || r).flat(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Unable to fetch order information",
        data: [],
      };
    }
  }

  // 12. Lấy order với items
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

  // 13. Lấy danh sách orders
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

  // [MỚI] Hàm lấy chi tiết đơn hàng (Dùng cho OrderTracking)
  async getOrderById(orderId) {
    try {
      // Tận dụng hàm getOrderWithItems bạn đã viết sẵn
      const result = await this.getOrderWithItems(orderId);

      if (result.success) {
        // Format lại dữ liệu để khớp với mong đợi của OrderTracking component
        // Gộp 'order' và 'items' thành 1 object data duy nhất
        return {
          success: true,
          data: {
            ...result.order,      // Spread thông tin order (table_id, total_amount...)
            items: result.items   // Gắn thêm mảng items vào
          }
        };
      }
      
      return { success: false, message: result.message || "Không tìm thấy đơn hàng" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // [MỚI] Hàm gọi thêm món vào đơn hàng đã có
  async addItemsToOrder(orderId, cartItems) {
    try {
      const token = this.getToken();
      const apiExecutor = token ? customerApi : publicApi;

      // Duyệt qua từng món trong giỏ và gửi lên server
      const itemPromises = cartItems.map(async (item) => {
        const itemData = {
          order_id: orderId,
          menu_item_id: item.id,
          quantity: Number(item.quantity) || 1,
          price_at_order: Number(item.price) || 0,
          notes: item.notes || "",
        };
        // Gọi API Backend: POST /customer/order-items
        return await apiExecutor.post("/customer/order-items", itemData);
      });

      // Chờ tất cả các món được gửi xong
      await Promise.all(itemPromises);

      return {
        success: true,
        message: "Gọi thêm món thành công",
        // Trả về data giả lập để MenuPage không bị lỗi undefined
        // Dữ liệu thật sẽ được Socket cập nhật ngay lập tức sau đó
        data: {
            id: orderId,
            status: 'pending' // Quan trọng: Giữ status để thanh Tracking không bị mất
        }
      };

    } catch (error) {
      console.error("Add items error:", error);
      throw new Error(error.response?.data?.message || "Không thể gọi thêm món");
    }
  }

  // [MỚI] Hàm yêu cầu thanh toán
  async requestPayment(orderId) {
    try {
      const token = this.getToken();
      const apiExecutor = token ? customerApi : publicApi;

      // Gọi API Backend (Bạn cần đảm bảo Backend có route này)
      const response = await apiExecutor.post(`/customer/orders/${orderId}/request-payment`);
      return response.data;
    } catch (error) {
      console.error("Request payment error:", error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || "Không thể gửi yêu cầu thanh toán"
      };
    }
  }

  // ========== HELPER METHODS ==========

  // 14. Kiểm tra đã đăng nhập
  isLoggedIn() {
    const token = localStorage.getItem("customer_token");
    const customerInfo = localStorage.getItem("customer_info");
    return !!(token && customerInfo);
  }

  // 15. Lấy thông tin customer hiện tại
  getCurrentCustomer() {
    try {
      const customerInfo = localStorage.getItem("customer_info");
      return customerInfo ? JSON.parse(customerInfo) : null;
    } catch {
      return null;
    }
  }

  // 16. Lấy token
  getToken() {
    return localStorage.getItem("customer_token");
  }

  // 17. Đăng xuất
  logout() {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_info");
  }

  // 18. Kiểm tra email đã verify
  async isEmailVerified() {
    try {
      const customer = this.getCurrentCustomer();
      if (!customer || !customer.uid) {
        return false;
      }

      const response = await this.checkVerificationStatus(
        customer.uid,
        customer.email
      );
      return response.success && response.data?.isVerified;
    } catch (error) {
      console.error("Check email verified error:", error);
      return false;
    }
  }

  // 19. Refresh token (nếu cần)
  async refreshToken() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Không có token");
      }

      const response = await publicApi.post("/customer/refresh-token", {
        token,
      });

      if (response.data.success && response.data.data?.accessToken) {
        localStorage.setItem("customer_token", response.data.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      return false;
    }
  }
}

export default new CustomerService();
