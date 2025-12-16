import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('Initializing database connection for PRODUCTION...');

// Khởi tạo Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  

  dialectOptions: {
    ssl: {
      require: true,          
      rejectUnauthorized: false 
    }
  },

  logging: false, 
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
    console.log('SSL Configuration: require=true, rejectUnauthorized=false');
    return sequelize;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

// Kết nối
connectDB().catch(err => {
  console.error('FATAL: Cannot connect to database:', err.message);
});

export default sequelize;