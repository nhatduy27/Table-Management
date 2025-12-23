import { ModifierService } from "../services/modifier.service.js";
import {
	createModifierGroupSchema,
	updateModifierGroupSchema,
} from "../validators/modifierGroup.validator.js";
import {
	createModifierOptionSchema,
	updateModifierOptionSchema,
} from "../validators/modifierOption.validator.js";
import { attachModifierGroupsSchema } from "../validators/menuItemModifierGroup.validator.js";

import { validate } from "../middlewares/validator.js";

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
