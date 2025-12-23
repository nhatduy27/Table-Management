// src/models/menuCategory.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class MenuCategory extends Model {}

MenuCategory.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'menu_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['restaurant_id', 'name'],
      },
      {
        fields: ['restaurant_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['display_order'],
      },
    ],
  }
);

MenuCategory.associate = (models) => {
  MenuCategory.belongsTo(models.Restaurant, {
    foreignKey: 'restaurant_id',
    as: 'restaurant',
  });
  
  MenuCategory.hasMany(models.MenuItem, {
    foreignKey: 'category_id',
    as: 'menuItems',
    onDelete: 'CASCADE',
  });
};

export default MenuCategory;