import OrderItem from "../models/orderItem.js";
import MenuItem from "../models/menuItem.js";
import OrderItemModifier from "../models/orderItemModifier.js";

class OrderItemService {
  /**
   * Tạo mới một chi tiết đơn hàng
   */
  async createOrderItem(data) {
    const {
      order_id,
      menu_item_id,
      quantity,
      price_at_order,
      notes,
      modifiers,
    } = data;

    const newItem = await OrderItem.create({
      order_id,
      menu_item_id,
      quantity: quantity || 1,
      price_at_order: price_at_order || 0,
      notes: notes || null,
    });

    // Nếu có modifiers, tạo các OrderItemModifier
    if (modifiers && Array.isArray(modifiers) && modifiers.length > 0) {
      const modifierRecords = modifiers.map((modifier) => ({
        order_item_id: newItem.id,
        modifier_option_id: modifier.optionId,
      }));

      await OrderItemModifier.bulkCreate(modifierRecords);
    }

    return {
      id: newItem.id,
      order_id: newItem.order_id,
      menu_item_id: newItem.menu_item_id,
      price_at_order: newItem.price_at_order,
      quantity: newItem.quantity,
      subtotal: newItem.quantity * parseFloat(newItem.price_at_order),
      notes: newItem.notes || "",
    };
  }

  /**
   * Lấy danh sách món ăn theo Order ID và format dữ liệu
   */
  async getItemsByOrderId(orderId) {
    const items = await OrderItem.findAll({
      where: { order_id: orderId },
      include: [
        {
          model: MenuItem,
          as: "menu_item",
          attributes: ["name"],
        },
      ],
    });

    return items.map((item) => {
      const price = parseFloat(item.price_at_order) || 0;
      const qty = parseInt(item.quantity) || 0;

      return {
        id: item.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item?.name || "Món ăn không tồn tại",
        price_at_order: price,
        quantity: qty,
        subtotal: qty * price,
        notes: item.notes || "",
      };
    });
  }
}

export default new OrderItemService();
