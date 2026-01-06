import sequelize from "../config/database.js";

// 1. Import ĐẦY ĐỦ các model
import User from "./user.js";
import Table from "./table.js";
import MenuCategory from "./menuCategory.js";
import MenuItem from "./menuItem.js";
import MenuItemPhoto from "./menuItemPhoto.js";
import ModifierGroup from "./modifierGroup.js";
import ModifierOption from "./modifierOption.js";
import MenuItemModifierGroup from "./menuItemModifierGroup.js";
import Order from "./order.js"; // <--- THÊM MỚI
import OrderItem from "./orderItem.js"; // <--- THÊM MỚI
import OrderItemModifier from "./orderItemModifier.js"; // <--- THÊM MỚI

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
  Order, // <--- ĐƯA VÀO ĐÂY
  OrderItem, // <--- ĐƯA VÀO ĐÂY
  OrderItemModifier, // <--- THÊM MỚI
};

// 3. CHẠY VÒNG LẶP LIÊN KẾT (Magic Loop)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
