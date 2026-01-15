// src/services/orderHistory.service.js
import Order from "../models/order.js";

const OrderService = {
  async createOrder(orderData) {
    try {
      console.log("OrderService: Creating order with data:", orderData);

      //Tạo dữ liệu cho order
      const order = await Order.create({
        customer_id: orderData.customer_id,
        table_id: orderData.table_id,
        total_amount: orderData.total_amount,
        ordered_at: orderData.ordered_at || new Date(),
      });
      console.log("OrderService: Order created successfully, ID:", order.id);
      return order;
    } catch (error) {
      console.error("OrderService: Error creating order:", error.message);
      throw error;
    }
  },

  async getCustomerOrder(customerId) {
    try {
      const orders = await Order.findAll({
        where: { customer_id: customerId },
        // 👇 THÊM ĐOẠN NÀY ĐỂ FRONTEND KHÔNG PHẢI GỌI API LẺ TẺ
        include: [
          {
            association: 'table', // Hoặc model: Table (tùy cách bạn setup relation)
            attributes: ['id', 'table_number'] // Chỉ lấy số bàn cho nhẹ
          }
        ],
        order: [["created_at", "DESC"]], // Nên dùng created_at hoặc ordered_at tùy DB
      });

      return orders;
    } catch (error) {
      console.error("OrderService: Error getting orders:", error.message);
      throw error;
    }
  },

  // 3. Lấy chi tiết đơn (🔥 ĐÃ SỬA: Kèm Topping & Giá)
  async getOrderById(customerId, orderId) {
      try {
        const order = await Order.findOne({
          where: {
            customer_id: customerId,
            id: orderId,
          },
          include: [
            {
              association: 'table',
              attributes: ['id', 'table_number']
            },
            {
              association: "items",
              attributes: ["id", "quantity", "price_at_order", "notes", "status"], 
              include: [
                {
                  association: "menu_item",
                  attributes: ["id", "name", "price"],
                },
                {
                  association: "modifiers",
                  include: ["modifier_option"]
                }
              ],
            },
          ],
        });
        return order;
      } catch (error) {
        console.error("OrderService: Error getting order details:", error.message);
        throw error;
      }
    },
  };

export default OrderService;
