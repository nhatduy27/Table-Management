import MenuCategory from "../models/menuCategory.js";
import MenuItem from "../models/menuItem.js";
import { Op } from "sequelize";

export class ItemService {
  static async create(data, transaction = null) {
    // Kiểm tra trùng tên trong cùng category
    const existingItem = await MenuItem.findOne({
      where: {
        category_id: data.category_id,
        name: data.name,
        is_deleted: false,
      },
      transaction,
    });

    if (existingItem) {
      throw new Error("Item name already exists in this category");
    }

    return await MenuItem.create(
      {
        category_id: data.category_id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        prep_time_minutes: data.prep_time_minutes || 0,
        status: data.status || "available",
        is_chef_recommended: data.is_chef_recommended || false,
      },
      { transaction },
    );
  }

  //CẬP NHẬT ITEM

  static async update(id, data) {
    // 1. Tìm item cần cập nhật
    const where = { id };

    const item = await MenuItem.findOne({ where });

    if (!item) {
      throw new Error("Item not found");
    }

    // 2. Kiểm tra xem có dữ liệu để cập nhật không
    if (Object.keys(data).length === 0) {
      throw new Error("No data provided for update");
    }

    // 3. Kiểm tra trùng tên trong cùng category (nếu có thay đổi tên hoặc category)
    if (
      (data.name && data.name !== item.name) ||
      (data.category_id && data.category_id !== item.category_id)
    ) {
      const targetCategoryId = data.category_id || item.category_id;
      const targetName = data.name || item.name;

      const existingItem = await MenuItem.findOne({
        where: {
          category_id: targetCategoryId,
          name: targetName,
          id: { [Op.ne]: id },
          is_deleted: false,
        },
      });

      if (existingItem) {
        throw new Error("Item name already exists in this category");
      }
    }

    // 4. Cập nhật item
    await item.update(data);
    return await MenuItem.findByPk(id); // Fetch lại để có dữ liệu mới nhất
  }

  static validateItemData(data, isUpdate = false) {
    const errors = [];

    // Validate name (bắt buộc cho create, optional cho update)
    if (!isUpdate || data.name !== undefined) {
      if (data.name !== undefined) {
        if (!data.name || data.name.trim() === "") {
          errors.push("Item name is required");
        } else {
          if (data.name.length < 2) {
            errors.push("Item name must be at least 2 characters");
          }
          if (data.name.length > 80) {
            errors.push("Item name cannot exceed 80 characters");
          }
        }
      } else if (!isUpdate) {
        errors.push("Item name is required");
      }
    }

    // Validate description
    if (data.description !== undefined) {
      if (data.description && data.description.length > 1000) {
        errors.push("Description cannot exceed 1000 characters");
      }
    }

    // Validate price (bắt buộc cho create, optional cho update)
    if (!isUpdate || data.price !== undefined) {
      if (data.price !== undefined) {
        if (typeof data.price !== "number" || isNaN(data.price)) {
          errors.push("Price must be a valid number");
        } else if (data.price < 0.01) {
          errors.push("Price must be at least 0.01");
        } else if (data.price > 999999.99) {
          errors.push("Price cannot exceed 999,999.99");
        }
      } else if (!isUpdate) {
        errors.push("Price is required");
      }
    }

    // Validate prep_time_minutes
    if (data.prep_time_minutes !== undefined) {
      if (
        typeof data.prep_time_minutes !== "number" ||
        !Number.isInteger(data.prep_time_minutes)
      ) {
        errors.push("Preparation time must be an integer");
      } else if (data.prep_time_minutes < 0) {
        errors.push("Preparation time cannot be negative");
      } else if (data.prep_time_minutes > 240) {
        errors.push("Preparation time cannot exceed 240 minutes");
      }
    }

    // Validate status
    if (data.status !== undefined) {
      if (!["available", "unavailable", "sold_out"].includes(data.status)) {
        errors.push(
          'Status must be either "available", "unavailable", or "sold_out"',
        );
      }
    }

    // Validate is_chef_recommended
    if (data.is_chef_recommended !== undefined) {
      if (typeof data.is_chef_recommended !== "boolean") {
        errors.push("Chef recommendation must be true or false");
      }
    }

    // Validate category_id (bắt buộc cho create, optional cho update)
    if (!isUpdate || data.category_id !== undefined) {
      if (data.category_id !== undefined) {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(data.category_id)) {
          errors.push("Invalid category ID format");
        }
      } else if (!isUpdate) {
        errors.push("Category ID is required");
      }
    }

    return errors;
  }

  static async validateUpdateData(itemId, data) {
    const errors = this.validateItemData(data, true); // isUpdate = true

    // Có thể thêm logic validate đặc biệt cho update
    // Ví dụ: không cho đổi status thành sold_out nếu không có inventory
    if (data.status === "sold_out") {
      const where = { id: itemId };

      const item = await MenuItem.findOne({ where });

      if (item && item.status !== "sold_out") {
        // Kiểm tra logic kinh doanh
        // if (!item.hasInventory) {
        //   errors.push('Cannot set status to sold_out - check inventory');
        // }
      }
    }

    return errors;
  }
}
