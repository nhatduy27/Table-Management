


import Joi from "joi";

//base schema dùng chung cho create, update
export const baseModifierGroupSchema = {
	name: Joi.string().max(80).trim(),

	selection_type: Joi.string().valid("single", "multiple"),

	is_required: Joi.boolean(),

	min_selections: Joi.number().integer().min(0),

	max_selections: Joi.number().integer().min(0),

	display_order: Joi.number().integer().min(0),

	status: Joi.string().valid("active", "inactive"),
};

//create (POST)
export const createModifierGroupSchema = Joi.object({

	name: baseModifierGroupSchema.name.required(),

	selection_type: baseModifierGroupSchema.selection_type.required(),

	is_required: baseModifierGroupSchema.is_required.default(false),

	min_selections: baseModifierGroupSchema.min_selections.default(0),

	max_selections: baseModifierGroupSchema.max_selections.default(0),

	display_order: baseModifierGroupSchema.display_order.default(0),

	status: baseModifierGroupSchema.status.default("active"),
})
	.custom((value, helpers) => {
		if (value.min_selections > value.max_selections) {
			return helpers.message(
				"min_selections không được lớn hơn max_selections"
			);
		}

		if (value.selection_type === "single" && value.max_selections > 1) {
			return helpers.message(
				"selection_type=single thì max_selections không được > 1"
			);
		}

		if (value.is_required && value.min_selections === 0) {
			return helpers.message(
				"is_required=true thì min_selections phải ≥ 1"
			);
		}

		return value;
	})
	.options({
		abortEarly: false,
		allowUnknown: false,
	});

//update (PUT)
export const updateModifierGroupSchema = Joi.object({
	...baseModifierGroupSchema,
})
	.min(1) // không cho update rỗng
	.custom((value, helpers) => {
		if (
			value.min_selections !== undefined &&
			value.max_selections !== undefined &&
			value.min_selections > value.max_selections
		) {
			return helpers.message(
				"min_selections không được lớn hơn max_selections"
			);
		}

		if (value.selection_type === "single" && value.max_selections > 1) {
			return helpers.message(
				"selection_type=single thì max_selections không được > 1"
			);
		}

		return value;
	})
	.options({
		abortEarly: false,
		allowUnknown: false,
	});
