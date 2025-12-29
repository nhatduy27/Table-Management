import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js'; // Import kết nối DB có sẵn của bạn

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Có thể null nếu khách chỉ quét QR không đăng nhập
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING, // <-- Đổi thành STRING cho khớp với Database
      defaultValue: 'customer',
      allowNull: false,
      validate: {
        // Vẫn giữ cái này để code tự kiểm tra, không cho nhập linh tinh
        isIn: [['super_admin', 'admin', 'waiter', 'kitchen', 'customer']],
      }
    },
  },
  {
    sequelize, // Truyền instance kết nối vào đây
    modelName: 'User',
    tableName: 'users', // Tên bảng trong DB
    timestamps: true,   // Bảng user thường cần created_at/updated_at
    underscored: true,  // Tự động chuyển camelCase thành snake_case
  }
);


export default User;