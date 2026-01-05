import Joi from 'joi';

export default {
  verifyEmail: Joi.object({
    customerId: Joi.string().uuid().required().messages({
      'string.empty': 'Customer ID là bắt buộc',
      'string.guid': 'Customer ID không hợp lệ',
      'any.required': 'Customer ID là bắt buộc'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email là bắt buộc',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.empty': 'OTP là bắt buộc',
        'string.length': 'OTP phải có 6 chữ số',
        'string.pattern.base': 'OTP chỉ được chứa số từ 0-9',
        'any.required': 'OTP là bắt buộc'
      })
  }),

  resendOTP: Joi.object({
    customerId: Joi.string().uuid().required().messages({
      'string.empty': 'Customer ID là bắt buộc',
      'string.guid': 'Customer ID không hợp lệ',
      'any.required': 'Customer ID là bắt buộc'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email là bắt buộc',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    })
  })
};