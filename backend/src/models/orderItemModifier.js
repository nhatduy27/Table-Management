import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class OrderItemModifier extends Model {}

OrderItemModifier.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "order_items",
        key: "id",
      },
    },
    modifier_option_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "modifier_options",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "order_item_modifiers",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ["order_item_id"],
      },
      {
        fields: ["modifier_option_id"],
      },
    ],
  }
);

OrderItemModifier.associate = (models) => {
  // Quan hệ với OrderItem
  OrderItemModifier.belongsTo(models.OrderItem, {
    foreignKey: "order_item_id",
    as: "orderItem",
  });

  // Quan hệ với ModifierOption
  OrderItemModifier.belongsTo(models.ModifierOption, {
    foreignKey: "modifier_option_id",
    as: "modifierOption",
  });
};

export default OrderItemModifier;
