import Table from '../models/table.js';
import { Op } from 'sequelize';

export class TableService {
  /**
   * Tạo bàn mới
   */
  static async create(data) {
    // Kiểm tra trùng table_number
    const existingTable = await Table.findOne({ 
      where: { table_number: data.table_number } 
    });
    
    if (existingTable) {
      throw new Error('Table number already exists');
    }
    
    return await Table.create({
      table_number: data.table_number,
      capacity: data.capacity,
      location: data.location || null,
      description: data.description || null,
      status: data.status || 'active'
    });
  }

  /**
   * Cập nhật bàn
   */
  static async update(id, data) {
    // 1. Tìm bàn cần cập nhật
    const table = await Table.findByPk(id);
    
    if (!table) {
      throw new Error('Table not found');
    }
    
    // 2. Kiểm tra xem có dữ liệu để cập nhật không
    if (Object.keys(data).length === 0) {
      throw new Error('No data provided for update');
    }
    
    // 3. Kiểm tra trùng table_number (nếu có thay đổi)
    if (data.table_number && data.table_number !== table.table_number) {
      const existingTable = await Table.findOne({
        where: {
          table_number: data.table_number,
          id: { [Op.ne]: id } // Không tính bản thân
        }
      });
      
      if (existingTable) {
        throw new Error('Table number already exists');
      }
    }
    
    // 4. Cập nhật bàn
    await table.update(data);
    return await Table.findByPk(id); // Fetch lại để có dữ liệu mới nhất
  }

  /**
   * Cập nhật chỉ trạng thái bàn
   */
  static async updateStatus(id, status) {

    const table = await Table.findByPk(id);
    
    if (!table) {
      throw new Error('Table not found');
    }
    
    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      throw new Error('Invalid status value');
    }
    await table.update({ status });
    return table;
  }

  /**
   * Validate dữ liệu bàn
   */
  static validateTableData(data, isUpdate = false) {
    const errors = [];
    
    // Validate capacity
    if (!isUpdate || data.capacity !== undefined) {
      if (data.capacity !== undefined) {
        if (data.capacity < 1 || data.capacity > 20) {
          errors.push('Capacity must be between 1 and 20');
        }
      }
    }
    
    // Validate table_number (chỉ cho create, hoặc update nếu có thay đổi)
    if (!isUpdate || data.table_number !== undefined) {
      if (data.table_number !== undefined) {
        if (!data.table_number || data.table_number.trim() === '') {
          errors.push('Table number is required');
        }
        
        // Kiểm tra định dạng table_number
        const tableNumberRegex = /^[A-Za-z0-9-_]+$/;
        if (data.table_number && !tableNumberRegex.test(data.table_number)) {
          errors.push('Table number can only contain letters, numbers, hyphens and underscores');
        }
        
        if (data.table_number && data.table_number.length > 50) {
          errors.push('Table number cannot exceed 50 characters');
        }
      }
    }
    
    // Validate location
    if (data.location && data.location.length > 100) {
      errors.push('Location cannot exceed 100 characters');
    }
    
    // Validate status
    if (data.status && !['active', 'inactive'].includes(data.status)) {
      errors.push('Status must be either "active" or "inactive"');
    }
    
    return errors;
  }

  /**
   * Validate dữ liệu khi update (có thể thêm logic đặc biệt)
   */
  static async validateUpdateData(tableId, data) {
    const errors = this.validateTableData(data, true); // isUpdate = true
    
    // Có thể thêm logic validate đặc biệt cho update
    // Ví dụ: không cho đổi status thành inactive nếu bàn đang có khách
    if (data.status === 'inactive') {
      const table = await Table.findByPk(tableId);
      
      // Giả sử có thêm logic kiểm tra bàn đang có đơn hàng
      // if (table.hasActiveOrders) {
      //   errors.push('Cannot set table to inactive while it has active orders');
      // }
    }
    
    return errors;
  }

  /**
   * Lấy danh sách bàn (tùy chọn)
   */
  static async getAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.location) {
      where.location = filters.location;
    }
    
    if (filters.search) {
      where[Op.or] = [
        { table_number: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    return await Table.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Xóa bàn (tùy chọn)
   */
  static async delete(id) {
    const table = await Table.findByPk(id);
    
    if (!table) {
      throw new Error('Table not found');
    }

    //Logic trước khi xóa bảng
    
    await table.destroy();
    return { message: 'Table deleted successfully' };
  }
}