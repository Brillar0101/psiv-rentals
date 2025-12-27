-- PSIV Rentals Database Schema
-- Run this file to create all necessary tables

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- Stores customer and admin accounts
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- EQUIPMENT CATEGORIES TABLE
-- Categories like Cameras, Audio, Lighting, etc.
-- =============================================
CREATE TABLE equipment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- EQUIPMENT TABLE
-- Your actual camera/video equipment
-- DSA: This table uses indexes for fast lookups (Hash Map concept)
-- =============================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES equipment_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    description TEXT,
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_rate DECIMAL(10, 2),
    replacement_value DECIMAL(10, 2) NOT NULL,
    damage_deposit DECIMAL(10, 2) NOT NULL,
    quantity_total INTEGER DEFAULT 1,
    quantity_available INTEGER DEFAULT 1,
    condition VARCHAR(50) DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'maintenance')),
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    popularity_score INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DSA: B-Tree indexes for fast searching (O(log n) lookup time)
CREATE INDEX idx_equipment_name ON equipment(name);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_available ON equipment(quantity_available) WHERE is_active = TRUE;

-- =============================================
-- BOOKINGS TABLE
-- Customer reservations
-- DSA: Date range queries for availability checking
-- =============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER,
    daily_rate DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    damage_deposit DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    stripe_payment_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DSA: Indexes for fast booking queries
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =============================================
-- REVIEWS TABLE
-- Customer ratings and reviews
-- =============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id)
);

CREATE INDEX idx_reviews_equipment ON reviews(equipment_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- Automatic updates
-- =============================================

-- Function to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for equipment table
CREATE TRIGGER update_equipment_updated_at 
BEFORE UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings table
CREATE TRIGGER update_bookings_updated_at 
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSERT DEFAULT CATEGORIES
-- =============================================
INSERT INTO equipment_categories (name, description) VALUES
('Cameras', 'DSLR, Mirrorless, and Cinema cameras'),
('Lenses', 'Prime and zoom lenses for various mounts'),
('Lighting', 'LED panels, strobes, softboxes, and modifiers'),
('Audio', 'Microphones, recorders, and wireless systems'),
('Stabilization', 'Gimbals, tripods, monopods, and sliders'),
('Accessories', 'Batteries, memory cards, cables, and more'),
('Drones', 'Aerial photography and videography');

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Database schema created successfully! ✅' AS status;
