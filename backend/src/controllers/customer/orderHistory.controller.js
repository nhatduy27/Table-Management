import OrderService from "../../services/orderHistory.service.js";

import { createOrderSchema } from "../../validators/order.validation.js";


export const createOrder = async (req, res) => {
  try {
    const customerID = req.user?.id || req.user?.uid || null;
    const { error, value } = createOrderSchema.validate(req.body);

    if (error) {
      //Trả vè nếu có lỗi về kiểu dữ liệu
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const order = await OrderService.createOrder({
      customer_id: customerID,
      table_id: value.table_id,
      total_amount: value.total_amount,
      items: value.items, // <--- 🔥 QUAN TRỌNG: Phải truyền items xuống
      note: value.note || ""
    });

    if (req.io) {
        // Bắn tín hiệu chung "Có đơn mới"
        req.io.emit('new_order_created', order); 
        req.io.emit('order_status_updated', order);
        
        // Bắn riêng cho bàn đó (để máy khách tự cập nhật trạng thái "Đang chờ xác nhận")
        req.io.emit(`order_update_table_${value.table_id}`, {
            ...order.toJSON ? order.toJSON() : order, 
            status: 'pending'
        });
        
        console.log(`🔔 Socket sent: New Order for Table ${value.table_id}`);
    }

    return res.status(201).json({
      success: true,
      message: customerID
        ? "Đặt món thành viên thành công"
        : "Khách vãng lai đặt món thành công",
      data: order,
    });
  } catch (error) {
    console.error("[Order Controller Error]:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        message:
          "Mã bàn không tồn tại trong hệ thống. Vui lòng quét lại mã QR.",
      });
    }

    // Xử lý lỗi nếu cột customer_id trong DB chưa được chỉnh thành ALLOW NULL
    if (
      error.name === "SequelizeDatabaseError" &&
      error.message.includes("not-null")
    ) {
      return res.status(500).json({
        success: false,
        error: "Lỗi cấu trúc dữ liệu",
        message:
          "Hệ thống chưa cho phép khách vãng lai đặt món (Cột customer_id đang bắt buộc).",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Lỗi hệ thống",
      message: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const customerID = req.user?.uid || req.user?.id;

    //Chỉ có thể xem lại lịch sử nếu như khách hàng đã đăng nhập
    if (!customerID) {
      return res.status(401).json({
        success: false,
        error: "Vui lòng đăng nhập để xem lịch sử đơn hàng",
      });
    }

    const orders = await OrderService.getCustomerOrder(customerID, req.query);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const customerID = req.user?.uid || req.user?.id;
    const orderId = req.params.id;

    //Chỉ có thể xem lại lịch sử nếu như khách hàng đã đăng nhập
    if (!customerID) {
      return res.status(401).json({
        success: false,
        error: "Vui lòng đăng nhập để xem lịch sử đơn hàng",
      });
    }
    const order = await OrderService.getOrderById(customerID, orderId);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
