import db from '../models/index.js';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs'; // Tạm thời comment vì ta đang test pass '123456' thô

const User = db.User;

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Đang thử đăng nhập với:", username, password);

    // 1. Tìm user trong Database
    const user = await User.findOne({ where: { username } });

    // 2. Nếu không thấy user
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    // 3. Kiểm tra mật khẩu
    // LƯU Ý QUAN TRỌNG: Vì trong SQL bạn insert '123456' dạng thô (chưa mã hóa)
    // Nên ở đây ta so sánh trực tiếp. Khi nào làm thật sẽ dùng bcrypt.compare()
    if (user.password !== password) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    // 4. Nếu đúng hết -> Tạo Token (Vé vào cổng)
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Gói thông tin vào token
      'mat-khau-bi-mat-cua-admin',      // SECRET KEY (Nên để trong .env)
      { expiresIn: '24h' }              // Hết hạn sau 24h
    );

    // 5. Trả về cho Frontend
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