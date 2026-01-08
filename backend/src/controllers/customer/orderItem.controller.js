import OrderItemService from "../../services/orderItem.service.js";
import db from '../../models/index.js';

// POST: Tạo mới OrderItem
export const createOrderItem = async (req, res) => {
    try {
        const { order_id, menu_item_id } = req.body;

        // Validate cơ bản tại controller
        if (!order_id || !menu_item_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu order_id hoặc menu_item_id'
            });
        }

        const result = await OrderItemService.createOrderItem(req.body);

        // 2. [NEW] Lấy thông tin chi tiết của Order để gửi Socket cho Waiter
        // (Chúng ta cần join bảng Tables và OrderItems để Waiter thấy tên bàn và món ăn)
        const fullOrder = await db.Order.findOne({
            where: { id: order_id },
            include: [
                { model: db.Table, as: 'table' }, // Giả sử bạn đã setup association 'table'
                { 
                    model: db.OrderItem, 
                    as: 'items',
                    include: [{ model: db.MenuItem, as: 'menuItem' }] // Để lấy tên món
                }
            ]
        });

        if (fullOrder) {
            // Format dữ liệu cho khớp với Frontend WaiterDashboard mong đợi
            const socketPayload = {
                _id: fullOrder.id,
                tableNumber: fullOrder.table ? fullOrder.table.table_number : 'Unknown', // Sửa 'number' theo tên cột thực tế trong bảng Table
                status: fullOrder.status || 'pending',
                totalAmount: fullOrder.total_amount,
                createdAt: fullOrder.createdAt,
                items: fullOrder.items.map(item => ({
                    name: item.menuItem ? item.menuItem.name : 'Món lạ',
                    quantity: item.quantity,
                    price: item.price_at_order || (item.menuItem ? item.menuItem.price : 0),
                    status: 'pending' // Món mới thêm
                }))
            };

            // [NEW] Bắn sự kiện sang Frontend
            req.io.emit('new_order', socketPayload);
            console.log(">>> Đã gửi socket new_order cho Waiter");
        }

        res.status(201).json({
            success: true,
            message: 'Thêm món ăn vào đơn hàng thành công',
            data: fullOrder
        });
    } catch (error) {
        console.error('Lỗi Controller Create:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm món ăn',
        });
    }
};

// GET: Lấy danh sách món ăn theo order_id
export const getOrderItemsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Gọi Service lấy dữ liệu
        const formattedItems = await OrderItemService.getItemsByOrderId(orderId);

        res.json({
            success: true,
            data: formattedItems
        });
    } catch (error) {
        console.error('Lỗi Controller GetItems:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chi tiết món ăn',
            error: error.message
        });
    }
};

