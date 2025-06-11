-- Update weekend slots maximum from 12 to 6 (3 hours max per weekend)
-- This reflects the policy of maximum 3 hours of weekend studio time per week

BEGIN;

-- Update all members to have 6 weekend slots maximum instead of 12
UPDATE members 
SET weekend_slots_max = 6 
WHERE weekend_slots_max = 12;

-- Also cap any members who have used more than 6 slots this week
-- (shouldn't happen, but safety check)
UPDATE members 
SET weekend_slots_used = LEAST(weekend_slots_used, 6)
WHERE weekend_slots_used > 6;

-- Verify the changes
SELECT 
    COUNT(*) as total_members,
    AVG(weekend_slots_max) as avg_max_slots,
    MAX(weekend_slots_max) as max_weekend_slots,
    MIN(weekend_slots_max) as min_weekend_slots
FROM members;

COMMIT;

-- Summary:
-- - Weekend limit changed from 12 slots (6 hours) to 6 slots (3 hours)
-- - Point cost remains 3 points per weekend slot
-- - Maximum weekend cost: 6 slots × 3 points = 18 points
-- - Leaves 22 points for weekday bookings (22 hours weekday time)
