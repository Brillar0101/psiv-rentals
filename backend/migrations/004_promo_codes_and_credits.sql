-- Migration: Add promo codes and user credits system
-- Supports: one-time codes, percentage discounts, fixed amounts, and credit additions

-- ============================================
-- PROMO CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,

    -- Type: 'percentage', 'fixed_amount', 'credit' (adds to wallet)
    discount_type VARCHAR(20) NOT NULL DEFAULT 'fixed_amount',

    -- Value: percentage (0-100) or dollar amount
    discount_value DECIMAL(10, 2) NOT NULL,

    -- Minimum order amount required to use this code
    min_order_amount DECIMAL(10, 2) DEFAULT 0,

    -- Maximum discount (for percentage codes)
    max_discount DECIMAL(10, 2),

    -- Usage limits
    max_uses INTEGER, -- NULL = unlimited
    current_uses INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1, -- How many times same user can use

    -- Validity
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Who created it
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick code lookup
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, expires_at);

-- ============================================
-- PROMO CODE USAGE TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS promo_code_uses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Amount discounted or credited
    discount_applied DECIMAL(10, 2) NOT NULL,
    credit_added DECIMAL(10, 2) DEFAULT 0,

    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(promo_code_id, user_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_uses_user ON promo_code_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_uses_code ON promo_code_uses(promo_code_id);

-- ============================================
-- USER CREDITS/WALLET TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

    -- Current balance
    balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0),

    -- Lifetime stats
    total_earned DECIMAL(10, 2) DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);

-- ============================================
-- CREDIT TRANSACTIONS (History)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Type: 'promo_code', 'refund', 'purchase', 'admin_adjustment', 'booking_payment'
    transaction_type VARCHAR(30) NOT NULL,

    -- Positive = credit added, Negative = credit used
    amount DECIMAL(10, 2) NOT NULL,

    -- Balance after transaction
    balance_after DECIMAL(10, 2) NOT NULL,

    -- Reference to related record
    reference_id UUID, -- Could be promo_code_id, booking_id, etc.
    reference_type VARCHAR(30), -- 'promo_code', 'booking', 'refund'

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

-- ============================================
-- CREATE YOUR $1000 PROMO CODE
-- ============================================
INSERT INTO promo_codes (
    code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_uses,
    max_uses_per_user,
    expires_at,
    is_active
) VALUES (
    'PSIV1000',
    'Special $1000 credit promo code - unused amount goes to wallet',
    'credit',
    1000.00,
    0,
    1,  -- Only 1 total use
    1,  -- 1 use per user
    NOW() + INTERVAL '1 year',
    TRUE
);

-- Also create some sample promo codes for testing
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active) VALUES
('WELCOME10', 'Welcome discount - 10% off first order', 'percentage', 10.00, 0, NULL, NOW() + INTERVAL '1 year', TRUE),
('STUDENT20', 'Student discount - 20% off', 'percentage', 20.00, 0, NULL, NOW() + INTERVAL '1 year', TRUE),
('FLAT5', '$5 off any order', 'fixed_amount', 5.00, 10.00, NULL, NOW() + INTERVAL '1 year', TRUE),
('CREDIT50', 'Get $50 credit for your wallet', 'credit', 50.00, 0, 100, NOW() + INTERVAL '6 months', TRUE);

SELECT 'Migration completed: Promo codes and credits system created!' AS status;
SELECT '🎉 Your promo code is: PSIV1000 ($1000 credit)' AS your_promo_code;
