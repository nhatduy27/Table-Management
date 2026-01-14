import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    menu_item_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price_at_order: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    // --- CẬP NHẬT PHẦN NÀY ---
    status: {
      type: DataTypes.ENUM(
        'pending',    // Mới đặt
        'confirmed',  // Waiter đã duyệt món này
        'preparing',  // Bếp đang làm
        'ready',      // Đã xong, chờ bưng
        'served',     // Đã lên bàn
        'cancelled'   // Hết món hoặc khách hủy
        // ❌ KHÔNG CÓ 'payment' và 'completed' ở Item level
        // Items kết thúc ở 'served', Order mới có 'payment'/'completed'
      ),
      defaultValue: 'pending',
      allowNull: false
    },
    // -------------------------
    
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reject_reason: {
      type: DataTypes.TEXT, // Lưu lý do từ chối (VD: "Hết hàng", "Khách đổi ý")
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "order_items",
    modelName: "OrderItem",
    timestamps: false, 
    underscored: true,
  }
);

OrderItem.associate = (models) => {
  // Thuộc về Order
  OrderItem.belongsTo(models.Order, { 
    foreignKey: 'order_id', 
    as: 'order' 
  });

  // Thuộc về Menu Item (Món gốc)
  OrderItem.belongsTo(models.MenuItem, { 
    foreignKey: 'menu_item_id', 
    as: 'menu_item',
    constraints: false 
  });

  // Có nhiều Modifier (Topping)
  OrderItem.hasMany(models.OrderItemModifier, {
    foreignKey: 'order_item_id',
    as: 'modifiers'
  });
};

export default OrderItem;