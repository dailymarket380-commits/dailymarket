import { supabase } from '@/lib/supabase';

export interface Product {
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
  vendor_name?: string;
  rating: number;
  reviewCount: number;
  badge?: string;
}

function mapRow(p: any): Product {
  return {
    ...p,
    premium_price: Number(p.premium_price) || Number(p.base_price) * 1.15,
    rating: Number(p.rating) || 4.5,
    reviewCount: Number(p.reviewCount) || 0,
  };
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[productService] getAllProducts error:', error.message);
      return [];
    }
    return (data || []).map(mapRow);
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[productService] getProductsByCategory error:', error.message);
      return [];
    }
    return (data || []).map(mapRow);
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapRow(data);
  },

  async searchProducts(term: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,vendor_name.ilike.%${term}%`)
      .order('stock_quantity', { ascending: false })
      .limit(40);

    if (error) {
      console.error('[productService] searchProducts error:', error.message);
      return [];
    }
    return (data || []).map(mapRow);
  },

  async getCategories(): Promise<string[]> {
    const { data } = await supabase
      .from('products')
      .select('category');
    
    const cats = new Set((data || []).map((p: any) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }
};
