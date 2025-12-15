import {Sequelize } from 'sequelize';
import dotenv from 'dotenv'; //Dùng cái này để đọc biến môi trường 

dotenv.config(); //Load biến môi trường để 

const sequelize = new Sequelize(
  process.env.DB_NAME || 'restaurant_db',     // 1. Tên database
  process.env.DB_USER || 'admin',             // 2. Username
  process.env.DB_PASSWORD || 'admin123',      // 3. Password
  {                                           // 4. Cấu hình kết nối
    host: process.env.DB_HOST || 'localhost', // - Địa chỉ server
    port: parseInt(process.env.DB_PORT || '5432'), // - Port (5432 mặc định của PostgreSQL)
    dialect: 'postgres',                      // - Loại database
    logging: console.log,                     // - Hiện SQL query trong console
  }
);

export default sequelize; 
