-- Migration: Add search analytics and user consent tracking
-- This tracks what users search for to understand demand

-- Search Analytics Table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query VARCHAR(255) NOT NULL,
    results_count INTEGER DEFAULT 0,
    selected_item_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user ON search_analytics(user_id);

-- Add consent columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS data_collection_consent BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS data_collection_consent_at TIMESTAMP;

-- Popular searches view (aggregated data for suggestions)
CREATE OR REPLACE VIEW popular_searches AS
SELECT
    LOWER(query) as query,
    COUNT(*) as search_count,
    AVG(results_count) as avg_results,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(created_at) as last_searched
FROM search_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY LOWER(query)
HAVING COUNT(*) >= 3
ORDER BY search_count DESC
LIMIT 50;

-- Zero results searches (demand for equipment you don't have)
CREATE OR REPLACE VIEW zero_result_searches AS
SELECT
    LOWER(query) as query,
    COUNT(*) as search_count,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(created_at) as last_searched
FROM search_analytics
WHERE results_count = 0
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY LOWER(query)
HAVING COUNT(*) >= 2
ORDER BY search_count DESC
LIMIT 50;

SELECT 'Migration completed: Added search analytics and user consent tracking' AS status;
