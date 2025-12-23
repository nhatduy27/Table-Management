//src//models//restaurant.js
//File định nghĩa bảng dữ liệu NHÀ HÀNG trong hệ thống quản lý bàn ăn
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Restaurant extends Model {}

Restaurant.init(
    {
        id: {  // id (Khóa chính)
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: { // tên nhà hàng
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        address: { // địa chỉ nhà hàng
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        phone: { // số điện thoại liên hệ
            type: DataTypes.STRING(20),
            allowNull: true,
        },

        email: { // email liên hệ
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        status: { // trạng thái nhà hàng (active/inactive)
            type: DataTypes.STRING(20),
            defaultValue: 'active',
            validate: {
                isIn: [['active', 'inactive']]  // Vẫn validate giá trị
            }
        },
    },
    {
        sequelize,
        tableName: 'restaurants',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Restaurant.associate = (models) => {

    // Quan hệ 1-N với bảng Table, MenuCategory, MenuItem, ModifierGroup
    Restaurant.hasMany(models.Table, { 
        foreignKey: 'restaurant_id',
        as: 'tables',
        onDelete: 'CASCADE', // Khi xóa nhà hàng, xóa luôn bàn liên quan
        onUpdate: 'CASCADE', // Khi cập nhật id nhà hàng, cập nhật luôn khóa ngoại trong bảng bàn
    });

    Restaurant.hasMany(models.MenuCategory, {
        foreignKey: 'restaurant_id',
        as: 'menuCategories',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });

    Restaurant.hasMany(models.MenuItem, {
        foreignKey: 'restaurant_id',
        as: 'menuItems',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    
    Restaurant.hasMany(models.ModifierGroup, {
        foreignKey: 'restaurant_id',
        as: 'modifierGroups',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
};

export default Restaurant;
