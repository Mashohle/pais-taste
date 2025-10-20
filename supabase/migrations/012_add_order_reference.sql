-- Add reference column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS reference VARCHAR(20) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);

-- Add comment explaining the format
COMMENT ON COLUMN orders.reference IS 'Human-readable order reference: [BUSINESS_PREFIX]-[LAST_5_CHARS_OF_UUID] e.g., PAI-9B825';
