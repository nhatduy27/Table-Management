import { ModifierService } from "../../services/modifier.service.js";
import ModifierGroup from "../../models/modifierGroup.js";
import ModifierOption from "../../models/modifierOption.js";
import {
	createModifierGroupSchema,
	updateModifierGroupSchema,
} from "../../validators/modifierGroup.validator.js";
import {
	createModifierOptionSchema,
	updateModifierOptionSchema,
} from "../../validators/modifierOption.validator.js";
import { attachModifierGroupsSchema } from "../../validators/menuItemModifierGroup.validator.js";

import { validate } from "../../middlewares/validator.js";

// GET all modifier groups
export const getAllModifierGroups = async (req, res) => {
	try {
		const groups = await ModifierGroup.findAll({
			include: [
				{
					model: ModifierOption,
					as: "options",
					required: false,
				},
			],
			order: [
				["display_order", "ASC"],
				["created_at", "DESC"],
			],
		});

		res.json({
			success: true,
			message: "Get all modifier groups",
			data: groups,
		});
	} catch (error) {
		console.error("Error getting modifier groups:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

// GET modifier group by ID
export const getModifierGroupById = async (req, res) => {
	try {
		const { id } = req.params;
		const group = await ModifierGroup.findByPk(id, {
			include: [
				{
					model: ModifierOption,
					as: "options",
					required: false,
				},
			],
		});

		if (!group) {
			return res.status(404).json({
				success: false,
				message: "Modifier group not found",
			});
		}

		res.json({
			success: true,
			message: `Get modifier group by ID: ${id}`,
			data: group,
		});
	} catch (error) {
		console.error("Error getting modifier group:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

export const createModifierGroup = [
	validate(createModifierGroupSchema),
	async (req, res) => {
		try {
			const newGroup = await ModifierService.createGroup(
				req.validatedData
			);
			res.status(201).json({
				success: true,
				message: "New group created successfully",
				data: newGroup,
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: error.message,
			});
		}
	},
];

export const updateModifierGroup = [
	validate(updateModifierGroupSchema),
	async (req, res) => {
		try {
			const updatedGroup = await ModifierService.updateGroup(
				req.params.id,
				req.validatedData
			);
			res.status(200).json({
				success: true,
				message: "Group updated successfully",
				data: updatedGroup,
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: error.message,
			});
		}
	},
];

export const createModifierOption = [
	validate(createModifierOptionSchema),
	async (req, res) => {
		try {
			const newOption = await ModifierService.createOption(
				req.params.id,
				req.validatedData
			);
			res.status(201).json({
				success: true,
				message: "New option created successfully",
				data: newOption,
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: error.message,
			});
		}
	},
];

export const updateModifierOption = [
	validate(updateModifierOptionSchema),
	async (req, res) => {
		try {
			const updatedOption = await ModifierService.updateOption(
				req.params.id,
				req.validatedData
			);
			res.status(200).json({
				success: true,
				message: "Option updated successfully",
				data: updatedOption,
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: error.message,
			});
		}
	},
];

export const attachModifierGroup = [
	validate(attachModifierGroupsSchema),
	async (req, res) => {
		try {
			const { id } = req.params; // menu item id
			const { groupIds } = req.validatedData; // array of modifier group ids

			const result = await ModifierService.attachGroupsToItem(
				id,
				groupIds
			);
			res.status(200).json({
				success: true,
				message: "Modifier groups updated successfully",
				data: result,
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: error.message,
			});
		}
	},
];

// DELETE modifier group
export const deleteModifierGroup = async (req, res) => {
	try {
		const { id } = req.params;

		const group = await ModifierGroup.findByPk(id);
		if (!group) {
			return res.status(404).json({
				success: false,
				message: "Modifier group not found",
			});
		}

		// Delete all options first
		await ModifierOption.destroy({
			where: { group_id: id },
		});

		// Delete the group
		await group.destroy();

		res.json({
			success: true,
			message: "Modifier group deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting modifier group:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

// DELETE modifier option
export const deleteModifierOption = async (req, res) => {
	try {
		const { id } = req.params;

		const option = await ModifierOption.findByPk(id);
		if (!option) {
			return res.status(404).json({
				success: false,
				message: "Modifier option not found",
			});
		}

		await option.destroy();

		res.json({
			success: true,
			message: "Modifier option deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting modifier option:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};
