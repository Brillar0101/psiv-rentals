-- Migration: Update equipment prices to student-friendly range ($5-$45/day)
-- Run this migration to make rental prices more affordable for students

-- Update daily rates to be between $5 and $45
-- Using a formula based on current price tiers:
-- - Basic items (tripods, lights, etc.): $5-$15/day
-- - Mid-range items (cameras, lenses): $15-$30/day
-- - Premium items (cinema cameras, drones): $30-$45/day

UPDATE equipment SET
    daily_rate = CASE
        -- Basic equipment: tripods, basic lights, reflectors, etc.
        WHEN daily_rate <= 25 THEN GREATEST(5, LEAST(15, daily_rate * 0.25))
        -- Mid-range: cameras, lenses, monitors
        WHEN daily_rate <= 75 THEN GREATEST(15, LEAST(30, daily_rate * 0.3))
        -- Premium: cinema cameras, drones, high-end gear
        ELSE GREATEST(30, LEAST(45, daily_rate * 0.35))
    END,
    weekly_rate = CASE
        -- Weekly rate is typically 5x daily (discount for longer rentals)
        WHEN daily_rate <= 25 THEN GREATEST(25, LEAST(75, daily_rate * 0.25 * 5))
        WHEN daily_rate <= 75 THEN GREATEST(75, LEAST(150, daily_rate * 0.3 * 5))
        ELSE GREATEST(150, LEAST(225, daily_rate * 0.35 * 5))
    END,
    -- Remove high damage deposits - students shouldn't worry about this
    damage_deposit = 0
WHERE is_active = true;

-- Verify the changes
SELECT id, name, daily_rate, weekly_rate, damage_deposit
FROM equipment
WHERE is_active = true
ORDER BY daily_rate;
