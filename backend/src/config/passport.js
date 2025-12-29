import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import db from '../models/index.js'; // Import db của bạn
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình: Token nằm ở đâu (Header) và Mã bí mật là gì
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'mat-khau-bi-mat-cua-admin', // Nên để trong .env
};

const passportConfig = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // Token giải mã ra được ID -> Tìm user trong DB
        const user = await db.User.findByPk(jwt_payload.id);
        
        if (user) {
          // Nếu tìm thấy, cho phép đi qua và gán thông tin vào req.user
          return done(null, user);
        }
        // Không tìm thấy user (hoặc user đã bị xóa)
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};

export default passportConfig;