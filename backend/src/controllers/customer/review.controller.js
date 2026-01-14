// src/controllers/customer/review.controller.js
import MenuItemReview from '../../models/menuItemReview.js';
import MenuItem from '../../models/menuItem.js';
import Order from '../../models/order.js';
import OrderItem from '../../models/orderItem.js';
import sequelize from '../../config/database.js';
import { Op } from 'sequelize';

// POST /api/customer/reviews - Create a review for a menu item
export const createReview = async (req, res) => {
  try {
    const { menu_item_id, rating, comment, order_id, customer_name } = req.body;
    const customer_id = req.customer?.uid || null;

    // Validation
    if (!menu_item_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Menu item ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if menu item exists
    const menuItem = await MenuItem.findByPk(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Check if customer already reviewed this item from this order
    if (customer_id && order_id) {
      const existingReview = await MenuItemReview.findOne({
        where: {
          customer_id,
          order_id,
          menu_item_id
        }
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          error: 'You have already reviewed this item from this order'
        });
      }
    }

    // Verify if this is from actual order
    let is_verified_purchase = false;
    if (order_id) {
      const orderItem = await OrderItem.findOne({
        where: {
          order_id,
          menu_item_id
        }
      });
      is_verified_purchase = !!orderItem;
    }

    // Create review
    const review = await MenuItemReview.create({
      menu_item_id,
      customer_id,
      order_id,
      rating,
      comment: comment || null,
      customer_name: customer_name || req.customer?.full_name || 'Anonymous',
      is_verified_purchase,
      is_approved: true // Auto-approve for now, can add moderation later
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('❌ Create review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create review'
    });
  }
};

// GET /api/customer/reviews/menu-item/:menuItemId - Get reviews for a menu item
export const getMenuItemReviews = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    const offset = (page - 1) * limit;

    // Sort options
    let order;
    switch (sort) {
      case 'highest':
        order = [['rating', 'DESC'], ['created_at', 'DESC']];
        break;
      case 'lowest':
        order = [['rating', 'ASC'], ['created_at', 'DESC']];
        break;
      case 'oldest':
        order = [['created_at', 'ASC']];
        break;
      case 'recent':
      default:
        order = [['created_at', 'DESC']];
    }

    const { count, rows: reviews } = await MenuItemReview.findAndCountAll({
      where: {
        menu_item_id: menuItemId,
        is_approved: true
      },
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: {
        exclude: ['is_approved'] // Hide moderation flag from customers
      }
    });

    // Calculate statistics
    const stats = await MenuItemReview.findOne({
      where: {
        menu_item_id: menuItemId,
        is_approved: true
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_reviews'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 5 THEN 1 END')), 'five_star'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 4 THEN 1 END')), 'four_star'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 3 THEN 1 END')), 'three_star'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 2 THEN 1 END')), 'two_star'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 1 THEN 1 END')), 'one_star'],
      ],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: {
          average_rating: parseFloat(stats.average_rating || 0).toFixed(1),
          total_reviews: parseInt(stats.total_reviews || 0),
          rating_distribution: {
            5: parseInt(stats.five_star || 0),
            4: parseInt(stats.four_star || 0),
            3: parseInt(stats.three_star || 0),
            2: parseInt(stats.two_star || 0),
            1: parseInt(stats.one_star || 0),
          }
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get reviews'
    });
  }
};

// GET /api/customer/reviews/order/:orderId/can-review - Check which items customer can review
export const getReviewableItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    const customer_id = req.customer?.uid;

    // Get order items
    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
      include: [
        {
          model: MenuItem,
          as: 'menu_item',
          attributes: ['id', 'name', 'price']
        }
      ]
    });

    if (orderItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or has no items'
      });
    }

    // Get existing reviews for this order
    const existingReviews = await MenuItemReview.findAll({
      where: {
        order_id: orderId,
        ...(customer_id && { customer_id })
      },
      attributes: ['menu_item_id']
    });

    const reviewedItemIds = existingReviews.map(r => r.menu_item_id);

    // Filter items that haven't been reviewed
    const reviewableItems = orderItems
      .filter(item => !reviewedItemIds.includes(item.menu_item_id))
      .map(item => ({
        order_item_id: item.id,
        menu_item_id: item.menu_item_id,
        name: item.menu_item.name,
        quantity: item.quantity,
        price: item.menu_item.price,
        can_review: true
      }));

    res.status(200).json({
      success: true,
      data: {
        order_id: orderId,
        reviewable_items: reviewableItems,
        already_reviewed: orderItems.length - reviewableItems.length,
        total_items: orderItems.length
      }
    });

  } catch (error) {
    console.error('❌ Get reviewable items error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get reviewable items'
    });
  }
};

// PUT /api/customer/reviews/:id - Update own review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const customer_id = req.customer?.uid;

    const review = await MenuItemReview.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check ownership
    if (customer_id && review.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own reviews'
      });
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    review.updated_at = new Date();
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('❌ Update review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update review'
    });
  }
};

// DELETE /api/customer/reviews/:id - Delete own review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.customer?.uid;

    const review = await MenuItemReview.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check ownership
    if (customer_id && review.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own reviews'
      });
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete review'
    });
  }
};
