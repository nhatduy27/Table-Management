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
import OrderItemModifier from "./orderItemModifier.js";

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
  OrderItem,
  OrderItemModifier, 
};

// 3. CHẠY VÒNG LẶP LIÊN KẾT (Magic Loop)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
