import Joi from 'joi';

export const createOrderSchema = Joi.object({
  table_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Mã bàn phải là định dạng UUID hợp lệ',
      'any.required': 'Mã bàn là bắt buộc'
    }),
  
  total_amount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Tổng tiền phải là số',
      'number.min': 'Tổng tiền không được nhỏ hơn 0',
      'any.required': 'Tổng tiền là bắt buộc'
    }),
  
  // 👇 THÊM MỚI: Cho phép gửi ghi chú tổng của đơn hàng
  note: Joi.string().allow('', null).optional(),

  // 👇 THÊM MỚI: Cho phép gửi danh sách món ăn
  items: Joi.array().items(
    Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(), // Chấp nhận cả UUID hoặc ID số
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).optional(), // Giá có thể optional vì Backend sẽ tự check lại
      notes: Joi.string().allow('', null).optional(),
      
      // Validate modifiers (Topping)
      modifiers: Joi.array().items(
        Joi.object({
          id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
          price: Joi.number().min(0).optional()
        }).unknown(true) // Cho phép các trường lạ khác trong modifier nếu có
      ).optional().allow(null)
    }).unknown(true) // Cho phép các trường lạ trong item (ví dụ name) để không bị lỗi
  ).required().messages({
     'any.required': 'Danh sách món ăn là bắt buộc',
     'array.base': 'Danh sách món ăn phải là một mảng'
  }),

  ordered_at: Joi.date()
    .iso()
    .optional()
    .default(() => new Date())
});

export default {
  createOrderSchema
};