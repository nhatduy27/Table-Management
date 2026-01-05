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
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    fullName: Joi.string().max(100),
    phone: Joi.string().pattern(/^[0-9]+$/).max(15),
    address: Joi.string(),
    dateOfBirth: Joi.date()
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

export default customerValidator;