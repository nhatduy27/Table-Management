// controllers/restaurant/order.controller.js
import db from '../../models/index.js';
const { Order, OrderItem, OrderItemModifier, MenuItem, ModifierOption, Table } = db;

// GET: /api/admin/orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
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
        const { orderId } = req.params;
        const { status } = req.body; // 'preparing', 'completed', 'cancelled', 'payment'...

        // 1. Tìm đơn hàng
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // 2. Cập nhật trạng thái Order (Vỏ ngoài)
        order.status = status;
        
        // Nếu là 'payment' hoặc 'completed' thì cập nhật giờ xong
        if (status === 'payment' || status === 'completed') {
            order.completed_at = new Date();
        }
        
        await order.save();

        // 3. [QUAN TRỌNG] Logic đồng bộ trạng thái món ăn (Items)
        // Khi Waiter bấm "Duyệt" (chuyển sang preparing), các món 'pending' phải chuyển theo.
        
        if (status === 'preparing') {
            await OrderItem.update(
                { status: 'preparing' }, 
                { 
                    where: { 
                        order_id: orderId, 
                        status: 'pending' // Chỉ duyệt những món đang chờ
                    } 
                }
            );
        } else if (status === 'completed' || status === 'cancelled') {
            // Nếu Hoàn tất hoặc Hủy đơn -> Tất cả món cũng xong/hủy theo
            await OrderItem.update(
                { status: status }, 
                { where: { order_id: orderId } }
            );
        }

        // 4. Lấy lại dữ liệu mới nhất (để gửi socket cho chuẩn)
        // Phải reload lại để lấy được status mới của items vừa update xong
        const updatedOrder = await Order.findByPk(orderId, {
            include: [
                { 
                    model: OrderItem, 
                    as: 'items',
                    include: [
                        { model: MenuItem, as: 'menu_item' },
                        {
                             model: OrderItemModifier,
                             as: 'modifiers',
                             include: [{ model: ModifierOption, as: 'modifier_option' }]
                        }
                    ]
                },
                { model: Table, as: 'table' }
            ]
        });

        // 5. Bắn Socket Real-time
        
        // A. Gửi cho Khách (Table)
        if (updatedOrder.table_id) {
            req.io.emit(`order_update_table_${updatedOrder.table_id}`, updatedOrder);
        }

        // B. Gửi cho Waiter/Kitchen (Reload dashboard)
        req.io.emit('order_status_updated', updatedOrder);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: updatedOrder
        });

    } catch (error) {
        console.error('Update Order Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PUT: /api/admin/order-items/:itemId/status
export const updateOrderItemStatus = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { status } = req.body; // 'preparing', 'ready', 'served'

        // 1. Update status của Item
        const item = await db.OrderItem.findByPk(itemId);
        if (!item) return res.status(404).json({message: 'Không tìm thấy món'});

        item.status = status;
        await item.save();

        // 2. Lấy lại Order cha để bắn socket (cho đồng bộ)
        const order = await db.Order.findByPk(item.order_id, {
             include: [
                { model: db.Table, as: 'table' },
                { 
                    model: db.OrderItem, 
                    as: 'items',
                    include: [
                        { model: db.MenuItem, as: 'menu_item' },
                        { model: db.OrderItemModifier, as: 'modifiers', include: ['modifier_option'] }
                    ]
                }
            ]
        });

        // 3. Bắn Socket
        req.io.emit('order_status_updated', order);
        req.io.emit(`order_update_table_${order.table_id}`, order);

        return res.json({ success: true, data: order });

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Lỗi server'});
    }
};