// src/services/categoryService.js
import MenuCategory from '../models/menuCategory.js';
import MenuItem from '../models/menuItem.js';
import { Op } from 'sequelize';

export class CategoryService {
  
  static validateCategoryData(data, isUpdate = false) {
    const errors = [];
    
    // Validate name (bắt buộc cho create, optional cho update)
    if (!isUpdate || data.name !== undefined) {
      if (data.name !== undefined) {
        if (!data.name || data.name.trim() === '') {
          errors.push('Category name is required');
        } else {
          if (data.name.length < 2) {
            errors.push('Category name must be at least 2 characters');
          }
          if (data.name.length > 50) {
            errors.push('Category name cannot exceed 50 characters');
          }
        }
      } else if (!isUpdate) {
        errors.push('Category name is required');
      }
    }
    
    // Validate description
    if (data.description !== undefined) {
      if (data.description && data.description.length > 500) {
        errors.push('Description cannot exceed 500 characters');
      }
    }
    
    // Validate display_order
    if (data.display_order !== undefined) {
      if (typeof data.display_order !== 'number' || !Number.isInteger(data.display_order)) {
        errors.push('Display order must be an integer');
      } else if (data.display_order < 0) {
        errors.push('Display order cannot be negative');
      }
    }
    
    // Validate status
    if (data.status !== undefined) {
      if (!['active', 'inactive'].includes(data.status)) {
        errors.push('Status must be either "active" or "inactive"');
      }
    }
    
    return errors;
  }

  
  static async validateUpdateData(categoryId, data) {
    const errors = this.validateCategoryData(data, true); // isUpdate = true
    
    try {
      // 1. Kiểm tra category tồn tại
      const where = { id: categoryId };
      
      const category = await MenuCategory.findOne({ where });
      
      if (!category) {
        errors.push('Category not found');
        return errors; // Dừng ngay nếu không tìm thấy
      }
      
      // 2. Kiểm tra trùng tên (nếu có update name)
      if (data.name !== undefined && data.name.trim() !== category.name) {
        const duplicateCategory = await MenuCategory.findOne({
          where: {
            name: data.name.trim(),
            id: { [Op.ne]: categoryId }
          }
        });
        
        if (duplicateCategory) {
          errors.push(`Category "${data.name}" already exists in this restaurant`);
        }
      }
      
      // 3. Kiểm tra khi thay đổi status thành 'inactive'
      if (data.status === 'inactive' && category.status === 'active') {
        // Kiểm tra xem category có active items không
        const activeItemsCount = await MenuItem.count({
          where: {
            category_id: categoryId,
            status: 'available',
            is_deleted: false
          }
        });
        
        if (activeItemsCount > 0) {
          errors.push(`Cannot deactivate category. It contains ${activeItemsCount} active menu items.`);
        }
      }
      
      // 4. Kiểm tra khi thay đổi display_order
      if (data.display_order !== undefined && data.display_order !== category.display_order) {
        // Có thể kiểm tra display_order có hợp lệ trong context của restaurant không
        // Ví dụ: không cho phép vượt quá số lượng category
        
        if (data.display_order > maxDisplayOrder + 10) {
          errors.push(`Display order is too high. Maximum suggested: ${maxDisplayOrder + 1}`);
        }
      }
      
      // 6. Kiểm tra business rules khác (tuỳ yêu cầu)
      // Ví dụ: không cho phép đổi tên nếu category có quá nhiều items
      
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }
    
    return errors;
  }
  
  static async update(categoryId, data) {
    
    // Tìm category
    const where = { id: categoryId };
    
    const category = await MenuCategory.findOne({ where });
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Prepare update data
    const updateData = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description ? data.description.trim() : null;
    }
    
    if (data.display_order !== undefined) {
      updateData.display_order = data.display_order;
    }
    
    if (data.status !== undefined) {
      updateData.status = data.status;
      
      // Nếu deactivate category, có thể deactivate tất cả items
      if (data.status === 'inactive' && category.status === 'active') {
        // Tuỳ chọn: tự động set tất cả items thành unavailable
        await MenuItem.update(
          { status: 'unavailable' },
          {
            where: {
              category_id: categoryId,
              status: 'available'
            }
          }
        );
      }
      
      // Nếu activate category, có thể activate lại items
      if (data.status === 'active' && category.status === 'inactive') {
        // Tuỳ chọn: tự động set items thành available
        await MenuItem.update(
          { status: 'available' },
          {
            where: {
              category_id: categoryId,
              status: 'unavailable',
              is_deleted: false
            }
          }
        );
      }
    }
    
    // Cập nhật category
    await category.update(updateData);
    
