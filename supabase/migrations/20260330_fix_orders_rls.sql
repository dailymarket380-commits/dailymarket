-- Fix: Add missing INSERT and UPDATE policies for orders table
-- This allows authenticated users to place orders and the system to update order status

-- Allow authenticated users to insert their own orders
CREATE POLICY "Users can insert own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to insert order items
CREATE POLICY "Users can insert order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (true);

-- Allow system to update order status (for PayFast webhook)
CREATE POLICY "System can update orders"
  ON public.orders
  FOR UPDATE
  USING (true);

-- Allow users to see their own order items
CREATE POLICY "Users can see own order items"
  ON public.order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );
