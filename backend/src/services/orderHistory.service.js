// src/services/orderHistory.service.js
import Order from "../models/order.js";
import db from '../models/index.js';

const OrderService = {
  async createOrder({ customer_id, table_id, total_amount, items, note }) {
    console.log("🚀 Start creating full order...");
    
    // 1. Khởi tạo Transaction
    const transaction = await db.sequelize.transaction();
    let calculatedTotal = 0; // Biến tính tổng tiền Backend

    try {
      // A. Tạo vỏ Order (Tạm để total = 0)
      const newOrder = await db.Order.create({
        customer_id: customer_id || null,
        table_id,
        total_amount: 0, 
        note: note || '',
        status: 'pending',
        ordered_at: new Date()
      }, { transaction });

      // B. Xử lý danh sách items
      if (items && items.length > 0) {
        for (const item of items) {
          // 1. Tra giá gốc từ DB (Bảo mật)
          const menuItem = await db.MenuItem.findByPk(item.id);
          if (!menuItem) throw new Error(`Món ăn ID ${item.id} không tồn tại`);

          const itemPrice = Number(menuItem.price);
          let itemModifiersTotal = 0; // Tổng tiền topping của món này

          // 2. Tạo OrderItem
          const newOrderItem = await db.OrderItem.create({
            order_id: newOrder.id,
            menu_item_id: item.id,
            quantity: item.quantity || 1,
            price_at_order: itemPrice, // ✅ Giá gốc từ DB
            notes: item.notes || '',
            status: 'pending'
          }, { transaction });

          // 3. Xử lý Modifiers (Lưu giá Snapshot)
          if (item.modifiers && item.modifiers.length > 0) {
             const modifierRecords = item.modifiers.map(mod => {
                const modPrice = Number(mod.price || mod.price_adjustment || 0);
                itemModifiersTotal += modPrice; // Cộng dồn tiền topping

                return {
                    order_item_id: newOrderItem.id,
                    modifier_option_id: mod.id || mod.optionId,
                    price: modPrice // ✅ Lưu giá snapshot
                };
             });

             await db.OrderItemModifier.bulkCreate(modifierRecords, { transaction });
          }

          // 4. [QUAN TRỌNG] Cộng vào tổng tiền đơn hàng
          // (Giá món + Topping) * Số lượng
          calculatedTotal += (itemPrice + itemModifiersTotal) * (item.quantity || 1);
        }
      }

      // C. Cập nhật lại Total Amount vào Order
      newOrder.total_amount = calculatedTotal;
      await newOrder.save({ transaction });

      // D. Lưu tất cả xuống DB
      await transaction.commit();
      console.log(`✅ Order created successfully ID: ${newOrder.id}. Total: ${calculatedTotal}`);

      // E. Trả về dữ liệu (Dùng đúng hàm bạn yêu cầu)
      // Lưu ý: Nếu hàm này bị lỗi, Catch bên dưới sẽ bắt được, 
      // nhưng vì đã commit rồi nên ta phải chặn rollback.
      return await this.getOrderById(customer_id, newOrder.id);

    } catch (error) {
      // ⚠️ [FIX LỖI TRANSACTION CANNOT ROLLBACK]
      // Chỉ rollback nếu transaction chưa kết thúc (chưa commit)
      if (!transaction.finished) {
          await transaction.rollback();
          console.log("Reverted transaction due to error.");
      }
      
      console.error("❌ Error creating full order:", error.message);
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
        // ✅ Nếu không có customerId (guest/table query) -> chỉ dùng orderId
        const whereClause = customerId 
          ? { customer_id: customerId, id: orderId }
          : { id: orderId };

        console.log("🔍 [SERVICE DEBUG] getOrderById where:", whereClause);

        const order = await Order.findOne({
          where: whereClause,
          include: [
            {
              association: 'table',
              attributes: ['id', 'table_number']
            },
            {
              association: "items",
              attributes: ["id", "quantity", "price_at_order", "notes", "status", "reject_reason"], 
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

        console.log("📦 [SERVICE DEBUG] Order found:", order ? `ID ${order.id}, status: ${order.status}` : "null");
        return order;
      } catch (error) {
        console.error("OrderService: Error getting order details:", error.message);
        throw error;
      }
    },
  };

export default OrderService;