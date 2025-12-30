import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import dotenv from 'dotenv'; // Nhớ import dotenv

dotenv.config(); 

const User = db.User;

// --- 1. LOGIN ---
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    // Check pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    // Tạo Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'mat-khau-du-phong-neu-quen-env', // Ưu tiên lấy từ ENV
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

// --- 2. CREATE USER (Tạo nhân viên) ---
export const createUser = async (req, res) => {
  try {
    // Check an toàn
    if (!req.user) {
        return res.status(401).json({ message: "Chưa xác thực!" });
    }

    const creatorRole = req.user.role; 
    const { username, password, role, full_name } = req.body;

    // Validation đầu vào
    if (!username || !password || !role) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    // PHÂN QUYỀN
    // Chỉ Super Admin hoặc Admin mới được tạo
    if (creatorRole !== 'super_admin' && creatorRole !== 'admin') {
       return res.status(403).json({ message: "Bạn không có quyền tạo tài khoản!" });
    }
    
    // Admin không được tạo Admin khác hoặc Super Admin
    if (creatorRole === 'admin' && (role === 'admin' || role === 'super_admin')) {
        return res.status(403).json({ message: "Admin chỉ được tạo nhân viên (Waiter/Kitchen)!" });
    }

    // Check trùng username
    const existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) return res.status(400).json({ message: "Username đã tồn tại" });

    // Hash pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Lưu DB
    const newUser = await db.User.create({
      username,
      password: hashedPassword,
      role, 
      full_name
    });

    // Trả về user mới (nhưng đừng trả password về nhé, bảo mật)
    res.status(201).json({ 
        message: "Tạo tài khoản thành công", 
        user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            full_name: newUser.full_name
        } 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Chỉ cho phép Super Admin xem
    if (role !== 'super_admin') {
      return res.status(403).json({ message: "Chỉ Super Admin mới có quyền này!" });
    }

    // Lọc: Chỉ lấy những user có role là 'admin' (Chủ nhà hàng)
    // Nếu bạn muốn hiện cả Super Admin khác thì dùng [Op.or] hoặc điều chỉnh sau
    const users = await db.User.findAll({
      where: { role: 'admin' }, 
      attributes: ['id', 'username', 'full_name', 'role', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};