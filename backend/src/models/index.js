// src/models/index.js
import sequelize from '../config/database.js';

// 1. Import ĐẦY ĐỦ các model
import User from './user.js';
import Table from './table.js';
import MenuCategory from './menuCategory.js';
import MenuItem from './menuItem.js';
import MenuItemPhoto from './menuItemPhoto.js';
import ModifierGroup from './modifierGroup.js';
import ModifierOption from './modifierOption.js';
import MenuItemModifierGroup from './menuItemModifierGroup.js';
import Order from './order.js';      
import OrderItem from './orderItem.js'; 

// 2. Gom vào object db
const db = {
  sequelize,
  User,
  Table,
  MenuCategory,
  MenuItem,
  MenuItemPhoto,
  ModifierGroup,
  ModifierOption,
  MenuItemModifierGroup,
  Order,     
  OrderItem  
};

// 3. CHẠY VÒNG LẶP LIÊN KẾT (Magic Loop)
// (Chạy các hàm associate nếu đã được định nghĩa trong từng file Model)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ============================================================
// 4. [QUAN TRỌNG] ĐỊNH NGHĨA QUAN HỆ CỨNG (MANUAL ASSOCIATIONS)
// Để đảm bảo Controller hoạt động kể cả khi bạn quên viết associate trong Model
// ============================================================

// --- Quan hệ: Order - Table ---
// Một Bàn có nhiều Order
Table.hasMany(Order, { foreignKey: 'table_id' });
// Một Order thuộc về một Bàn (QUAN TRỌNG: để lấy tên bàn hiển thị lên Waiter)
Order.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

// --- Quan hệ: Order - OrderItem ---
// Một Order có nhiều món
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
// Một món thuộc về Order
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// --- Quan hệ: OrderItem - MenuItem ---
// Một Item trong đơn hàng liên kết với Menu gốc (để lấy tên món, ảnh...)
MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id' });
// (QUAN TRỌNG: alias 'menuItem' phải khớp với include trong Controller)
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menuItem' });

// ============================================================

export default db;