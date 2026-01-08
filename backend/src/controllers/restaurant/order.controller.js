// controllers/restaurant/order.controller.js
import db from '../../models/index.js';

// GET: /api/admin/orders
export const getAllOrders = async (req, res) => {
    try {
        // Lấy tất cả đơn hàng, sắp xếp mới nhất lên đầu (hoặc cũ nhất tùy bạn)
        const orders = await db.Order.findAll({
            include: [
                { 
                    model: db.Table, 
                    as: 'table',
                    attributes: ['id', 'table_number'] // Lấy số bàn
                },
                { 
                    model: db.OrderItem, 
                    as: 'items',
                    include: [
                        { 
                            model: db.MenuItem, 
                            as: 'menuItem',
                            attributes: ['name', 'price'] // Lấy thông tin món
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']] // Đơn mới nhất nằm trên cùng
        });

        return res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get All Orders Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy danh sách đơn hàng' 
        });
    }
};

// PUT: /api/admin/orders/:orderId/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // status nhận được: 'preparing', 'completed', 'cancelled'...

        // 1. Tìm đơn hàng
        const order = await db.Order.findByPk(orderId, {
            include: [
                { 
                    model: db.OrderItem, 
                    as: 'items',
                    include: [{ model: db.MenuItem, as: 'menuItem' }]
                },
                { model: db.Table, as: 'table' } // Cần lấy bàn để biết bắn socket đi đâu
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // 2. Cập nhật trạng thái
        order.status = status;
        await order.save();

        // 3. [QUAN TRỌNG] Bắn Socket để cập nhật Real-time
        
        // A. Báo cho KHÁCH HÀNG (để điện thoại khách đổi màu tracking)
        // Sự kiện này phải khớp với cái Frontend khách đang nghe: `order_update_table_${tableId}`
        if (order.table_id) {
            req.io.emit(`order_update_table_${order.table_id}`, order);
            console.log(`>>> Socket sent to Customer Table ${order.table_id}: Status ${status}`);
        }

        // B. Báo cho các WAITER KHÁC (để đồng bộ dashboard)
        req.io.emit('order_status_updated', order);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: order
        });

    } catch (error) {
        console.error('Update Order Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};