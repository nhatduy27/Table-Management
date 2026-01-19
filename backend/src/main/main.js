// src/main.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // [NEW] Import HTTP module
import { Server } from 'socket.io';  // [NEW] Import Socket.IO

import db from '../models/index.js'; 
import rootRouter from '../routes/index.js';
import tablePublicRoutes from "../routes/restaurant/tablePublic.routes.js"

dotenv.config();

const app = express();
//app.use('/uploads', express.static('uploads'));
const PORT = process.env.PORT || 5000;

// [NEW] Setup HTTP Server & Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Cho phép Frontend (localhost:3000, etc) kết nối
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// [NEW] Middleware chèn biến 'io' vào mọi request
// Giúp bạn gọi req.io.emit() ở bất kỳ controller nào
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO Connection Events (Optional: Để debug)
io.on('connection', (socket) => {
  console.log('>>> A user connected via Socket:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('>>> User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/public', tablePublicRoutes);
app.use('/api', rootRouter);

// Test routes
app.get("/connected", (req, res) => {
  res.json({
    status: "OK",
    database: "Connected successfully",
    timestamp: new Date().toISOString(),
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
    
    // [CHANGED] Dùng httpServer.listen thay vì app.listen
    httpServer.listen(PORT, () => {
      console.log(`>>> Server running at http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();