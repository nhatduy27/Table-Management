// src/models/menuItemReview.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class MenuItemReview extends Model {}

MenuItemReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    menu_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menu_items',
        key: 'id',
      },
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'uid',
      },
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_verified_purchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    admin_response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'menu_item_reviews',
    modelName: 'MenuItemReview',
    timestamps: false,
    underscored: true,
  }
);

MenuItemReview.associate = (models) => {
  // Belongs to Menu Item
  MenuItemReview.belongsTo(models.MenuItem, {
    foreignKey: 'menu_item_id',
    as: 'menu_item',
  });

  // Belongs to Customer (optional, can be anonymous)
  MenuItemReview.belongsTo(models.Customer, {
    foreignKey: 'customer_id',
    as: 'customer',
  });

  // Belongs to Order (for verified purchases)
  MenuItemReview.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order',
  });
};

export default MenuItemReview;
