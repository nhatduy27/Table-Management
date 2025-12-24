import { Op } from "sequelize";
import MenuItem from "../models/menuItem.js";
import MenuCategory from "../models/menuCategory.js";
import MenuItemPhoto from "../models/menuItemPhoto.js";
import ModifierGroup from "../models/modifierGroup.js";
import ModifierOption from "../models/modifierOption.js";
import MenuItemModifierGroup from "../models/menuItemModifierGroup.js";
import Table from "../models/table.js";
import Restaurant from "../models/restaurant.js";

const getTableById = async (tableId) => {
	return await Table.findByPk(tableId);
};

const getGuestMenu = async ({
	search,
	categoryId,
	sort,
	chefRecommended,
	page,
	limit,
}) => {
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
	if (sort === "price") {
		orderClause = [["price", "ASC"]];
	} else if (sort === "price_desc") {
		orderClause = [["price", "DESC"]];
	} else if (sort === "name") {
		orderClause = [["name", "ASC"]];
	} else if (chefRecommended === "true") {
		orderClause = [["is_chef_recommended", "DESC"]];
	}

	// 4. Query items với pagination
	const offset = (page - 1) * limit;

	const { count, rows: items } = await MenuItem.findAndCountAll({
		where: itemWhereClause,
		include: [
			// Primary photo
			{
				model: MenuItemPhoto,
				as: "photos",
				where: { is_primary: true },
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

	// 5. Format response
	const formattedItems = items.map((item) => ({
		id: item.id,
		name: item.name,
		description: item.description,
		price: item.price,
		is_chef_recommended: item.is_chef_recommended,
		primary_photo:
			item.photos && item.photos.length > 0 ? item.photos[0] : null,
		category: item.category,
		modifierGroups: item.modifierGroups || [],
	}));

	// 6. Tính pagination info
	const totalPages = Math.ceil(count / limit);

	return {
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

export { getTableById, getGuestMenu };
