-- ============================================================================
-- Sample Products for Fatima Zehra Boutique - 40 Products (10 per category)
-- ============================================================================
-- This file contains initial data seeding for development/testing
--
-- Usage:
--   psql $DATABASE_URL < database/seeds/sample_products.sql
--
-- ============================================================================

-- Create categories (matching frontend CATEGORIES in lib/products.ts)
INSERT INTO categories (id, name, description) VALUES
(1, 'Fancy Suits', 'Elegant party wear with intricate embroidery'),
(2, 'Shalwar Qameez', 'Traditional and contemporary shalwar qameez designs'),
(3, 'Cotton Suits', 'Comfortable cotton suits for everyday wear'),
(4, 'Designer Brands', 'Premium designer brand collections')
ON CONFLICT (id) DO NOTHING;

-- ==================== FANCY SUITS (1-10) ====================
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, featured, is_active) VALUES
('Royal Embroidered Fancy Suit', 'Elegant party wear with intricate hand embroidery and premium fabric.', 8500, 1, '/images/fancy-suits/fancy-suits-01.jpg', 50, true, true),
('Golden Zari Work Suit', 'Luxurious golden zari embroidery perfect for weddings and special occasions.', 9500, 1, '/images/fancy-suits/fancy-suits-02.jpg', 50, true, true),
('Pearl Embellished Fancy Dress', 'Beautiful pearl work with delicate sequins for a sophisticated look.', 7800, 1, '/images/fancy-suits/fancy-suits-03.jpg', 50, false, true),
('Velvet Royal Collection', 'Premium velvet suit with traditional motifs and modern cuts.', 11000, 1, '/images/fancy-suits/fancy-suits-04.jpg', 50, false, true),
('Crystal Stone Work Suit', 'Dazzling crystal stone work for glamorous evening events.', 8900, 1, '/images/fancy-suits/fancy-suits-05.jpg', 50, false, true),
('Bridal Fancy Ensemble', 'Exquisite bridal collection with heavy embroidery and dupatta.', 15000, 1, '/images/fancy-suits/fancy-suits-06.jpg', 50, true, true),
('Mirror Work Designer Suit', 'Traditional mirror work with contemporary design elements.', 7500, 1, '/images/fancy-suits/fancy-suits-07.jpg', 50, false, true),
('Pastel Fancy Collection', 'Soft pastel shades with delicate threadwork for elegant occasions.', 6800, 1, '/images/fancy-suits/fancy-suits-08.jpg', 50, false, true),
('Maroon Festive Suit', 'Rich maroon color with gold accents for festive celebrations.', 8200, 1, '/images/fancy-suits/fancy-suits-09.jpg', 50, false, true),
('Navy Blue Sequin Suit', 'Stunning navy blue with all-over sequin work for party nights.', 9200, 1, '/images/fancy-suits/fancy-suits-10.jpg', 50, false, true)
ON CONFLICT DO NOTHING;

-- ==================== SHALWAR QAMEEZ (11-20) ====================
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, featured, is_active) VALUES
('Classic White Shalwar Qameez', 'Timeless white with subtle embroidery for everyday elegance.', 3500, 2, '/images/shalwar-qameez/shalwar-qameez-01.jpg', 50, false, true),
('Printed Lawn Collection', 'Vibrant digital prints for a fresh summer look.', 2800, 2, '/images/shalwar-qameez/shalwar-qameez-02.jpg', 50, false, true),
('Embroidered Neck Design', 'Beautiful neck embroidery with matching trouser and dupatta.', 4200, 2, '/images/shalwar-qameez/shalwar-qameez-03.jpg', 50, false, true),
('Traditional Block Print', 'Hand block printed design with traditional patterns.', 3200, 2, '/images/shalwar-qameez/shalwar-qameez-04.jpg', 50, false, true),
('Pastel Summer Collection', 'Light and breezy pastel shades perfect for summer days.', 2600, 2, '/images/shalwar-qameez/shalwar-qameez-05.jpg', 50, false, true),
('Chikan Kari Suit', 'Authentic Lucknowi chikan embroidery on premium fabric.', 5500, 2, '/images/shalwar-qameez/shalwar-qameez-06.jpg', 50, true, true),
('Floral Print Daily Wear', 'Cheerful floral prints for comfortable daily wear.', 2400, 2, '/images/shalwar-qameez/shalwar-qameez-07.jpg', 50, false, true),
('Geometric Pattern Suit', 'Modern geometric patterns with contrast borders.', 3100, 2, '/images/shalwar-qameez/shalwar-qameez-08.jpg', 50, false, true),
('Eid Special Collection', 'Special Eid collection with premium finish and dupatta.', 4800, 2, '/images/shalwar-qameez/shalwar-qameez-09.jpg', 50, false, true),
('Royal Blue Shalwar Qameez', 'Elegant royal blue with silver embroidery accents.', 3800, 2, '/images/shalwar-qameez/shalwar-qameez-10.jpg', 50, false, true)
ON CONFLICT DO NOTHING;

