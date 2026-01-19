import express from 'express';
import { login, createUser, getAllUsers, updateUser, toggleUserStatus } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/create-user', verifyToken, createUser);
router.get('/users', verifyToken, getAllUsers);
router.put('/users/:id', verifyToken, updateUser);     
router.patch('/users/:id/status', verifyToken, toggleUserStatus);

export default router;