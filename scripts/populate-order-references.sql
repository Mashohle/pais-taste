-- Script to populate reference for all existing orders
-- Format: [FIRST_3_CHARS_OF_BUSINESS_NAME]-[LAST_5_CHARS_OF_ORDER_UUID]
-- Example: PAI-9B825

UPDATE orders
SET reference = (
  SELECT
    UPPER(LEFT(b.name, 3)) || '-' || UPPER(RIGHT(orders.id::text, 5))
  FROM businesses b
  WHERE b.id = orders.business_id
)
WHERE reference IS NULL;

-- Verify the update
SELECT
  id,
  reference,
  customer_name,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
