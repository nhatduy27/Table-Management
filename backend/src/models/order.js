// src/models/order.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "customers",
        key: "uid",
      },
    },

    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tables",
        key: "id",
      },
    },
    // Tổng tiền món (Chưa tính thuế, chưa giảm giá)
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },

    // Tiền thuế (VAT...)
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },

    // Loại giảm giá (Phần trăm hoặc Số tiền cố định)
    discount_type: {
      type: DataTypes.ENUM('percent', 'fixed'),
      allowNull: true, 
    },

    // Giá trị giảm (Ví dụ: 10 (nếu là %), hoặc 50000 (nếu là fixed))
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },

    // Ghi chú hóa đơn (VD: Voucher sinh nhật, Khách quen...)
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Tổng tiền cuối cùng khách phải trả (= Subtotal + Tax - Discount)
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },

    // --- SỬA LẠI ĐOẠN NÀY (Chỉ giữ 1 cái status duy nhất) ---
    status: {
      type: DataTypes.ENUM(
        "pending",    // Khách vừa đặt
        "confirmed",  // [MỚI] Waiter đã xác nhận -> Chuyển xuống bếp
        "preparing",  // Bếp đang nấu
        "ready",      // Bếp nấu xong
        "served",     // Đã mang ra bàn
        "payment_request",  // 1. Khách bấm gọi thanh toán (Waiter nhận thông báo)
        "payment_pending",
        "completed",  // Đã thanh toán xong
        "cancelled"   // Đã hủy
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    // -------------------------------------------------------

    ordered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    payment_method: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['cash', 'momo', 'vnpay', 'zalopay', 'stripe']]
      }
    },

    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["customer_id"],
      },
      {
        fields: ["table_id"],
      },
      {
        fields: ["ordered_at"],
      },
      { 
        fields: ["status"] 
      },
    ],
  }
);

Order.associate = (models) => {
  Order.belongsTo(models.Table, { 
    foreignKey: 'table_id', 
    as: 'table' 
  });

  Order.hasMany(models.OrderItem, { 
    foreignKey: 'order_id', 
    as: 'items' 
  });
};

export default Order;