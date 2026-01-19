// middleware/orderItem.middleware.js

export const validateCreateOrderItem = (req, res, next) => {
  // Lấy data từ body
  const { order_id, items } = req.body;
  
  // 1. Kiểm tra order_id
  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin bắt buộc: order_id'
    });
  }

  // 2. Kiểm tra items (Phải là mảng và không rỗng)
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin bắt buộc: Danh sách món ăn (items) không hợp lệ'
    });
  }

  // 3. (Tùy chọn) Kiểm tra kỹ từng món trong mảng
  for (const item of items) {
      if (!item.menu_item_id || !item.quantity) {
          return res.status(400).json({
              success: false,
              message: 'Thiếu thông tin chi tiết trong món ăn (menu_item_id hoặc quantity)'
          });
      }
  }
  
  next();
};