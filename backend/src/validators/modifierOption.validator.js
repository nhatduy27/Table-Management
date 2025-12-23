import Joi from "joi";

//base schema dùng chung cho create, update
export const baseModifierOptionSchema = {
	name: Joi.string().max(80).trim(),

	price_adjustment: Joi.number().precision(2).min(0),

	status: Joi.string().valid("active", "inactive"),
};

//create (POST)
export const createModifierOptionSchema = Joi.object({
	group_id: Joi.string().uuid().required(),

	name: baseModifierOptionSchema.name.required(),

	price_adjustment: baseModifierOptionSchema.price_adjustment.default(0),

	status: baseModifierOptionSchema.status.default("active"),
}).options({
	abortEarly: false,
	allowUnknown: false,
});

//update (PUT)
export const updateModifierOptionSchema = Joi.object({
	...baseModifierOptionSchema,
})
	.min(1) // bắt buộc có ít nhất 1 field
	.options({
		abortEarly: false,
		allowUnknown: false,
	});
