// src/main.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import db từ index (đã bao gồm setup associations)
import db from '../models/index.js'; 

import tableRoutes from '../routes/table.routes.js'; 
import menuRoutes from '../routes/menu.routes.js'; 
import menuItemPhotoRoutes from '../routes/menuItemPhoto.routes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin/tables', tableRoutes);
app.use('/api/admin/menu', menuRoutes);
app.use('/api/admin/menu', menuItemPhotoRoutes); 

// Test routes
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
    await db.sequelize.authenticate();
    console.log('>>> Database connected successfully');
    
    // Sync database
    await db.sequelize.sync({ alter: true });
    console.log('>>> Database synced & Associations setup automatically');
    
    app.listen(PORT, () => {
      console.log(`>>> Server running at http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();