'use server';

import { supabase } from '@/lib/supabase';

export async function getProducts(vendorName: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_name', vendorName)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, products: [] };
  }

  return { success: true, products: data || [] };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
