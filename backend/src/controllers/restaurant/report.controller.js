// src/controllers/restaurant/report.controller.js
import { Op } from 'sequelize';
import db from '../../models/index.js';

const { Order, OrderItem, MenuItem } = db;
const sequelize = db.sequelize;

// 1. Lấy thống kê nhanh (cho 4 cái thẻ trên cùng)
export const getDashboardStats = async (req, res) => {
  try {
    // Xác định khoảng thời gian "Hôm nay"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // A. Tổng doanh thu hôm nay (Chỉ tính đơn đã completed)
    const revenueToday = await Order.sum('total_amount', {
      where: {
        created_at: { [Op.between]: [startOfDay, endOfDay] },
        status: 'completed' 
      }
    });

    // B. Tổng số đơn hôm nay (Tính cả đơn đang phục vụ để biết độ bận rộn)
    const ordersToday = await Order.count({
      where: {
        created_at: { [Op.between]: [startOfDay, endOfDay] },
        status: { [Op.ne]: 'cancelled' } // Không tính đơn hủy
      }
    });

    // C. Số bàn đang hoạt động (Active Tables)
    const activeTables = await Order.count({
      distinct: true,
      col: 'table_id',
      where: {
        status: {
          [Op.in]: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'payment']
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueToday || 0,
        orders: ordersToday || 0,
        activeTables: activeTables || 0
      }
    });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thống kê' });
  }
};

// 2. Lấy dữ liệu biểu đồ doanh thu (Theo ngày)
export const getRevenueChart = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query; // Nhận yyyy-mm-dd

    // Query gom nhóm theo ngày
    // Lưu ý: Cú pháp DATE_TRUNC dành cho PostgreSQL. Nếu dùng MySQL thì cú pháp khác.
    const revenueData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'], // Lấy ngày
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'] // Tổng tiền
      ],
      where: {
        status: 'completed', // Chỉ tính tiền đơn đã xong
        created_at: {
          [Op.between]: [
            new Date(fromDate || new Date().setDate(new Date().getDate() - 7)), // Mặc định 7 ngày
            new Date(toDate || new Date())
          ]
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Logic quan trọng: Database sẽ không trả về những ngày doanh thu = 0.
    // Chúng ta cần code JS để "lấp đầy" những ngày đó bằng 0 để biểu đồ không bị gãy.
    
    // (Phần xử lý fill date sẽ làm ở Frontend hoặc Backend tùy chọn, 
    // ở đây trả về raw data cho đơn giản)

    res.status(200).json({
      success: true,
      data: revenueData
    });

  } catch (error) {
    console.error('Revenue Chart Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy biểu đồ' });
  }
};

// 3. Top món bán chạy
export const getTopSellingItems = async (req, res) => {
  try {
    const { fromDate, toDate, limit = 5 } = req.query;

    const topItems = await OrderItem.findAll({
      attributes: [
        'menu_item_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.literal('quantity * price_at_order')), 'total_revenue']
      ],
      include: [
        {
          model: MenuItem,
          as: 'menu_item',
          attributes: ['name']
        },
        {
          model: Order,
          as: 'order',
          attributes: [], // Không lấy field của Order, chỉ để filter
          where: {
            status: 'completed',
            created_at: {
                [Op.between]: [
                  new Date(fromDate || new Date().setDate(new Date().getDate() - 30)), 
                  new Date(toDate || new Date())
                ]
            }
          }
        }
      ],
      group: ['menu_item_id', 'menu_item.id'],
      order: [[sequelize.literal('total_quantity'), 'DESC']],
      limit: parseInt(limit),
      raw: true,
      nest: true // Để gom menu_item vào object con
    });

    // Format lại data cho đẹp
    const formattedData = topItems.map(item => ({
      name: item.menu_item?.name || 'Món đã xóa',
      value: parseInt(item.total_quantity),
      revenue: parseFloat(item.total_revenue)
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Top Items Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy top món' });
  }
};

export const getPeakHours = async (req, res) => {
  try {
    // BƯỚC 1: Lấy danh sách ngày tạo của tất cả đơn hàng (trừ đơn hủy)
    // Chúng ta không Group By ở Database nữa để tránh lỗi cú pháp
    const orders = await Order.findAll({
      attributes: ['created_at'],
      where: {
        status: { [Op.ne]: 'cancelled' }
      },
      raw: true
    });

    // BƯỚC 2: Xử lý đếm giờ bằng JavaScript
    // Tạo mảng 24 phần tử (tương ứng 0h -> 23h), mặc định = 0
    const hoursCount = Array(24).fill(0);

    orders.forEach(order => {
      if (order.created_at) {
        // Chuyển string ngày tháng thành đối tượng Date
        const date = new Date(order.created_at);
        
        // Lấy giờ (0-23) theo giờ của Server
        const hour = date.getHours(); 
        
        // Cộng thêm 1 vào khung giờ tương ứng
        if (hour >= 0 && hour < 24) {
            hoursCount[hour]++;
        }
      }
    });

    // BƯỚC 3: Format dữ liệu trả về cho Frontend
    // Kết quả sẽ dạng: [{ hour: 0, order_count: 5 }, { hour: 1, order_count: 2 }...]
    const finalData = hoursCount.map((count, index) => ({
      hour: index,       // Giờ (0, 1, 2...)
      order_count: count // Số lượng đơn
    }));

    res.status(200).json({ success: true, data: finalData });

  } catch (error) {
    console.error('❌ Error Peak Hours:', error); // In lỗi ra terminal để dễ debug
    res.status(500).json({ success: false, message: 'Lỗi lấy giờ cao điểm' });
  }
};