-- ==================== COTTON SUITS (21-30) ====================
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, featured, is_active) VALUES
('Pure Cotton Comfort Suit', '100% pure cotton for maximum comfort in all seasons.', 2200, 3, '/images/cotton-suits/cotton-suits-01.jpg', 50, false, true),
('Organic Cotton Collection', 'Eco-friendly organic cotton for conscious fashion.', 2800, 3, '/images/cotton-suits/cotton-suits-02.jpg', 50, false, true),
('Printed Cotton Daily Wear', 'Cheerful prints for everyday comfort and style.', 1900, 3, '/images/cotton-suits/cotton-suits-03.jpg', 50, false, true),
('Handloom Cotton Suit', 'Authentic handloom cotton with natural dyes.', 3500, 3, '/images/cotton-suits/cotton-suits-04.jpg', 50, false, true),
('Khadi Cotton Classic', 'Traditional khadi cotton with modern cuts.', 3200, 3, '/images/cotton-suits/cotton-suits-05.jpg', 50, false, true),
('Summer Breathable Suit', 'Ultra-breathable cotton for hot summer days.', 2100, 3, '/images/cotton-suits/cotton-suits-06.jpg', 50, false, true),
('Stripes Cotton Collection', 'Classic stripes pattern for a timeless look.', 2400, 3, '/images/cotton-suits/cotton-suits-07.jpg', 50, false, true),
('Linen Cotton Blend', 'Luxurious linen-cotton blend for special occasions.', 3800, 3, '/images/cotton-suits/cotton-suits-08.jpg', 50, false, true),
('Embroidered Cotton Suit', 'Light embroidery on pure cotton for semi-formal wear.', 2900, 3, '/images/cotton-suits/cotton-suits-09.jpg', 50, false, true),
('Pastel Cotton Collection', 'Soft pastel shades in comfortable cotton fabric.', 2300, 3, '/images/cotton-suits/cotton-suits-10.jpg', 50, false, true)
ON CONFLICT DO NOTHING;

-- ==================== DESIGNER BRANDS (31-40) ====================
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, featured, is_active) VALUES
('Maria B Premium Collection', 'Exclusive Maria B designer suit with premium finishing.', 12500, 4, '/images/designer-brands/designer-brands-01.jpg', 50, true, true),
('Sana Safinaz Luxury', 'Sana Safinaz signature collection with intricate details.', 14000, 4, '/images/designer-brands/designer-brands-02.jpg', 50, true, true),
('Khaadi Exclusive', 'Khaadi exclusive print with traditional craftsmanship.', 8500, 4, '/images/designer-brands/designer-brands-03.jpg', 50, false, true),
('Gul Ahmed Premium', 'Gul Ahmed premium lawn with digital embroidery.', 7800, 4, '/images/designer-brands/designer-brands-04.jpg', 50, false, true),
('Alkaram Studio', 'Alkaram Studio festive collection with luxury dupatta.', 9200, 4, '/images/designer-brands/designer-brands-05.jpg', 50, false, true),
('Sapphire Designer Suit', 'Sapphire signature style with modern aesthetics.', 6800, 4, '/images/designer-brands/designer-brands-06.jpg', 50, false, true),
('Nishat Linen Luxury', 'Nishat Linen premium collection with exclusive prints.', 7200, 4, '/images/designer-brands/designer-brands-07.jpg', 50, false, true),
('Ethnic by Outfitters', 'Contemporary ethnic wear with fusion elements.', 5500, 4, '/images/designer-brands/designer-brands-08.jpg', 50, false, true),
('Bonanza Satrangi', 'Bonanza Satrangi vibrant collection for festive season.', 6200, 4, '/images/designer-brands/designer-brands-09.jpg', 50, false, true),
('Limelight Designer', 'Limelight designer suit with premium embellishments.', 5800, 4, '/images/designer-brands/designer-brands-10.jpg', 50, false, true)
ON CONFLICT DO NOTHING;

-- Create test user
INSERT INTO users (email, password_hash, full_name, phone, address, is_active) VALUES
('test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUWzpw4a', 'Test User', '+92 300 1234567', '123 Main Street, Karachi, Pakistan', true)
ON CONFLICT (email) DO NOTHING;

-- Verify insertions
SELECT 'Categories:' as check, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products:', COUNT(*) FROM products
UNION ALL
SELECT 'Users:', COUNT(*) FROM users;
