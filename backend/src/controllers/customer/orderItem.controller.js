// src/controllers/client/orderItem.controller.js
import OrderItemService from "../../services/orderItem.service.js";
import db from '../../models/index.js';
const { Order, OrderItem, OrderItemModifier, MenuItem, ModifierOption, Table } = db;

// POST: Tạo mới OrderItem (Khách gọi thêm 1 món lẻ)
export const createOrderItem = async (req, res) => {
    try {
        const { order_id, menu_item_id } = req.body;

        // 1. Validate cơ bản
        if (!order_id || !menu_item_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu order_id hoặc menu_item_id'
            });
        }

        // 2. Gọi Service tạo món (Lưu ý: Service này phải xử lý việc lưu status='pending')
        // Nếu Service chưa xử lý Modifiers, bạn nên cân nhắc chuyển logic tạo vào đây hoặc update Service
        const result = await OrderItemService.createOrderItem(req.body);

        // 3. [QUAN TRỌNG] Lấy lại toàn bộ thông tin đơn hàng để bắn Socket
        // Phải lấy đủ: Table, Items, MenuItem, Modifiers
        const fullOrder = await Order.findOne({
            where: { id: order_id },
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
                            as: 'menu_item', // SỬA LẠI: Phải khớp với model (menu_item)
                            attributes: ['name', 'price']
                        },
                        // 👇 THÊM: Lấy Modifier để Waiter biết khách chọn gì
                        {
                            model: OrderItemModifier,
                            as: 'modifiers',
                            include: [{
                                model: ModifierOption,
                                as: 'modifier_option',
                                attributes: ['name', 'price_adjustment']
                            }]
                        }
                    ]
                }
            ]
        });

        if (fullOrder) {
            // 4. Bắn Socket cho Waiter
            // Frontend WaiterDashboard đang lắng nghe sự kiện 'new_order_request' (hoặc 'new_order' tùy bạn thống nhất)
            // Gửi nguyên cục fullOrder, Frontend tự map sẽ chuẩn hơn là map tay ở đây
            
            req.io.emit('new_order_request', {
                ...fullOrder.toJSON(), // Chuyển sang JSON object thuần
                message: `Bàn ${fullOrder.table?.table_number} vừa gọi thêm món!`
            });
            
            console.log(`>>> Socket sent: new_order_request for Table ${fullOrder.table?.table_number}`);
        }

        res.status(201).json({
            success: true,
            message: 'Thêm món ăn thành công',
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