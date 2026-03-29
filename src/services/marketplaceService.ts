/**
 * DailyMarket: Marketplace Service
 * 
 * This service manages the product feed for DailyMarket.
 * It is now strictly pulling from the application's own Supabase database
 * to ensure only real products added by the user/merchants are displayed.
 */

import { supabase } from '@/lib/supabase';

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  base_price: number;
  premium_price: number;
  unit: string;
  stock_quantity: number;
  image_url: string;
  supplier_id: string;
  vendor_name: string;
  rating: number;
  reviewCount: number;
}

/**
 * Price calculation logic for the marketplace context
 */
function calculateSmartPrice(basePrice: number): number {
  // Simple 15% markup for the marketplace
  return Math.round(basePrice * 1.15);
}

export async function fetchSAProducts(page = 1, pageSize = 400): Promise<MarketplaceProduct[]> {
  // 🚀 BUILD OPTIMIZATION: Skip fetching from DB during Next.js build phase
  const hasSecrets = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'));
  
  if (!hasSecrets) {
     console.log('[Marketplace] Build environment with no secrets detected. Returning empty list.');
     return [];
  }

  // 1. Fetch from local Supabase DB (Products added via Business Portal)
  try {
    console.log('[Marketplace] Fetching from Supabase products table...');
    const { data: dbData, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Marketplace] Supabase error:', error.message);
      return [];
    }

    if (dbData) {
      console.log(`[Marketplace] Found ${dbData.length} products in Supabase.`);
      return dbData.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category || 'Other',
        base_price: Number(p.base_price),
        premium_price: Number(p.premium_price) || calculateSmartPrice(Number(p.base_price)),
        unit: p.unit || 'Each',
        stock_quantity: Number(p.stock_quantity) || 0,
        image_url: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
        supplier_id: p.supplier_id || 'local',
        vendor_name: p.vendor_name || 'DailyMarket Merchant',
        rating: Number(p.rating) || 4.5,
        reviewCount: Number(p.reviewCount) || 12
      }));
    }
  } catch (err) {
    console.error('[Marketplace] Exception fetching local products:', err);
  }

  return [];
}

export async function fetchProductById(id: string): Promise<MarketplaceProduct | null> {
  // Fetch specific product by ID from Supabase
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category || 'Other',
      base_price: Number(data.base_price),
      premium_price: Number(data.premium_price) || calculateSmartPrice(Number(data.base_price)),
      unit: data.unit || 'Each',
      stock_quantity: Number(data.stock_quantity) || 0,
      image_url: data.image_url,
      supplier_id: data.supplier_id,
      vendor_name: data.vendor_name,
      rating: Number(data.rating) || 4.5,
      reviewCount: Number(data.reviewCount) || 0
    };
  } catch (err) {
    return null;
  }
}
