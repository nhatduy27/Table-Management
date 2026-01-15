// controllers/restaurant/order.controller.js
import db from '../../models/index.js';
import { Op } from 'sequelize';
const { Order, OrderItem, OrderItemModifier, MenuItem, ModifierOption, Table } = db;

// GET: /api/admin/orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                status: {
                    // Lấy tất cả ngoại trừ đơn đã xong (completed) và đã hủy (cancelled)
                    [Op.notIn]: ['completed', 'cancelled'] 
                }
            },
            include: [
                { 
                    model: Table, 
                    as: 'table',
                    attributes: ['id', 'table_number'] 
                },
                { 
                    model: OrderItem, 
                    as: 'items',
                    include: [
                        { 
                            model: MenuItem, 
                            as: 'menu_item', // Lưu ý: Alias phải khớp với model OrderItem (bạn đang để là 'menu_item')
                            attributes: ['name', 'price'] 
                        },
                        // 👇 MỚI: Lấy thêm Modifier để hiển thị (VD: Ít đường, Cay nhiều)
                        {
                            model: OrderItemModifier,
                            as: 'modifiers',
                            include: [
                                {
                                    model: ModifierOption,
                                    as: 'modifier_option',
                                    attributes: ['name', 'price_adjustment']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']] 
        });

        return res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get All Orders Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PUT: /api/admin/orders/:orderId/status
export const updateOrderStatus = async (req, res) => {
    try {
        // Route có thể dùng :id hoặc :orderId, support cả 2
        const orderId = req.params.orderId || req.params.id;
        const { status } = req.body;
        
        console.log('🔵 updateOrderStatus called:', { orderId, status });

        // 1. Tìm đơn hàng
        const order = await Order.findByPk(orderId);
        if (!order) {
            console.log('❌ Order not found:', orderId);
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        
        console.log('✅ Order found:', { id: order.id, currentStatus: order.status });

        // ==================================================================
        // 2. XỬ LÝ LOGIC TRẠNG THÁI (CORE LOGIC)
        // ==================================================================

        // Biến lưu trạng thái cuối cùng của Order (Mặc định là status gửi lên)
        let finalOrderStatus = status; 

        // ------------------------------------------------------------------
        // CASE A: WAITER DUYỆT ĐƠN (Confirmed)
        // ------------------------------------------------------------------
        if (status === 'confirmed') {
            await OrderItem.update(
                { status: 'confirmed' }, 
                { where: { order_id: orderId, status: 'pending' } }
            );
            // Waiter đã duyệt hết pending -> Order chắc chắn là confirmed
            finalOrderStatus = 'confirmed';
        }

        // ------------------------------------------------------------------
        // CASE B: BẾP NHẬN NẤU (Preparing) -> [LOGIC BẠN HỎI NẰM Ở ĐÂY]
        // ------------------------------------------------------------------
        else if (status === 'preparing') {
            // Bước 1: Chỉ chuyển những món Waiter ĐÃ DUYỆT (confirmed) sang preparing
            await OrderItem.update(
                { status: 'preparing' }, 
                { where: { order_id: orderId, status: 'confirmed' } }
            );
            finalOrderStatus = 'preparing';
        } 

        // ------------------------------------------------------------------
        // CASE C: BẾP BÁO XONG (Ready)
        // ------------------------------------------------------------------
        else if (status === 'ready') {
            await OrderItem.update(
                { status: 'ready' }, 
                { where: { order_id: orderId, status: 'preparing' } }
            );

            // 2. [LOGIC BẠN YÊU CẦU] Kiểm tra xem TẤT CẢ món đã ready chưa?
            const countNotReady = await OrderItem.count({
                where: { 
                    order_id: orderId, 
                    status: { [Op.notIn]: ['ready', 'cancelled', 'served'] }
                    // (Có thể loại trừ món cancelled nếu muốn)
                }
            });

            if (countNotReady === 0) {
                // Nếu không còn món nào chưa xong -> Vỏ Order mới được thành Ready
                finalOrderStatus = 'ready';
            } else {
                // Nếu vẫn còn món đang nấu/chờ -> Giữ nguyên trạng thái cũ (ví dụ Preparing)
                // Bếp chỉ update status từng món lẻ thôi.
                console.log("Chưa xong hết các món, không update Order Status");
                finalOrderStatus = order.status; // Giữ nguyên
            }
 
        }

        // [BỔ SUNG] CASE D: WAITER BƯNG MÓN (Served)
        // ------------------------------------------------------------------
        else if (status === 'served') {
            // Bước 1: Chỉ chuyển những món đang READY sang SERVED
            // (Món đang nấu 'preparing' hay đang chờ 'pending' thì KHÔNG được bưng)
            await OrderItem.update(
                { status: 'served' }, 
                { 
                    where: { 
                        order_id: orderId, 
                        status: 'ready' // Chỉ tác động vào món đã xong
                    } 
                }
            );

            // Bước 2: Kiểm tra xem ĐƠN HÀNG đã sạch bách chưa?
            // Đếm số lượng món CHƯA được phục vụ (Khác 'served' và khác 'cancelled')
            const countNotServed = await OrderItem.count({
                where: { 
                    order_id: orderId, 
                    status: { [Op.notIn]: ['served', 'cancelled'] } 
                }
            });

            // Bước 3: Quyết định trạng thái Order (Vỏ)
            if (countNotServed === 0) {
                // Nếu không còn món nào chưa bưng -> Order chính thức thành SERVED
                finalOrderStatus = 'served';
            } else {
                // Nếu vẫn còn món (đang nấu, đang chờ, hoặc đang ready mà chưa kịp bưng hết)
                // -> Giữ nguyên trạng thái cũ của Order (thường là 'ready' hoặc 'preparing')
                console.log("ℹ️ Vẫn còn món chưa phục vụ hết -> Order status giữ nguyên.");
                finalOrderStatus = order.status; 
            }
        }

        // ------------------------------------------------------------------
        // CASE D: HỦY ĐƠN (Cancelled)
        // ------------------------------------------------------------------
        else if (status === 'cancelled') {
            const { reason } = req.body;
            await OrderItem.update(
                { status: 'cancelled' }, 
                { where: { order_id: orderId } }
            );
            finalOrderStatus = 'cancelled';
        }
        
        // CASE E: THANH TOÁN (Payment/Completed)
        else if (status === 'payment') {
            // Chỉ đổi trạng thái để hiện thông báo cho Waiter
            // KHÔNG cập nhật completed_at
            finalOrderStatus = status;
        } 
        // Trường hợp 2: Waiter xác nhận thu tiền HOẶC Cổng thanh toán báo thành công
        else if (status === 'completed') {
            order.completed_at = new Date(); // Lúc này mới chốt thời gian thực tế
            finalOrderStatus = status;
        }

        // 3. LƯU TRẠNG THÁI ORDER (VỎ)
        // Dùng biến finalOrderStatus đã tính toán ở trên thay vì status gốc
        order.status = finalOrderStatus;
        await order.save();


        // 4. RELOAD & SOCKET (Giữ nguyên không đổi)
        const updatedOrder = await Order.findByPk(orderId, {
            include: [
                { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menu_item' }, { model: OrderItemModifier, as: 'modifiers', include: [{ model: ModifierOption, as: 'modifier_option' }] }] },
                { model: Table, as: 'table' }
            ]
        });

        if (updatedOrder.table_id) {
            req.io.emit(`order_update_table_${updatedOrder.table_id}`, updatedOrder);
        }
        req.io.emit('order_status_updated', updatedOrder);
        
        if (finalOrderStatus === 'confirmed') {
             req.io.emit('order_confirmed', updatedOrder);
        }

        return res.status(200).json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error('Update Order Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PUT: /api/admin/orders/items/:itemId/reject
export const rejectOrderItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { reason } = req.body; 

        // 1. Tìm món ăn
        const item = await OrderItem.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy món' });
        }

        // 2. Cập nhật trạng thái và Lý do vào cột riêng
        item.status = 'cancelled';
        item.reject_reason = reason; // ✅ Lưu vào cột mới
        await item.save();

        // 3. Lấy lại Order đầy đủ để bắn Socket
        // (Cần include lại để FE cập nhật ngay lập tức)
        const updatedOrder = await Order.findByPk(item.order_id, {
            include: [
                { 
                    model: OrderItem, as: 'items',
                    include: [{ model: MenuItem, as: 'menu_item' }, { model: OrderItemModifier, as: 'modifiers', include: ['modifier_option'] }]
                },
                { model: Table, as: 'table' }
            ]
        });

        // 4. Bắn Socket cập nhật UI cho tất cả (Waiter & Kitchen)
        if (req.io) {
            req.io.emit('order_status_updated', updatedOrder);
            if (updatedOrder.table_id) {
                req.io.emit(`order_update_table_${updatedOrder.table_id}`, updatedOrder);
            }
        }

        return res.json({ success: true, message: 'Đã từ chối món', data: updatedOrder });

    } catch (error) {
        console.error("Reject Item Error:", error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};