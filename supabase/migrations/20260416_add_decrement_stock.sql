-- Add RPC function to securely decrement stock
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = GREATEST(stock_quantity - p_qty, 0)
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
