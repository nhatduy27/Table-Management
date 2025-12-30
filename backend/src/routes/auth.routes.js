import express from 'express';
import { login, createUser, getAllUsers } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/create-user', verifyToken, createUser);
router.get('/users', verifyToken, getAllUsers);

export default router;