import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Kiểm tra môi trường
const isProduction = process.env.NODE_ENV === 'production';

console.log(`Initializing database connection for ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}...`);

// Khởi tạo Sequelize
let sequelize;

if (isProduction && process.env.DATABASE_URL) {
  // Production: Dùng DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
} else {
  // Development: Dùng separate credentials
  sequelize = new Sequelize(
    process.env.DB_NAME || 'table_management',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'your_password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
    if (isProduction) {
      console.log('SSL Configuration: require=true, rejectUnauthorized=false');
    } else {
      console.log(`Connected to: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
    }
    return sequelize;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// Kết nối
connectDB().catch(err => {
  console.error('FATAL: Cannot connect to database:', err.message);
  console.error('Please check your .env file and database configuration');
});

export default sequelize;