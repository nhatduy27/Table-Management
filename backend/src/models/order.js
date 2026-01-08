// src/models/order.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true, //cho phép null trường hợp không đăng nhập
      references: {
        model: 'customers',
        key: 'uid'
      }
    },
   
    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tables',
        key: 'id'
      }
    },
    
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },

    status: {
      type: DataTypes.STRING(50), 
      defaultValue: 'pending',
      allowNull: false
    },
    
    ordered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Thời gian hoàn thành
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ['customer_id'] 
      },
      {
        fields: ['table_id']
      },
      {
        fields: ['ordered_at']
      }
    ]
  }
);

export default Order;