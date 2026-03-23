-- Initial schema for FreshProduce premium food e-commerce

-- 1. Suppliers (Verified premium food suppliers)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    delivery_rules JSONB DEFAULT '{"radius_km": 50, "delivery_fee": 0}'::jsonb,
    is_verified BOOLEAN DEFAULT true,
    rating DECIMAL(2,1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products (With base and premium pricing)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL, -- Original supplier price
    premium_price DECIMAL(10,2) GENERATED ALWAYS AS (base_price * 1.10) STORED, -- 10% premium markup
    unit TEXT NOT NULL, -- e.g., 'each', '1kg'
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Profiles (User roles and info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'supplier', 'admin')),
    address_coords JSONB, -- { lat, lng }
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL, -- Price at point of purchase
    supplier_id UUID REFERENCES public.suppliers(id) -- Track which supplier fulfills this item
);

-- RLS (Row Level Security) - Basic setup
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for products and suppliers
CREATE POLICY "Public products read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public suppliers read access" ON public.suppliers FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Users can see own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Order policies
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
