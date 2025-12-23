// src/validators/menuItem.validator.js
import Joi from 'joi';

// Schema cho việc tạo menu 
export const createMenuItemSchema = Joi.object({


    category_id: Joi.string()
        .uuid()
        .required()
        .messages({
        'string.guid': 'Category ID must be a valid UUID',
        'any.required': 'Category ID is required'
    }),
    
    name: Joi.string()
        .trim()
        .min(2)
        .max(80)
        .required()
        .messages({
        'string.empty': 'Item name is required',
        'string.min': 'Item name must be at least 2 characters long',
        'string.max': 'Item name cannot exceed 80 characters',
        'any.required': 'Item name is required'
    }),
    
    description: Joi.string()
        .trim()
        .allow('', null)
        .max(1000)
        .optional()
        .messages({
        'string.max': 'Description cannot exceed 1000 characters'
    }),
    
    price: Joi.number()
        .positive()
        .min(0.01)
        .max(999999.99)
        .required()
        .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be greater than 0',
        'number.min': 'Price must be at least 0.01',
        'number.max': 'Price cannot exceed 999,999.99',
        'any.required': 'Price is required'
    }),
    
    prep_time_minutes: Joi.number()
        .integer()
        .min(0)
        .max(240)
        .default(0)
        .optional()
        .messages({
        'number.base': 'Preparation time must be a number',
        'number.integer': 'Preparation time must be an integer',
        'number.min': 'Preparation time cannot be negative',
        'number.max': 'Preparation time cannot exceed 240 minutes'
    }),
    
    status: Joi.string()
        .valid('available', 'unavailable', 'sold_out')
        .default('available')
        .optional()
        .messages({
        'any.only': 'Status must be one of: available, unavailable, sold_out'
    }),
    
    is_chef_recommended: Joi.boolean()
        .default(false)
        .optional()
        .messages({
        'boolean.base': 'Chef recommendation must be true or false'
    })
});

// Schema cho việc cập nhật menu item
export const updateMenuItemSchema = Joi.object({

    category_id: Joi.string()
        .uuid()
        .optional()
        .messages({
        'string.guid': 'Category ID must be a valid UUID'
    }),
    
    name: Joi.string()
        .trim()
        .min(2)
        .max(80)
        .optional()
        .messages({
        'string.empty': 'Item name cannot be empty',
        'string.min': 'Item name must be at least 2 characters long',
        'string.max': 'Item name cannot exceed 80 characters'
    }),
    
    description: Joi.string()
        .trim()
        .allow('', null)
        .max(1000)
        .optional()
        .messages({
        'string.max': 'Description cannot exceed 1000 characters'
    }),
    
    price: Joi.number()
        .positive()
        .min(0.01)
        .max(999999.99)
        .optional()
        .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be greater than 0',
        'number.min': 'Price must be at least 0.01',
        'number.max': 'Price cannot exceed 999,999.99'
    }),
    
    prep_time_minutes: Joi.number()
        .integer()
        .min(0)
        .max(240)
        .optional()
        .messages({
        'number.base': 'Preparation time must be a number',
        'number.integer': 'Preparation time must be an integer',
        'number.min': 'Preparation time cannot be negative',
        'number.max': 'Preparation time cannot exceed 240 minutes'
    }),
    
    status: Joi.string()
        .valid('available', 'unavailable', 'sold_out')
        .optional()
        .messages({
        'any.only': 'Status must be one of: available, unavailable, sold_out'
    }),
    
    is_chef_recommended: Joi.boolean()
        .optional()
        .messages({
        'boolean.base': 'Chef recommendation must be true or false'
    })
    }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

// Schema cho việc update status menu item
export const updateMenuItemStatusSchema = Joi.object({
  status: Joi.string()
    .valid('available', 'unavailable', 'sold_out')
    .required()
    .messages({
      'any.only': 'Status must be one of: available, unavailable, sold_out',
      'any.required': 'Status is required'
    }),
  
  reason: Joi.string()
    .max(200)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Reason cannot exceed 200 characters'
    })
});

