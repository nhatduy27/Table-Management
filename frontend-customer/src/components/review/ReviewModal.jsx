import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, menuItem, orderId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Vui lòng chọn đánh giá sao');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        menu_item_id: menuItem.id,
        order_id: orderId,
        rating,
        comment,
        customer_name: customerName || 'Khách hàng'
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setCustomerName('');
      onClose();
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Đánh giá món ăn</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="review-modal-body">
          {/* Menu Item Info */}
          <div className="menu-item-info">
            <h3>{menuItem?.name}</h3>
            {menuItem?.price && (
              <p className="price">{parseInt(menuItem.price).toLocaleString('vi-VN')}đ</p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="rating-section">
              <label>Đánh giá của bạn *</label>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`star ${
                        star <= (hoveredRating || rating) ? 'filled' : ''
                      }`}
                      fill={star <= (hoveredRating || rating) ? '#FFB800' : 'none'}
                      stroke={star <= (hoveredRating || rating) ? '#FFB800' : '#ddd'}
                    />
                  </button>
                ))}
                <span className="rating-text">
                  {rating > 0 ? (
                    rating === 5 ? 'Tuyệt vời!' :
                    rating === 4 ? 'Rất tốt' :
                    rating === 3 ? 'Bình thường' :
                    rating === 2 ? 'Tệ' : 'Rất tệ'
                  ) : 'Chọn số sao'}
                </span>
              </div>
            </div>

            {/* Customer Name (Optional) */}
            <div className="form-group">
              <label htmlFor="customer-name">Tên của bạn (tuỳ chọn)</label>
              <input
                id="customer-name"
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div className="form-group">
              <label htmlFor="review-comment">Nhận xét của bạn (tuỳ chọn)</label>
              <textarea
                id="review-comment"
                placeholder="Chia sẻ trải nghiệm của bạn về món ăn này..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <small>{comment.length}/500 ký tự</small>
            </div>

            {/* Submit Buttons */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
