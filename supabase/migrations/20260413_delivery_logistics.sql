-- 1. Drop existing constraint on seller_orders
ALTER TABLE public.seller_orders DROP CONSTRAINT IF EXISTS seller_orders_status_check;

-- 2. Re-create constraint with all real-time delivery phases
ALTER TABLE public.seller_orders ADD CONSTRAINT seller_orders_status_check
  CHECK (status IN ('pending', 'preparing', 'ready', 'accepted', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'));

-- 3. Drivers Table for Live Locations
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  vehicle_info TEXT, -- e.g. "White Toyota Corolla (CA 123 456)"
  status TEXT DEFAULT 'offline' CHECK (status IN ('offline', 'available', 'busy')),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  current_order_ref TEXT,
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert drivers" ON public.drivers;
DROP POLICY IF EXISTS "Anyone can read drivers" ON public.drivers;
DROP POLICY IF EXISTS "Anyone can update drivers" ON public.drivers;

CREATE POLICY "Anyone can insert drivers" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Anyone can update drivers" ON public.drivers FOR UPDATE USING (true);

-- 4. Store GPS table for actual Cash & Carry mapping
CREATE TABLE IF NOT EXISTS public.store_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert store_locations" ON public.store_locations;
DROP POLICY IF EXISTS "Anyone can read store_locations" ON public.store_locations;
DROP POLICY IF EXISTS "Anyone can update store_locations" ON public.store_locations;

CREATE POLICY "Anyone can insert store_locations" ON public.store_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read store_locations" ON public.store_locations FOR SELECT USING (true);
CREATE POLICY "Anyone can update store_locations" ON public.store_locations FOR UPDATE USING (true);

-- Insert Unity Cash & Carry
INSERT INTO public.store_locations (vendor_name, address, lat, lng)
VALUES ('Unity cash and carry', '14 Main Road, Cape Town', -33.917957, 18.417252)
ON CONFLICT (vendor_name) DO UPDATE SET lat = EXCLUDED.lat, lng = EXCLUDED.lng;

-- Create default test driver David T.
INSERT INTO public.drivers (first_name, last_name, vehicle_info, status, lat, lng)
VALUES ('David', 'T.', 'Honda Fit (Silver)', 'available', -33.931210, 18.428312);
