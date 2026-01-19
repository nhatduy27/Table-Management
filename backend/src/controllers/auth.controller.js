import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import dotenv from 'dotenv'; 
import { Op } from 'sequelize';

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

    // 🔥 [MỚI] Kiểm tra tài khoản có bị khóa không
    if (user.is_active === false) {
        return res.status(403).json({ message: "Tài khoản này đã bị vô hiệu hóa!" });
    }

    // Check pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    // Tạo Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
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

// --- 2. CREATE USER (Tạo Admin/Waiter/Kitchen) ---
export const createUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Chưa xác thực!" });

    const creatorRole = req.user.role; 
    const { username, password, role, full_name } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    // PHÂN QUYỀN
    if (creatorRole !== 'super_admin' && creatorRole !== 'admin') {
       return res.status(403).json({ message: "Bạn không có quyền tạo tài khoản!" });
    }
    
    // Admin không được tạo Admin khác hoặc Super Admin
    if (creatorRole === 'admin' && (role === 'admin' || role === 'super_admin')) {
        return res.status(403).json({ message: "Admin chỉ được tạo nhân viên (Waiter/Kitchen)!" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(400).json({ message: "Username đã tồn tại" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role, 
      full_name,
      is_active: true // Mặc định là active
    });

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

// --- 3. GET ALL USERS ---
export const getAllUsers = async (req, res) => {
  try {
    const currentUser = req.user; 
    let whereCondition = {};

    // Super Admin -> Xem danh sách Admin
    if (currentUser.role === 'super_admin') {
      whereCondition = { role: 'admin' };
    } 
    // Admin -> Xem danh sách Nhân viên
    else if (currentUser.role === 'admin') {
      whereCondition = { 
        role: { [Op.or]: ['waiter', 'kitchen'] } 
      };
    } 
    else {
      return res.status(403).json({ message: "Bạn không có quyền xem danh sách này!" });
    }

    const users = await User.findAll({
      where: whereCondition,
      // 🔥 [MỚI] Lấy thêm trường is_active để hiển thị trạng thái
      attributes: ['id', 'username', 'full_name', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. UPDATE USER (Sửa thông tin: Pass, Tên) ---
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, password } = req.body;
        const currentUser = req.user;

        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) return res.status(404).json({ message: "User not found" });

        // Logic quyền: Chỉ được sửa bản thân HOẶC cấp trên sửa cấp dưới
        const isSelf = currentUser.id === parseInt(id);
        const isSuperAdminEditingAdmin = currentUser.role === 'super_admin' && userToUpdate.role === 'admin';
        const isAdminEditingStaff = currentUser.role === 'admin' && ['waiter', 'kitchen'].includes(userToUpdate.role);

        if (!isSelf && !isSuperAdminEditingAdmin && !isAdminEditingStaff) {
            return res.status(403).json({ message: "Không có quyền sửa user này" });
        }

        // Cập nhật thông tin
        if (full_name) userToUpdate.full_name = full_name;
        
        // Nếu có đổi mật khẩu thì hash lại
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(password, salt);
        }

        await userToUpdate.save();

        res.status(200).json({ message: "Cập nhật thành công", user: userToUpdate });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 5. TOGGLE STATUS (Khóa/Mở khóa tài khoản) ---
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body; // true hoặc false
        const currentUser = req.user;

        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) return res.status(404).json({ message: "User not found" });

        // Logic quyền: Chỉ SuperAdmin khóa Admin, Admin khóa Staff
        const isSuperAdminEditingAdmin = currentUser.role === 'super_admin' && userToUpdate.role === 'admin';
        const isAdminEditingStaff = currentUser.role === 'admin' && ['waiter', 'kitchen'].includes(userToUpdate.role);

        if (!isSuperAdminEditingAdmin && !isAdminEditingStaff) {
            return res.status(403).json({ message: "Bạn không có quyền thay đổi trạng thái user này" });
        }

        userToUpdate.is_active = is_active;
        await userToUpdate.save();

        res.status(200).json({ 
            message: `Tài khoản đã được ${is_active ? 'Mở khóa' : 'Khóa'}`, 
            user: { id: userToUpdate.id, is_active: userToUpdate.is_active } 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};