-- Migration: Create products table for manual merchant entry
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    premium_price DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 50,
    image_url TEXT,
    supplier_id TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    reviewCount INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON public.products
    FOR SELECT USING (true);

-- Create policy for authenticated insert (simplified for now)
CREATE POLICY "Allow anonymous insert for testing" ON public.products
    FOR INSERT WITH CHECK (true);
