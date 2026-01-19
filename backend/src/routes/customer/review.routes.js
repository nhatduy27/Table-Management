// src/routes/customer/review.routes.js
import express from 'express';
import {
  createReview,
  getMenuItemReviews,
  getReviewableItems,
  updateReview,
  deleteReview
} from '../../controllers/customer/review.controller.js';
import authCustomer from '../../middlewares/authCustomer.middleware.js';

const router = express.Router();

// GET /api/customer/reviews/menu-item/:menuItemId - Get reviews for a menu item
router.get('/menu-item/:menuItemId', getMenuItemReviews);

router.use(authCustomer);

// POST /api/customer/reviews - Create a new review
router.post('/', createReview);

// GET /api/customer/reviews/order/:orderId/can-review - Check reviewable items
router.get('/order/:orderId/can-review', getReviewableItems);

// PUT /api/customer/reviews/:id - Update own review
router.put('/:id', updateReview);

// DELETE /api/customer/reviews/:id - Delete own review
router.delete('/:id', deleteReview);

export default router;