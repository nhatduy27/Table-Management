// validators/customer.validator.js
import Joi from "joi";

const customerValidator = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.base': 'Username phải là chuỗi',
        'string.min': 'Username phải có ít nhất 3 ký tự',
        'string.max': 'Username không quá 30 ký tự',
        'any.required': 'Username là bắt buộc'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
      }),

    auth_method: Joi.string()
      .valid('email', 'google')
      .default('email')
    ,
    
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
        'any.required': 'Mật khẩu là bắt buộc'
      })
  }),

  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  }),

  update: Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .optional()
        .messages({
            'string.base': 'Tên người dùng phải là chuỗi',
            'string.min': 'Tên người dùng phải có ít nhất 3 ký tự',
            'string.max': 'Tên người dùng không quá 30 ký tự'
        }),
    
    phone: Joi.string()
        .pattern(/^[0-9]+$/)
        .length(10)
        .optional()
        .messages({
            'string.pattern.base': 'Số điện thoại chỉ được chứa chữ số',
            'string.length': 'Số điện thoại phải có đúng 10 chữ số'
        })
  }).min(1),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

export default customerValidator;