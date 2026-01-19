// validators/orderItem.validator.js
import Joi from 'joi';

export const orderItemSchemas = {
  // Schema cho tạo mới OrderItem
  createOrderItem: Joi.object({
    order_id: Joi.string().uuid().required()
      .messages({
        'string.guid': 'ID đơn hàng phải là UUID hợp lệ',
        'any.required': 'ID đơn hàng là bắt buộc'
      }),
    menu_item_id: Joi.string().uuid().required()
      .messages({
        'string.guid': 'ID món ăn phải là UUID hợp lệ',
        'any.required': 'ID món ăn là bắt buộc'
      }),
    quantity: Joi.number().integer().min(1).required()
      .messages({
        'number.base': 'Số lượng phải là số',
        'number.integer': 'Số lượng phải là số nguyên',
        'number.min': 'Số lượng phải lớn hơn 0',
        'any.required': 'Số lượng là bắt buộc'
      }),
    price_at_order: Joi.number().positive().precision(2).required()
      .messages({
        'number.base': 'Giá phải là số',
        'number.positive': 'Giá phải lớn hơn 0',
        'any.required': 'Giá là bắt buộc'
      }),
    notes: Joi.string().allow('', null).optional()
      .messages({
        'string.base': 'Ghi chú phải là chuỗi'
      })
  }),

  // Schema cho params
  orderIdParam: Joi.object({
    orderId: Joi.string().uuid().required()
  }),

  itemIdParam: Joi.object({
    itemId: Joi.string().uuid().required()
  })
};