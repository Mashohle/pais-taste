-- Add completed_at and updated_at timestamps to orders table
-- completed_at: tracks when an order was actually completed (not just when it was created)
-- updated_at: automatically updated whenever the order is modified

DO $$
BEGIN
  -- Add completed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- Backfill updated_at for existing orders using created_at
UPDATE orders
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Backfill completed_at for existing completed orders using created_at as a fallback
UPDATE orders
SET completed_at = created_at
WHERE (order_status = 'completed' OR order_status_code = 'completed')
  AND completed_at IS NULL;

-- Create trigger to automatically update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
