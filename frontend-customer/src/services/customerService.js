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

  //Hàm đồng bộ user Google
  async syncGoogleUser(userData) {
    try {
      // Gọi API backend
      const response = await publicApi.post("/customer/sync-google", userData);

      // Nếu API trả về success
      if (response.data.success && response.data.data) {
        const { customer, accessToken } = response.data.data;

        // Lưu vào localStorage GIỐNG NHƯ LOGIN
        localStorage.setItem("customer_token", accessToken);
        localStorage.setItem("customer_info", JSON.stringify(customer));
        localStorage.setItem("auth_method", "google"); // Lưu phương thức đăng nhập là Google

        console.log(
          "[CUSTOMER SERVICE] Đồng bộ thành công, đã lưu vào localStorage"
        );

        return {
          success: true,
          customer,
          accessToken,
          message: response.data.message || "Đăng nhập Google thành công",
        };
      }

      // Nếu API trả về lỗi
      throw new Error(response.data.error || "Đồng bộ Google thất bại");
    } catch (error) {
      console.error("[CUSTOMER SERVICE] Sync Google error:", error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Đồng bộ Google thất bại"
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
          phone: response.data.data?.phone,
          username: response.data.data?.username,
          message: response.data.message || "Vui lòng xác thực email",
        };
      }

      // Nếu đăng nhập thành công
      if (response.data.success && response.data.data) {
        const { customer, accessToken } = response.data.data;

        localStorage.setItem("customer_token", accessToken);
        localStorage.setItem("customer_info", JSON.stringify(customer));
        localStorage.setItem("auth_method", "email");  // Lưu phương thức đăng nhập là email

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


  // ========== PROTECTED CUSTOMER METHODS ==========

  // Lấy thông tin profile (protected)
  async updateProfile(updateData) {
    try {
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await customerApi.put("/customer/profile", updateData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể cập nhật thông tin"
      );
    }
  }

  // Đổi mật khẩu (cần mật khẩu cũ)
  async changePassword(oldPassword, newPassword) {
    try {
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await customerApi.put("/customer/password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể đổi mật khẩu"
      );
    }
  }

  // Cập nhật avatar 
  async updateAvatar(avatarFile) {
    try {
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      // Chỉ nhận File object
      if (!(avatarFile instanceof File)) {
        throw new Error("Phải là đối tượng File");
      }

      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await customerApi.put("/customer/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Cập nhật localStorage với avatar mới
      if (response.data.success) {
        const customerInfo = JSON.parse(localStorage.getItem("customer_info") || "{}");
        customerInfo.avatar = response.data.data.avatar;
        localStorage.setItem("customer_info", JSON.stringify(customerInfo));
      }

      return response.data;
    } catch (error) {
      console.error("Update avatar error:", error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật ảnh đại diện"
      );
    }
  }



  async deleteAvatar() {
    try {
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await customerApi.delete("/customer/avatar");
      return response.data;
    } catch (error) {
      console.error("Delete avatar error:", error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể xóa ảnh đại diện"
      );
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

  // ========== ORDER METHODS ==========

  // // Tạo order
  // async createOrder(tableId, totalAmount) {
  //   const numericTotal = Number(totalAmount);

  //   if (isNaN(numericTotal) || numericTotal <= 0) {
  //     throw new Error("Tổng tiền không hợp lệ");
  //   }

  //   const orderData = {
  //     table_id: tableId,
  //     total_amount: numericTotal,
  //   };

  //   const token = this.getToken();
  //   const apiExecutor = token ? customerApi : publicApi;
  //   const response = await apiExecutor.post("/customer/orders", orderData);

  //   return response.data;
  // }

  // Tạo order với items
  async createOrderWithItems(tableId, cartItems) {
    const cleanItems = cartItems.map((item) => ({
        id: item.id,
        quantity: Number(item.quantity),
        // Không cần gửi price, Backend tự tra
        notes: item.notes || item.note || "",
        modifiers: (item.modifiers || []).map((mod) => ({
            id: mod.id || mod.optionId,
            // Vẫn gửi giá modifier snapshot (hoặc để backend tự tra nốt cũng được, nhưng tạm thời gửi để lưu snapshot)
            price: Number(mod.price) || Number(mod.price_adjustment) || 0,
        })),
    }));

    const orderPayload = {
      table_id: tableId,
      items: cleanItems,
    };

    console.log("📦 Sending One-Step Order:", orderPayload);

    const token = this.getToken();
    const apiExecutor = token ? customerApi : publicApi;
    const response = await apiExecutor.post("/customer/orders", orderPayload);

    return {
      success: true,
      message: "Gửi món thành công",
      data: response.data.data, // Dữ liệu order từ Backend trả về
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
      // 1. Kiểm tra đăng nhập (Bắt buộc)
      if (!this.isLoggedIn()) {
        throw new Error("Chưa đăng nhập");
      }

      // 2. Gọi API lấy chi tiết (có token)
      // Backend trả về: { success: true, data: { ...order, table: {}, items: [] } }
      const response = await customerApi.get(`/customer/orders/${orderId}`);
      
      // Trả về body response
      return response.data;
    } catch (error) {
      console.error("Get order by ID error:", error);
      throw new Error(
        error.response?.data?.error || error.message || "Không thể lấy thông tin đơn hàng"
      );
    }
  }

  // [MỚI] Hàm gọi thêm món vào đơn hàng đã có
  async addItemsToOrder(orderId, cartItems) {
    try {
      const token = this.getToken();
      const apiExecutor = token ? customerApi : publicApi;

      console.log("📦 addItemsToOrder - cartItems:", cartItems);

      // Duyệt qua từng món trong giỏ và gửi lên server
      const payload = {
        order_id: orderId,
        items: cartItems.map((item) => ({
          menu_item_id: item.id, // Map đúng tên biến Backend cần
          quantity: Number(item.quantity) || 1,
          price_at_order: Number(item.price) || 0, // Giá gốc
          notes: item.notes || item.note || "",
          // Map modifiers để lấy giá Snapshot
          modifiers: (item.modifiers || []).map((mod) => ({
            id: mod.id || mod.optionId,
            price: Number(mod.price) || Number(mod.price_adjustment) || Number(mod.priceAdjustment) || 0,
          })),
        })),
      };

      console.log("📤 Sending Bulk Items:", payload);

      const response = await apiExecutor.post("/customer/order-items", payload);

      return {
        success: true,
        message: "Gọi thêm món thành công",
        data: response.data.data, // Backend trả về fullOrder
      };
    } catch (error) {
      console.error("Add items error:", error);

      const errorCode = error.response?.data?.code;
      if (["ORDER_NOT_FOUND", "ORDER_CLOSED", "ORDER_LOCKED"].includes(errorCode)) {
        const err = new Error(error.response?.data?.message || "Đơn hàng không hợp lệ");
        err.shouldCreateNewOrder = true;
        throw err;
      }

      throw new Error(error.response?.data?.message || "Không thể gọi thêm món");
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

  // ========== PAYMENT METHODS ==========

  // Lấy active order của bàn (dùng khi reload page)
  async getActiveOrder(tableId) {
    try {
      const response = await publicApi.get(
        `/customer/tables/${tableId}/active-order`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể lấy thông tin đơn hàng"
      );
    }
  }

  // Yêu cầu thanh toán (Bước 1: Gọi bill, chưa chọn phương thức)
  async requestPayment(orderId) {
    try {
      const response = await publicApi.post(
        `/customer/orders/${orderId}/request-payment`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Yêu cầu thanh toán thất bại"
      );
    }
  }

  // Chọn phương thức thanh toán (Bước 3: Sau khi waiter chốt bill)
  async selectPaymentMethod(orderId, paymentMethod) {
    try {
      const response = await publicApi.post(
        `/customer/orders/${orderId}/select-payment-method`,
        {
          payment_method: paymentMethod,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể chọn phương thức thanh toán"
      );
    }
  }

  // Hoàn tất thanh toán (Gọi sau khi payment gateway callback)
  async completePayment(orderId, transactionId, paymentMethod) {
    try {
      const response = await publicApi.post(
        `/customer/orders/${orderId}/complete-payment`,
        {
          transaction_id: transactionId,
          payment_method: paymentMethod,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Hoàn tất thanh toán thất bại"
      );
    }
  }

  // Tạo thanh toán MoMo - Gọi API để lấy payUrl
  async createMomoPayment(orderId, amount) {
    try {
      const response = await publicApi.post("/customer/payment/momo-callback", {
        orderId
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể tạo thanh toán MoMo"
      );
    }
  }

  // Kiểm tra trạng thái thanh toán MoMo
  async checkMomoPaymentStatus(orderId) {
    try {
      const response = await publicApi.post("/customer/payment/check-status", {
        orderId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể kiểm tra trạng thái thanh toán"
      );
    }
  }

  // ========== REVIEW METHODS ==========

  // Tạo review cho món ăn
  async createReview(reviewData) {
    try {
      // Dùng customerApi nếu đã login, publicApi nếu khách vãng lai
      const token = this.getToken();
      const apiExecutor = token ? customerApi : publicApi;
      const response = await apiExecutor.post("/customer/reviews", reviewData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || error.message || "Không thể tạo đánh giá"
      );
    }
  }

  // Lấy danh sách reviews của món ăn
  async getMenuItemReviews(menuItemId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await publicApi.get(
        `/customer/reviews/menu-item/${menuItemId}?${queryParams}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || error.message || "Không thể tải đánh giá"
      );
    }
  }

  // Kiểm tra món nào có thể review từ order
  async getReviewableItems(orderId) {
    try {
      const response = await publicApi.get(
        `/customer/reviews/order/${orderId}/can-review`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể kiểm tra đánh giá"
      );
    }
  }

  // Sửa review
  async updateReview(reviewId, reviewData) {
    try {
      const response = await publicApi.put(
        `/customer/reviews/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Không thể cập nhật đánh giá"
      );
    }
  }

  // Xoá review
  async deleteReview(reviewId) {
    try {
      const response = await publicApi.delete(`/customer/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || error.message || "Không thể xoá đánh giá"
      );
    }
  }
}

export default new CustomerService();
