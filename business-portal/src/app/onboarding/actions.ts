'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addProduct(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const basePrice = parseFloat(formData.get('basePrice') as string);
  const unit = formData.get('unit') as string;
  const stock = parseInt(formData.get('stock') as string);
  const vendorName = formData.get('vendorName') as string;
  const imageFile = formData.get('imageFile') as File;
  
  // Apply our "Elite" pricing logic: 15% markup + rounding
  const markupValue = 1.15;
  const premiumPrice = Math.round(basePrice * markupValue * 100) / 100;

  let finalImageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop&q=80';

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${vendorName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('product-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Failed to upload product image: ' + uploadError.message };
    }

    // Get Public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(filePath);

    finalImageUrl = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        title,
        description,
        category,
        base_price: basePrice,
        premium_price: premiumPrice,
        unit,
        stock_quantity: stock,
        vendor_name: vendorName,
        supplier_id: vendorName.toLowerCase().replace(/\s+/g, '-'),
        image_url: finalImageUrl,
      },
    ]);

  if (error) {
    console.error('Error adding product:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

