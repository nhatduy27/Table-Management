// src/routes/customer/index.js
import express from "express";
import verifyQRTokenMiddleware from "../../middlewares/verifyQRToken.middleware.js";
import guestMenuRoutes from "./guestMenu.routes.js";
import customerAuthRoutes from "./customerAuth.routes.js";
import orderHistoryRoutes from "./orderHistory.routes.js";
import orderItemRoutes from "./orderItem.routes.js";
import paymentRoutes from "./payment.routes.js";
import tableRoutes from "./table.routes.js";
import reviewRoutes from "./review.routes.js";

const router = express.Router();

// 1. Customer Auth & Info (routes trực tiếp tại /customer/*)
// VD: /customer/register, /customer/login, /customer/me, ...
router.use("/", customerAuthRoutes);

// 2. Table routes
// VD: /customer/tables/:tableId/active-order
router.use("/tables", tableRoutes);

// 3. Reviews
// VD: /customer/reviews, /customer/reviews/menu-item/:menuItemId, ...
router.use("/reviews", reviewRoutes);

// 4. Payment (PHẢI ĐẶT TRƯỚC orderHistoryRoutes để tránh conflict path)
// VD: /customer/orders/:orderId/request-payment, /customer/payment/vnpay-callback, ...
router.use("/", paymentRoutes);

// 5. Orders: Khớp với API GET /api/customer/orders
// VD: /customer/orders, /customer/orders/:id
router.use("/orders", orderHistoryRoutes);

// 6. Order Items: Khớp với API POST /api/customer/order-items
// VD: /customer/order-items, /customer/order-items/order/:orderId
router.use("/order-items", orderItemRoutes);

// 7. Guest Menu (cần QR Token)
// VD: /menu (sẽ được mount từ routes/index.js với path /menu)
// Export riêng để mount ở ngoài vì path khác (/menu thay vì /customer/menu)
export { guestMenuRoutes, verifyQRTokenMiddleware };

export default router;
