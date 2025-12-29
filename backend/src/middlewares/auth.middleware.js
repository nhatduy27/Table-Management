import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  // Token gửi lên dạng: "Bearer eyJhbGci..."
  const token = tokenHeader && tokenHeader.split(' ')[1]; 

  if (!token) return res.status(401).json({ message: "Chưa đăng nhập (Thiếu Token)" });

  jwt.verify(token, process.env.JWT_SECRET || 'mat-khau-bi-mat-cua-admin', (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn" });
    
    req.user = user; // Gán thông tin user vào request để dùng ở bước sau
    next(); // Cho phép đi tiếp vào controller
  });
};