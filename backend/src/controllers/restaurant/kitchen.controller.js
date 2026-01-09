// src/controllers/restaurant/kitchen.controller.js
import db from "../../models/index.js";

const { Order, OrderItem, Table, MenuItem, OrderItemModifier, ModifierOption } =
  db;

// Lấy danh sách orders cho Kitchen Display
export const getKitchenOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // Điều kiện lọc theo status
    let whereCondition = {
      status: ["pending", "confirmed", "preparing", "ready"],
    };

    if (status) {
      whereCondition.status = status.split(",");
    }

    const orders = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: Table,
          as: "table",
          attributes: ["id", "table_number", "location"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: MenuItem,
              as: "menu_item",
              attributes: ["id", "name", "prep_time_minutes"],
            },
            {
              model: OrderItemModifier,
              as: "modifiers",
              include: [
                {
                  model: ModifierOption,
                  as: "modifier_option",
                  attributes: ["id", "name", "price_adjustment"],
                },
              ],
            },
          ],
        },
      ],
      order: [["ordered_at", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("[Kitchen Controller] getKitchenOrders Error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách đơn hàng",
      message: error.message,
    });
  }
};

// Cập nhật status của order
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "payment",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Trạng thái không hợp lệ",
        validStatuses,
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy đơn hàng",
      });
    }

    // Cập nhật status
    order.status = status;

    // Nếu status là completed, cập nhật completed_at
    if (status === "completed" || status === "served") {
      order.completed_at = new Date();
    }

    await order.save();

    // Fetch updated order with associations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Table,
          as: "table",
          attributes: ["id", "table_number", "location"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: MenuItem,
              as: "menu_item",
              attributes: ["id", "name", "prep_time_minutes"],
            },
            {
              model: OrderItemModifier,
              as: "modifiers",
              include: [
                {
                  model: ModifierOption,
                  as: "modifier_option",
                  attributes: ["id", "name", "price_adjustment"],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành "${status}"`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("[Kitchen Controller] updateOrderStatus Error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi khi cập nhật trạng thái đơn hàng",
      message: error.message,
    });
  }
};

// Lấy thống kê cho Kitchen Display
export const getKitchenStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pending, preparing, ready, completedToday] = await Promise.all([
      Order.count({ where: { status: ["pending", "confirmed"] } }),
      Order.count({ where: { status: "preparing" } }),
      Order.count({ where: { status: "ready" } }),
      Order.count({
        where: {
          status: ["completed", "served"],
          completed_at: {
            [db.sequelize.Sequelize.Op.gte]: today,
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        pending,
        preparing,
        ready,
        completedToday,
      },
    });
  } catch (error) {
    console.error("[Kitchen Controller] getKitchenStats Error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thống kê",
      message: error.message,
    });
  }
};
