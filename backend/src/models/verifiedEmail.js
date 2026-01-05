import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class VerifiedEmail extends Model {}

VerifiedEmail.init(
  {
    // CÁCH 1: Xóa id field để Sequelize tự động sử dụng id từ database
    // Không định nghĩa id field - Sequelize sẽ tự động nhận id từ table
    
    customer_uid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'uid'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    otp_code: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    otp_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "verified_emails",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: (verifiedEmail) => {
        if (verifiedEmail.otp_code) {
          // Đảm bảo OTP là 6 chữ số
          verifiedEmail.otp_code = verifiedEmail.otp_code.padStart(6, '0');
        }
      }
    }
  }
);

export default VerifiedEmail;