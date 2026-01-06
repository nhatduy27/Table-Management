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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "order_items",
    modelName: "OrderItem",
    timestamps: false, // Giữ false nếu bạn không cần created_at cho từng item
    underscored: true,
  }
);

// Định nghĩa associate theo form của ModifierOption
OrderItem.associate = (models) => {
  // Quan hệ với đơn hàng
  OrderItem.belongsTo(models.Order, {
    foreignKey: "order_id",
    as: "order",
  });

  // Quan hệ với món ăn
  OrderItem.belongsTo(models.MenuItem, {
    foreignKey: "menu_item_id",
    as: "menu_item",
    constraints: false,
  });

  // Quan hệ với OrderItemModifier
  OrderItem.hasMany(models.OrderItemModifier, {
    foreignKey: "order_item_id",
    as: "modifiers",
  });
};

export default OrderItem;
