-- ═══════════════════════════════════════════════════════════════
-- Fix: Seller Orders Sync to Business Portal
-- Date: 2026-04-10
-- ═══════════════════════════════════════════════════════════════

-- 1. Ensure seller_orders table exists with all required columns
CREATE TABLE IF NOT EXISTS public.seller_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref       TEXT NOT NULL,
  vendor_name     TEXT NOT NULL,
  product_title   TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  amount          DECIMAL(10,2) NOT NULL,
  customer_amount DECIMAL(10,2),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','completed','delivered','cancelled')),
  customer_name   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- 2. Add customer_name column if table already existed without it
ALTER TABLE public.seller_orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- 3. Fix orders table status constraint to include 'processing' and 'completed'
-- Drop the old constraint first, then recreate it with all valid statuses
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'));

-- 4. Enable RLS on seller_orders
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;

-- 5. Allow public/anon INSERT (used by the web app's API route with anon key)
DROP POLICY IF EXISTS "Allow anon insert seller_orders" ON public.seller_orders;
CREATE POLICY "Allow anon insert seller_orders"
  ON public.seller_orders
  FOR INSERT
  WITH CHECK (true);

-- 6. Allow public SELECT (used by the business portal to read orders)
DROP POLICY IF EXISTS "Allow anon select seller_orders" ON public.seller_orders;
CREATE POLICY "Allow anon select seller_orders"
  ON public.seller_orders
  FOR SELECT
  USING (true);

-- 7. Allow public UPDATE (for status changes from business portal)
DROP POLICY IF EXISTS "Allow anon update seller_orders" ON public.seller_orders;
CREATE POLICY "Allow anon update seller_orders"
  ON public.seller_orders
  FOR UPDATE
  USING (true);

-- Done!
