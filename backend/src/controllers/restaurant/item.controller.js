import MenuCategory from "../../models/menuCategory.js";
import db from "../../models/index.js";
import MenuItem from "../../models/menuItem.js";

import { ItemService } from "../../services/menuItem.service.js";
import {
	createMenuItemSchema,
	updateMenuItemSchema,
	updateMenuItemStatusSchema,
} from "../../validators/item.validator.js";
import { validate } from "../../middlewares/validator.js";

const { MenuItemPhoto } = db;

//LẤY TẤT CẢ ITEM
export const getAllItem = async (req, res) => {
	try {
		// const menuItem = await MenuItem.findAll({
		// 	order: [["created_at", "DESC"]],
		// });
		const menuItem = await MenuItem.findAll({
			// 👇 QUAN TRỌNG: Vẫn phải giữ đoạn này để Frontend có ảnh mà hiển thị
			include: [
				{
					model: MenuItemPhoto,
					as: "photos", // Alias khớp với model
					attributes: ["id", "url", "is_primary"],
				},
				{
					model: MenuCategory,
					as: "category",
					attributes: ["id", "name"],
				},
			],
			order: [["created_at", "DESC"]],
		});

		res.json({
			success: true,
			message: "Get all menuItem from database",
			data: menuItem,
		});
	} catch (error) {
		console.error("Error getting menuItem:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

//LẤY ITEM THEO ID
export const getItemById = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MenuItem.findByPk(id, {
			include: [
				{
					model: MenuItemPhoto,
					as: "photos",
					attributes: ["id", "url", "is_primary"],
				},
				{
					model: MenuCategory,
					as: "category",
					attributes: ["id", "name"],
				},
				{
					model: db.ModifierGroup,
					as: "modifierGroups",
					include: [
						{
							model: db.ModifierOption,
							as: "options",
							attributes: [
								"id",
								"name",
								"price_adjustment",
								"status",
							],
						},
					],
				},
			],
		});

		if (!item) {
			//Sẽ trả về lỗi nếu không tìm thấy item
			return res.status(404).json({
				success: false,
				message: "Item not found",
			});
		}

		res.json({
			success: true,
			message: `Get item by ID: ${id}`,
			data: item,
		});
	} catch (error) {
		console.error("Error getting item by ID:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

//TẠO ITEM MỚI
export const createItem = [
	validate(createMenuItemSchema), //validate dữ liệu đầu vào
	async (req, res) => {
		try {
			const validatedData = req.validatedData;

			// validate business logic
			const validationErrors =
				ItemService.validateItemData(validatedData);
			if (validationErrors.length > 0) {
				//nếu có lỗi validate
				return res.status(400).json({
					success: false,
					message: "Validation failed",
					errors: validationErrors,
				});
			}

			const newItem = await ItemService.create(validatedData);

			res.status(201).json({
				success: true,
				message: "Item created successfully",
				data: newItem,
			});
		} catch (error) {
			console.error("Error creating item:", error);

			res.status(400).json({
				success: false,
				error: error.message,
			});
		}
	},
];

//CẬP NHẬT ITEM
export const updateItem = [
	validate(updateMenuItemSchema),
	async (req, res) => {
		try {
			const validatedData = req.validatedData;
			const { id } = req.params;

			// Validate business logic
			const validationErrors = await ItemService.validateUpdateData(
				id,
				validatedData
			);
			if (validationErrors.length > 0) {
				return res.status(400).json({
					success: false,
					message: "Validation failed",
					errors: validationErrors,
				});
			}

			// Cập nhật qua Service
			const updatedItem = await ItemService.update(id, validatedData);

			res.status(200).json({
				success: true,
				message: "Item updated successfully",
				data: updatedItem,
			});
		} catch (error) {
			console.error("Error updating item:", error);

			// Xử lý lỗi từ Service
			if (error.message === "Item not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}

			if (error.message === "No data provided for update") {
				return res.status(400).json({
					success: false,
					message: error.message,
				});
			}

			res.status(500).json({
				success: false,
				message: "Internal server error",
				error: error.message,
			});
		}
	},
];

export const deleteItem = [
	async (req, res) => {
		try {
			const { id } = req.params; // id của menu item

			// 1. Tìm item
			const item = await MenuItem.findOne({
				where: {
					id,
					is_deleted: false,
				},
				include: [
					{
						model: MenuCategory,
						as: "category",
						attributes: ["id", "name"],
					},
				],
			});

			if (!item) {
				return res.status(404).json({
					success: false,
					message: "Menu item not found or already deleted",
				});
			}

			// 2. Lấy category_id từ item
			const category_id = item.category_id;

			console.log(`Deleting item ${id} from category ${category_id}`);

			// 3. Soft delete item
			await item.update({
				is_deleted: true,
				deleted_at: new Date(),
			});

			// 4. (Optional) Cập nhật số lượng items trong category
			const activeItemsCount = await MenuItem.count({
				where: {
					category_id: category_id,
					is_deleted: false,
					status: "active",
				},
			});

			res.status(200).json({
				success: true,
				message: "Menu item deleted successfully",
				data: {
					id: item.id,
					name: item.name,
					category_id: category_id,
					category_name: item.category?.name,
					remaining_items_in_category: activeItemsCount,
					deleted_at: new Date().toISOString(),
				},
			});
		} catch (error) {
			console.error("Error deleting menu item:", error);

			// Xử lý lỗi database
			if (error.name === "SequelizeDatabaseError") {
				return res.status(400).json({
					success: false,
					message: "Database error occurred",
				});
			}

			// Lỗi validation từ Sequelize
			if (error.name === "SequelizeValidationError") {
				return res.status(400).json({
					success: false,
					message: "Validation error",
				});
			}

			res.status(500).json({
				success: false,
				message: "Internal server error",
				error:
					process.env.NODE_ENV === "development"
						? error.message
						: undefined,
			});
		}
	},
];
