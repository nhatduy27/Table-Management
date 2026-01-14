import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import './ReviewList.css';

const ReviewList = ({ menuItemId, showTitle = true }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [menuItemId, sortBy, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Import customerService to use proper API instance
      const customerService = (await import('../../services/customerService')).default;
      const data = await customerService.getMenuItemReviews(menuItemId, {
        page: currentPage,
        limit: 5,
        sort: sortBy
      });

      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
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
            size={16}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    const distribution = stats.rating_distribution;
    const total = stats.total_reviews;

    return (
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={star} className="rating-row">
              <span className="star-label">{star} ⭐</span>
              <div className="rating-bar-container">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="rating-count">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  if (loading && currentPage === 1) {
    return <div className="loading">Đang tải đánh giá...</div>;
  }

  return (
    <div className="review-list-container">
      {showTitle && <h3 className="reviews-title">Đánh giá từ khách hàng</h3>}

      {/* Overall Rating Summary */}
      {stats && (
        <div className="rating-summary">
          <div className="average-rating">
            <div className="rating-number">{stats.average_rating}</div>
            <div className="rating-stars">{renderStars(Math.round(parseFloat(stats.average_rating)))}</div>
            <div className="total-reviews">{stats.total_reviews} đánh giá</div>
          </div>
          {renderRatingDistribution()}
        </div>
      )}

      {/* Sort Options */}
      <div className="reviews-controls">
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="sort-select"
        >
          <option value="recent">Mới nhất</option>
          <option value="highest">Đánh giá cao nhất</option>
          <option value="lowest">Đánh giá thấp nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>Chưa có đánh giá nào cho món này.</p>
            <p>Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.customer_name?.charAt(0).toUpperCase() || 'K'}
                  </div>
                  <div>
                    <div className="reviewer-name">
                      {review.customer_name || 'Khách hàng'}
                      {review.is_verified_purchase && (
                        <span className="verified-badge" title="Đã mua hàng">
                          <ThumbsUp size={14} />
                        </span>
                      )}
                    </div>
                    <div className="review-date">{formatDate(review.created_at)}</div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {review.comment && (
                <div className="review-comment">{review.comment}</div>
              )}

              {review.admin_response && (
                <div className="admin-response">
                  <strong>Phản hồi từ nhà hàng:</strong>
                  <p>{review.admin_response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
