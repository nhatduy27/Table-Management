// validators/menu_item_modifier_group.validator.js
import Joi from "joi";

export const attachModifierGroupsSchema = Joi.object({
	// Validate body
	groupIds: Joi.array()
		.items(
			Joi.string().guid({ version: "uuidv4" }).messages({
				"string.guid": "Each group ID must be a valid UUID",
			})
		)
		.required()
		.messages({
			"array.base": "groupIds must be an array",
			"any.required": "groupIds is required",
		}),
});
