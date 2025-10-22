-- Fix order status transitions to allow collected -> completed
UPDATE order_statuses
SET can_transition_to = ARRAY['completed']::VARCHAR[]
WHERE code = 'collected' AND business_id IS NULL;

-- Update ready to only transition to collected (not directly to completed)
UPDATE order_statuses
SET can_transition_to = ARRAY['collected']::VARCHAR[]
WHERE code = 'ready' AND business_id IS NULL;
