import { Op } from 'sequelize';
import db from '../../models/index.js'; // Import từ index để đảm bảo các mối quan hệ (associations) được nạp
const { Order, OrderItem, MenuItem, OrderItemModifier, ModifierOption } = db;
import OrderHistoryService from '../../services/orderHistory.service.js';

// GET /api/customer/tables/:tableId/active-order
export const getTableActiveOrder = async (req, res) => {
  try {
    const { tableId } = req.params;
    console.log("🔍 [BACKEND DEBUG] Đang tìm active order cho table:", tableId);

    // 1. Chỉ tìm ID của đơn hàng Active
    const activeOrder = await Order.findOne({
      where: {
        table_id: tableId,
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      },
      attributes: ['id'] // Lấy mỗi ID cho nhẹ
    });

    console.log("📦 [BACKEND DEBUG] Kết quả query active order:", activeOrder ? `Order ID: ${activeOrder.id}` : "null");

    if (!activeOrder) {
      console.log("⚠️ [BACKEND DEBUG] Không tìm thấy active order");
      return res.status(200).json({
        success: true,
        data: null, // Trả về null nếu không có đơn
        message: 'No active order found'
      });
    }

    // 2. Gọi Service để lấy Full Data (Dạng Lồng Nested chuẩn)
    // Hàm này hôm nãy mình sửa trả về: item.menu_item, item.modifiers[].modifier_option...
    const fullOrderData = await OrderHistoryService.getOrderById(null, activeOrder.id);
    console.log("✅ [BACKEND DEBUG] Trả về full order data, status:", fullOrderData.status);

    res.status(200).json({
      success: true,
      data: fullOrderData,
      message: 'Active order retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get active order error:', error);
    res.status(500).json({ success: false, error: 'Failed to get active order' });
  }
};