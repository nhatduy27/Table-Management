// src/models/menuItem.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class MenuItem extends Model {}

MenuItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menu_categories',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        len: [2, 80],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    prep_time_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 240,
      },
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'available',
      validate: {
        isIn: [['available', 'unavailable', 'sold_out']]  
      }
    },
    is_chef_recommended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'menu_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['restaurant_id'],
      },
      {
        fields: ['category_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['is_chef_recommended'],
      },
      {
        fields: ['is_deleted'],
      },
    ],
    defaultScope: {
      where: {
        is_deleted: false,
      },
    },
    scopes: {
      withDeleted: {
        where: {},
      },
      available: {
        where: {
          status: 'available',
          is_deleted: false,
        },
      },
      byRestaurant: (restaurantId) => ({
        where: {
          restaurant_id: restaurantId,
          is_deleted: false,
        },
      }),
    },
  }
);

MenuItem.associate = (models) => {
  MenuItem.belongsTo(models.Restaurant, {
    foreignKey: 'restaurant_id',
    as: 'restaurant',
  });
  
  MenuItem.belongsTo(models.MenuCategory, {
    foreignKey: 'category_id',
    as: 'category',
  });
  
  MenuItem.hasMany(models.MenuItemPhoto, {
    foreignKey: 'menu_item_id',
    as: 'photos',
    onDelete: 'CASCADE',
  });
  
  MenuItem.belongsToMany(models.ModifierGroup, {
    through: models.MenuItemModifierGroup,
    foreignKey: 'menu_item_id',
    otherKey: 'group_id',
    as: 'modifierGroups',
  });
};

export default MenuItem;