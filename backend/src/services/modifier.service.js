import ModifierGroup from "../models/modifierGroup.js";
import ModifierOption from "../models/modifierOption.js";
import MenuItemModifierGroup from "../models/menuItemModifierGroup.js";
import MenuItem from "../models/menuItem.js";
import { Op } from "sequelize";

export class ModifierService {
	static async createGroup(data) {
		//Check for existed group
		const existingGroup = await ModifierGroup.findOne({
			where: {
				name: data.name
			},
		});
		if (existingGroup) {
			throw new Error("Modifier already exist");
		}

		//Create group
		return await ModifierGroup.create({
			name: data.name,
			selection_type: data.selection_type,
			is_required: data.is_required,
			min_selections: data.min_selections,
			max_selections: data.max_selections,
			display_order: data.display_order,
			status: data.status,
		});
	}

	static async updateGroup(id, data) {
		//Check if group exists
		const foundGroup = await ModifierGroup.findByPk(id);
		if (!foundGroup) {
			throw new Error("Modifier does not exist");
		}

		//Check if group name is used
		const existingGroupName = await ModifierGroup.findOne({
			where: {
				name: data.name,
				id: { [Op.ne]: id },
			},
		});
		if (existingGroupName) {
			throw new Error("Modifier name already exist");
		}

		//Update fields in data
		return await foundGroup.update(data);
	}

	static async createOption(groupId, data) {
		// Kiểm tra group tồn tại
		const group = await ModifierGroup.findByPk(groupId);
		if (!group) {
			throw new Error("Modifier group not found");
		}

		//Check for existed option
		const existingOption = await ModifierOption.findOne({
			where: {
				name: data.name,
				group_id: groupId, //different groups
			},
		});

		if (existingOption) {
			throw new Error("Option already exist");
		}

		//Create option
		return await ModifierOption.create({
			group_id: groupId,
			name: data.name,
			price_adjustment: data.price_adjustment,
			status: data.status,
		});
	}

	static async updateOption(id, data) {
		//Check if option exists
		const foundOption = await ModifierOption.findByPk(id);
		if (!foundOption) {
			throw new Error("Option not found");
		}

		//Check if option name is used
		const existingOptionName = await ModifierOption.findOne({
			where: {
				name: data.name,
				group_id: foundOption.group_id, //different groups
				id: { [Op.ne]: id },
			},
		});

		if (existingOptionName) {
			throw new Error("Option name already exist");
		}

		return await foundOption.update(data);
	}

	static async attachGroupsToItem(menuItemId, groupIds) {
		// Kiểm tra menu item tồn tại (defaultScope tự động filter is_deleted = false)
		const menuItem = await MenuItem.findByPk(menuItemId);
		if (!menuItem) {
			throw new Error("Menu item not found");
		}

		// Xóa các liên kết cũ
		await MenuItemModifierGroup.destroy({
			where: { menu_item_id: menuItemId },
		});

		// Nếu groupIds rỗng => chỉ detach tất cả
		if (!groupIds || groupIds.length === 0) {
			return [];
		}

		// Kiểm tra tất cả groups tồn tại và cùng restaurant với menu item
		const groups = await ModifierGroup.findAll({
			where: {
				id: groupIds,
			},
		});

		if (groups.length !== groupIds.length) {
			throw new Error(
				"Some modifier groups not found or belong to different restaurant"
			);
		}

		// Tạo các liên kết mới
		const records = groupIds.map((groupId) => ({
			menu_item_id: menuItemId,
			group_id: groupId,
		}));

		return await MenuItemModifierGroup.bulkCreate(records);
	}
}
