-- Migration: Create reviews table
-- Description: Allow customers to review menu items after ordering
-- Date: 2026-01-15

-- ============================================
-- MENU ITEM REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS menu_item_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(uid) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    customer_name VARCHAR(255),
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON menu_item_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON menu_item_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON menu_item_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON menu_item_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON menu_item_reviews(rating);

-- ============================================
-- ADD REVIEW STATS TO MENU ITEMS
-- ============================================
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2, 1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;

-- ============================================
-- FUNCTION TO UPDATE MENU ITEM RATING STATS
-- ============================================
CREATE OR REPLACE FUNCTION update_menu_item_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update average rating and total reviews for the menu item
    UPDATE menu_items
    SET 
        average_rating = (
            SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
            FROM menu_item_reviews
            WHERE menu_item_id = NEW.menu_item_id 
            AND is_approved = true
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM menu_item_reviews
            WHERE menu_item_id = NEW.menu_item_id 
            AND is_approved = true
        )
    WHERE id = NEW.menu_item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER TO AUTO-UPDATE STATS ON REVIEW INSERT/UPDATE
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_rating_stats_on_insert ON menu_item_reviews;
CREATE TRIGGER trigger_update_rating_stats_on_insert
AFTER INSERT ON menu_item_reviews
FOR EACH ROW
EXECUTE FUNCTION update_menu_item_rating_stats();

DROP TRIGGER IF EXISTS trigger_update_rating_stats_on_update ON menu_item_reviews;
CREATE TRIGGER trigger_update_rating_stats_on_update
AFTER UPDATE ON menu_item_reviews
FOR EACH ROW
WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR OLD.is_approved IS DISTINCT FROM NEW.is_approved)
EXECUTE FUNCTION update_menu_item_rating_stats();

-- ============================================
-- CONSTRAINT: Prevent duplicate reviews from same customer+order+item
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_customer_order_item_review 
ON menu_item_reviews(customer_id, order_id, menu_item_id)
WHERE customer_id IS NOT NULL AND order_id IS NOT NULL;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE menu_item_reviews IS 'Customer reviews and ratings for menu items';
COMMENT ON COLUMN menu_item_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN menu_item_reviews.is_verified_purchase IS 'True if review is from actual order';
COMMENT ON COLUMN menu_item_reviews.is_approved IS 'False if admin hides the review';
COMMENT ON COLUMN menu_item_reviews.admin_response IS 'Restaurant response to customer review';