    // Lấy lại category với thông tin đầy đủ
    const updatedCategory = await MenuCategory.findByPk(categoryId);
    
    // Lấy số lượng items để response
    const itemsCount = await MenuItem.count({
      where: { category_id: categoryId, is_deleted: false }
    });
    
    return {
      category: updatedCategory,
      metadata: {
        items_count: itemsCount,
        updated_fields: Object.keys(updateData)
      }
    };
  }



 //CẬP NHẬT STATUS CHO CATEGORY
  static async validateStatusUpdate(categoryId, newStatus) {
    const errors = [];
    
    try {
      // Tìm category
      const where = { id: categoryId };
      const category = await MenuCategory.findOne({ where });
      
      if (!category) {
        errors.push('Category not found');
        return errors;
      }
      
      const currentStatus = category.status;
      
      // Nếu status không thay đổi
      if (currentStatus === newStatus) {
        errors.push(`Category is already "${newStatus}"`);
        return errors;
      }
      
      // Nếu deactivating category
      if (newStatus === 'inactive') {
        // Kiểm tra có active items không
        const activeItemsCount = await MenuItem.count({
          where: {
            category_id: categoryId,
            status: 'available',
            is_deleted: false
          }
        });
        
        if (activeItemsCount > 0) {
          errors.push(`Cannot deactivate category. It contains ${activeItemsCount} active menu items.`);
        }
      }
      
    
      
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }
    
    return errors;
  }
  
  // UPDATE STATUS
  static async updateStatus(categoryId, newStatus) {
    // Validate
    const validationErrors = await this.validateStatusUpdate(categoryId, newStatus);
    
    if (validationErrors.length > 0) {
      throw new Error(`Status update validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Tìm category
    const where = { id: categoryId };
    
    const category = await MenuCategory.findOne({ where });
    if (!category) {
      throw new Error('Category not found');
    }
    
    const previousStatus = category.status;
    let itemsAffected = 0;
    
    // Update category status
    await category.update({ status: newStatus });
    
    // Nếu deactivating, cập nhật các items
    if (newStatus === 'inactive' && previousStatus === 'active') {
      const [affectedRows] = await MenuItem.update(
        { status: 'unavailable' },
        {
          where: {
            category_id: categoryId,
            status: 'available',
            is_deleted: false
          }
        }
      );
      itemsAffected = affectedRows;
    }
    
    // Nếu activating, cập nhật các items
    if (newStatus === 'active' && previousStatus === 'inactive') {
      const [affectedRows] = await MenuItem.update(
        { status: 'available' },
        {
          where: {
            category_id: categoryId,
            status: 'unavailable',
            is_deleted: false
          }
        }
      );
      itemsAffected = affectedRows;
    }
    
    // Lấy lại category với thông tin đầy đủ
    const updatedCategory = await MenuCategory.findByPk(categoryId);
    
    return {
      category: updatedCategory,
      metadata: {
        items_affected: itemsAffected,
        previous_status: previousStatus,
        restaurant_status: updatedCategory.restaurant?.status
      }
    };
  }


  static async create(data) {
    // Validate dữ liệu đầu vào
    const validationErrors = this.validateCategoryData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    try {
      // 1. Kiểm tra trùng tên danh mục
      const existingCategory = await MenuCategory.findOne({
        where: {
          name: data.name.trim(),
        }
      });
      
      if (existingCategory) {
        throw new Error(`Category "${data.name}" already exists`);
      }
      
      // 2. Xác định display_order nếu không có
      let displayOrder = data.display_order;
      if (displayOrder === undefined) {
        // Lấy display_order cao nhất và +1
        const maxOrder = await MenuCategory.max('display_order', {

        });
        displayOrder = (maxOrder || 0) + 1;
      }
      
      // 3. Chuẩn bị dữ liệu tạo
      const categoryData = {
        name: data.name.trim(),
        description: data.description ? data.description.trim() : null,
        display_order: displayOrder,
        status: data.status || 'active',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // 4. Tạo danh mục mới
      const newCategory = await MenuCategory.create(categoryData);
      
      // 5. Lấy thông tin đầy đủ với các quan hệ nếu có
      const createdCategory = await MenuCategory.findByPk(newCategory.id);
      
      return {
        category: createdCategory,
        metadata: {
          display_order: displayOrder,
          created_at: createdCategory.created_at
        }
      };
      
    } catch (error) {
      // Xử lý lỗi cụ thể từ database
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Category "${data.name}" already exists in the database`);
      }
      
      // Ném lại lỗi để controller xử lý
      throw error;
    }
  }
  

}