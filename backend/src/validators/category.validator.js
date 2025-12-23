import Joi from 'joi';

export const createCategorySchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must be at least 2 characters long',
        'string.max': 'Category name cannot exceed 50 characters',
        'any.required': 'Category name is required'
    }),
  
    description: Joi.string()
        .trim()
        .allow('', null)
        .max(800)
        .optional()
        .messages({
        'string.max': 'Description cannot exceed 800 characters'
    }),
  
    display_order: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .optional()
        .messages({
        'number.base': 'Display order must be a number',
        'number.integer': 'Display order must be an integer',
        'number.min': 'Display order cannot be negative'
    }),
    
    status: Joi.string()
        .valid('active', 'inactive')
        .default('active')
        .optional()
        .messages({
        'any.only': 'Status must be either "active" or "inactive"'
    })
});

// Schema cho việc cập nhật category
export const updateCategorySchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.empty': 'Category name cannot be empty',
        'string.min': 'Category name must be at least 2 characters long',
        'string.max': 'Category name cannot exceed 50 characters'
    }),
  
    description: Joi.string()
        .trim()
        .allow('', null)
        .max(500)
        .optional()
        .messages({
        'string.max': 'Description cannot exceed 500 characters'
    }),
    
    display_order: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        'number.base': 'Display order must be a number',
        'number.integer': 'Display order must be an integer',
        'number.min': 'Display order cannot be negative'
    }),
    
    status: Joi.string()
        .valid('active', 'inactive')
        .optional()
        .messages({
        'any.only': 'Status must be either "active" or "inactive"'
    })
})
.min(1) // Đảm bảo có ít nhất 1 field được cập nhật
.messages({
    'object.min': 'At least one field must be provided for update'
});



    // Schema cho việc update status
export const updateCategoryStatusSchema = Joi.object({
    status: Joi.string()
        .valid('active', 'inactive')
        .required()
        .messages({
        'any.only': 'Status must be either "active" or "inactive"',
        'any.required': 'Status is required'
    })
});



