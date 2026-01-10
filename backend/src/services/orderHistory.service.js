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
      console.log("OrderService: Getting orders for customer:", customerId);

      const orders = await Order.findAll({
        where: {
          customer_id: customerId, //Tìm kiếm order theo customer
        },
        order: [["ordered_at", "DESC"]], //sắp xếp thứ tự mới nhất
      });

      return orders;
    } catch (error) {
      console.error("OrderService: Error getting orders:", error.message);
      throw error;
    }
  },

  async getOrderById(customerId, orderId) {
    try {
      const order = await Order.findOne({
        where: {
          customer_id: customerId, //Tìm kiếm order theo customer
          id: orderId,
        },
        include: [
          {
            association: "items",
            attributes: ["id", "quantity"],
            include: [
              {
                association: "menu_item",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });
      return order;
    } catch (error) {
      console.error("OrderService: Error getting orders:", error.message);
      throw error;
    }
  },
};

export default OrderService;
