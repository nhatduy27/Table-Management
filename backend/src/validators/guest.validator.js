import Joi from 'joi';

// Schema cho tạo order mới
export const createOrderSchema = Joi.object({
  table_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Mã bàn phải là UUID hợp lệ',
      'any.required': 'Mã bàn là bắt buộc'
    }),

  total_amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Tổng tiền phải là số',
      'number.min': 'Tổng tiền không được nhỏ hơn 0',
      'any.required': 'Tổng tiền là bắt buộc'
    }),

  ordered_at: Joi.date()
    .iso()
    .max('now')
    .optional() // Thêm optional nếu không bắt buộc gửi từ client
    .messages({
      'date.base': 'Ngày đặt hàng không hợp lệ',
      'date.iso': 'Ngày đặt hàng phải theo định dạng ISO',
      'date.max': 'Ngày đặt hàng không thể là tương lai'
    }),

});

// Schema cho query params (lấy lịch sử đơn hàng)
export const orderQueryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Số trang phải là số nguyên',
      'number.min': 'Số trang phải lớn hơn hoặc bằng 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Giới hạn phải là số nguyên',
      'number.max': 'Giới hạn không được vượt quá 100'
    }),

  sort_by: Joi.string()
    .valid('ordered_at', 'total_amount', 'created_at')
    .default('ordered_at')
    .messages({
      'any.only': 'Trường sắp xếp không hợp lệ'
    }),

  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Thứ tự sắp xếp không hợp lệ'
    })
});