// services/orderItem.service.js
import db from '../models/index.js'; // [FIX] Import từ db chung để nhận diện quan hệ

class OrderItemService {
  /**
   * Tạo mới một chi tiết đơn hàng
   */
  async createOrderItem(data) {
    const { order_id, menu_item_id, quantity, price_at_order, notes } = data;

    // [FIX] Dùng db.OrderItem thay vì import lẻ
    const newItem = await db.OrderItem.create({
      order_id,
      menu_item_id,
      quantity: quantity || 1,
      price_at_order: price_at_order || 0,
      notes: notes || null
    });

    return {
      id: newItem.id,
      order_id: newItem.order_id,
      menu_item_id: newItem.menu_item_id,
      price_at_order: newItem.price_at_order,
      quantity: newItem.quantity,
      subtotal: newItem.quantity * parseFloat(newItem.price_at_order),
      notes: newItem.notes || ''
    };
  }

  /**
   * Lấy danh sách món ăn theo Order ID và format dữ liệu
   */
  async getItemsByOrderId(orderId) {
    const items = await db.OrderItem.findAll({
      where: { order_id: orderId },
      include: [{
        model: db.MenuItem,
        as: 'menuItem', // [FIX] Phải khớp với 'as' trong models/index.js
        attributes: ['name']
      }]
    });

    return items.map(item => {
      const price = parseFloat(item.price_at_order) || 0;
      const qty = parseInt(item.quantity) || 0;

      // [FIX] Alias ở trên là 'menuItem' thì ở dưới gọi item.menuItem
      return {
        id: item.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menuItem ? item.menuItem.name : 'Món ăn không tồn tại',
        price_at_order: price,
        quantity: qty,
        subtotal: qty * price,
        notes: item.notes || ''
      };
    });
  }
}

export default new OrderItemService();