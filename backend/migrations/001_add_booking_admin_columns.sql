-- Migration: Add admin booking management columns
-- Run this migration to add columns for admin booking features

-- Add admin notes column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add cancellation tracking columns
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES users(id);

-- Add extension tracking columns
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extension_reason TEXT;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extended_at TIMESTAMP;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extended_by UUID REFERENCES users(id);

-- Add reactivation tracking columns
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS reactivated_by UUID REFERENCES users(id);

-- Update payment_status check constraint to include 'partial_refund'
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_payment_status_check
CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partial_refund'));

-- Success message
SELECT 'Migration completed: Added admin booking management columns' AS status;
