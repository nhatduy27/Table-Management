import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import tableRoutes from '../routes/table.routes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', tableRoutes);



// Hàm check xem kết nối database có thành công không
app.get('/connected', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'Connected successfully',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('>>> Database connected successfully');
    
    await sequelize.sync({ alter: true });
    console.log('>>> Database synced');
    
    app.listen(PORT, () => {
      // SỬA: Dùng backtick `` thay vì dấu nháy đơn ''
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Connected check: http://localhost:${PORT}/connected`);
      console.log(`Tables API: http://localhost:${PORT}/api/admin/tables`);
    });
    
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();