import { Op, fn, col } from "sequelize";
import MenuItem from "../models/menuItem.js";
import MenuCategory from "../models/menuCategory.js";
import MenuItemPhoto from "../models/menuItemPhoto.js";
import ModifierGroup from "../models/modifierGroup.js";
import ModifierOption from "../models/modifierOption.js";
import OrderItem from "../models/orderItem.js";
import Table from "../models/table.js";

const getGuestMenu = async ({
  tableId,
  search,
  categoryId,
  sort,
  chefRecommended,
  page,
  limit,
}) => {
  const table = await Table.findByPk(tableId);
  // 1. Lấy categories (active)
  const categories = await MenuCategory.findAll({
    where: {
      status: "active",
    },
    order: [["display_order", "ASC"]],
    attributes: ["id", "name", "display_order", "description"],
  });

  // 2. Build điều kiện WHERE cho items
  const itemWhereClause = {};

  // Filter theo category
  if (categoryId) {
    itemWhereClause.category_id = categoryId;
  }

  // Filter chef recommended
  if (chefRecommended) {
    itemWhereClause.is_chef_recommended = true;
  }

  // Search theo tên
  if (search) {
    itemWhereClause.name = {
      [Op.iLike]: `%${search}%`, // PostgreSQL case-insensitive
    };
  }

  // 3. Build ORDER clause
  let orderClause = [["name", "ASC"]]; // default
  let sortByPopularity = false;

  if (sort === "price") {
    orderClause = [["price", "ASC"]];
  } else if (sort === "price_desc") {
    orderClause = [["price", "DESC"]];
  } else if (sort === "name") {
    orderClause = [["name", "ASC"]];
  } else if (sort === "popularity" || sort === "popularity_desc") {
    // Sort by popularity sẽ được xử lý riêng sau khi query
    sortByPopularity = true;
    orderClause = [["name", "ASC"]]; // Default fallback
  } else if (chefRecommended === "true") {
    orderClause = [["is_chef_recommended", "DESC"]];
  }

  // 4. Query items với pagination
  const offset = (page - 1) * limit;

  const { count, rows: items } = await MenuItem.findAndCountAll({
    where: itemWhereClause,
    include: [
      // Photo
      {
        model: MenuItemPhoto,
        as: "photos",
        required: false,
        attributes: ["id", "url", "is_primary"],
      },
      // Category info
      {
        model: MenuCategory,
        as: "category",
        attributes: ["id", "name"],
      },
      // Modifier groups qua junction table
      {
        model: ModifierGroup,
        as: "modifierGroups",
        through: { attributes: [] },
        include: [
          {
            model: ModifierOption,
            as: "options",
            attributes: ["id", "name", "price_adjustment"],
          },
        ],
        attributes: [
          "id",
          "name",
          "selection_type",
          "is_required",
          "min_selections",
          "max_selections",
        ],
      },
    ],
    order: orderClause,
    limit,
    offset,
    distinct: true,
  });

  // 5. Lấy popularity count cho tất cả items (số lượng đơn hàng)
  const itemIds = items.map((item) => item.id);
  let popularityMap = {};

  if (itemIds.length > 0) {
    const popularityCounts = await OrderItem.findAll({
      attributes: ["menu_item_id", [fn("SUM", col("quantity")), "order_count"]],
      where: {
        menu_item_id: { [Op.in]: itemIds },
        status: { [Op.notIn]: ["cancelled"] }, // Không tính đơn hủy
      },
      group: ["menu_item_id"],
      raw: true,
    });

    // Tạo map để lookup nhanh
    popularityCounts.forEach((pc) => {
      popularityMap[pc.menu_item_id] = parseInt(pc.order_count) || 0;
    });
  }

  // 6. Format response
  let formattedItems = items.map((item) => {
    // Tìm ảnh primary thật sự trong danh sách ảnh lấy về
    // Nếu không có cái nào là primary thì lấy cái đầu tiên làm đại diện
    const actualPrimaryPhoto =
      item.photos?.find((p) => p.is_primary === true) ||
      (item.photos && item.photos.length > 0 ? item.photos[0] : null);

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      is_chef_recommended: item.is_chef_recommended,

      // 👇 Bổ sung các trường bị thiếu hôm qua
      status: item.status,
      prep_time_minutes: item.prep_time_minutes,

      // 👇 Vẫn giữ cái này cho Card bên ngoài dùng
      primary_photo: actualPrimaryPhoto,

      // 👇 THÊM MỚI: Gửi toàn bộ danh sách ảnh cho Modal chi tiết dùng
      photos: item.photos || [],

      category: item.category,
      modifierGroups: item.modifierGroups || [],

      // 👇 THÊM MỚI: Popularity count (số lượng đã được đặt)
      popularity: popularityMap[item.id] || 0,
    };
  });

  // 7. Sort by popularity nếu được yêu cầu
  if (sortByPopularity) {
    formattedItems.sort((a, b) => b.popularity - a.popularity);
  }

  // 8. Tính pagination info
  const totalPages = Math.ceil(count / limit);

  return {
    table,
    categories,
    items: formattedItems,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: count,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export { getGuestMenu };
