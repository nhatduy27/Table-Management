import Joi from 'joi';

export const createTableSchema = Joi.object({
  table_number: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9-_]+$/)
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': 'Table number can only contain letters, numbers, hyphens and underscores',
      'string.empty': 'Table number is required',
      'any.required': 'Table number is required'
    }),
  
  capacity: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .required()
    .messages({
      'number.base': 'Capacity must be a number',
      'number.integer': 'Capacity must be an integer',
      'number.min': 'Capacity must be at least 1',
      'number.max': 'Capacity cannot exceed 20',
      'any.required': 'Capacity is required'
    }),
  
  location: Joi.string()
    .trim()
    .max(100)
    .allow('', null)
    .optional(),
  
  description: Joi.string()
    .trim()
    .allow('', null)
    .optional(),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .default('active')
    .messages({
      'any.only': 'Status must be either "active" or "inactive"'
    })
});


export const updateTableSchema = Joi.object({
  table_number: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9-_]+$/)
    .min(1)
    .max(50)
    .messages({
      'string.pattern.base': 'Table number can only contain letters, numbers, hyphens and underscores',
      'string.min': 'Table number must be at least 1 character',
      'string.max': 'Table number cannot exceed 50 characters'
    }),
  
  capacity: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .messages({
      'number.base': 'Capacity must be a number',
      'number.integer': 'Capacity must be an integer',
      'number.min': 'Capacity must be at least 1',
      'number.max': 'Capacity cannot exceed 20'
    }),
  
  location: Joi.string()
    .trim()
    .max(100)
    .allow('', null)
    .messages({
      'string.max': 'Location cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .allow('', null),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .messages({
      'any.only': 'Status must be either "active" or "inactive"'
    })
})
.min(1) 
.messages({
  'object.min': 'At least one field must be provided for update'
});

export const updateTableStatusSchema = Joi.object({

  status: Joi.string()
    .valid('active', 'inactive')
    .required()
    .messages({
      'any.only': 'Status must be either "active" or "inactive"',
      'any.required': 'Status is required'
    })
});