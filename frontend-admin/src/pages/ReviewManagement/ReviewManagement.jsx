import React, { useState, useEffect } from 'react';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import './ReviewManagement.css';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual admin API endpoint
      const response = await fetch(`/api/admin/reviews?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleReject = async (reviewId) => {
    if (!confirm('Bạn có chắc muốn ẩn đánh giá này?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to reject review:', error);
    }
  };

  const handleRespondSubmit = async () => {
    if (!adminResponse.trim()) {
      alert('Vui lòng nhập phản hồi');
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${selectedReview.id}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ admin_response: adminResponse })
      });

      if (response.ok) {
        setShowResponseModal(false);
        setAdminResponse('');
        setSelectedReview(null);
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to respond to review:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="star-icon"
            fill={star <= rating ? '#FFB800' : 'none'}
            stroke={star <= rating ? '#FFB800' : '#ddd'}
            size={18}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="review-management">
      <div className="page-header">
        <h1>Quản lý đánh giá</h1>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Đã duyệt
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Chờ duyệt
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="reviews-grid">
          {reviews.length === 0 ? (
            <div className="no-data">Không có đánh giá nào</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-card-header">
                  <div className="menu-item-name">{review.menu_item?.name}</div>
                  <div className="review-status">
                    {review.is_approved ? (
                      <span className="status-badge approved">✓ Đã duyệt</span>
                    ) : (
                      <span className="status-badge pending">⏳ Chờ duyệt</span>
                    )}
                  </div>
                </div>

                <div className="review-rating">
                  {renderStars(review.rating)}
                  <span className="rating-text">({review.rating}/5)</span>
                </div>

                <div className="reviewer-info">
                  <strong>{review.customer_name || 'Khách hàng'}</strong>
                  {review.is_verified_purchase && (
                    <span className="verified">✓ Đã mua</span>
                  )}
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>

                {review.comment && (
                  <div className="review-comment">{review.comment}</div>
                )}

                {review.admin_response && (
                  <div className="admin-response-preview">
                    <strong>Đã phản hồi:</strong>
                    <p>{review.admin_response}</p>
                  </div>
                )}

                <div className="review-actions">
                  {!review.is_approved && (
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(review.id)}
                    >
                      <Check size={16} />
                      Duyệt
                    </button>
                  )}
                  {review.is_approved && (
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(review.id)}
                    >
                      <X size={16} />
                      Ẩn
                    </button>
                  )}
                  <button
                    className="btn-respond"
                    onClick={() => {
                      setSelectedReview(review);
                      setAdminResponse(review.admin_response || '');
                      setShowResponseModal(true);
                    }}
                  >
                    <MessageSquare size={16} />
                    {review.admin_response ? 'Sửa phản hồi' : 'Phản hồi'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Phản hồi đánh giá</h2>
              <button onClick={() => setShowResponseModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="original-review">
                <div className="review-stars">{renderStars(selectedReview.rating)}</div>
                <p><strong>{selectedReview.customer_name}:</strong></p>
                <p>{selectedReview.comment}</p>
              </div>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Nhập phản hồi của nhà hàng..."
                rows={5}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowResponseModal(false)}>
                Huỷ
              </button>
              <button className="btn-submit" onClick={handleRespondSubmit}>
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
