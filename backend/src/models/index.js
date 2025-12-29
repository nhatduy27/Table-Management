import sequelize from '../config/database.js'; // Connection

// 1. Import TẤT CẢ các model bạn đang có trong folder
import MenuCategory from './menuCategory.js';
import MenuItem from './menuItem.js';
import MenuItemPhoto from './menuItemPhoto.js';
import ModifierGroup from './modifierGroup.js';
import ModifierOption from './modifierOption.js';
import MenuItemModifierGroup from './menuItemModifierGroup.js'; // (Tên file đoán dựa trên ảnh)
import Table from './table.js';
import User from './user.js';

// 2. Gom lại vào object db
const db = {
  sequelize, // Instance kết nối
  User,
  MenuCategory,
  MenuItem,
  MenuItemPhoto,
  ModifierGroup,
  ModifierOption,
  MenuItemModifierGroup,
  Table
};

// 3. CHẠY VÒNG LẶP LIÊN KẾT (Magic Loop)
// Đoạn này sẽ tự động gọi hàm .associate() trong từng file model
// Giúp MenuItem tìm thấy Restaurant, Category tìm thấy MenuItem...
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;