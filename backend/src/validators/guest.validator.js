import Joi from "joi";

export const guestMenuQuerySchema = Joi.object({
  q: Joi.string()
    .max(100)
    .allow("")
    .optional()
    .messages({
      "string.max": "Search keyword must be at most 100 characters",
    }),

  categoryId: Joi.string()
    .guid({ version: "uuidv4" })
    .optional()
    .messages({
      "string.guid": "categoryId must be a valid UUID",
    }),

  sort: Joi.string()
    .valid("popularity")
    .optional()
    .messages({
        "any.only": "sort only supports 'popularity'",
  }),

  chefRecommended: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "chefRecommended must be boolean",
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "page must be a number",
      "number.min": "page must be at least 1",
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      "number.max": "limit must be less than or equal to 50",
    }),
});
