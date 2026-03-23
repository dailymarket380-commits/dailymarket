import { calculatePremiumPrice } from '@/utils/pricing';
import { Product } from './productService';

/**
 * Service to simulate Shopify-style "Magic Add" functionality.
 * This simulates an AI that can parse natural language into structured product data.
 */
export const aiService = {
  /**
   * Simulates parsing a natural language string into a drafted Product.
   * In a real implementation, this would call an LLM (e.g., GPT-4 or Gemini).
   */
  async parseMagicProduct(input: string): Promise<Partial<Product>> {
    const text = input.toLowerCase();
    
    // Simple heuristic parser for the demo
    // Example: "We just got 100 boxes of Cape Honeyglow Pineapples, R25 each"
    
    // 1. Extract Price (e.g., R25 or 25.00)
    const priceMatch = input.match(/[Rr]?\s?(\d+([.,]\d{2})?)/);
    const basePrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
    
    // 2. Extract Quantity (e.g., 100 units/boxes)
    const qtyMatch = text.match(/(\d+)\s?(units|boxes|pk|crates|qty)/);
    const qty = qtyMatch ? parseInt(qtyMatch[1]) : 0;
    
    // 3. Extract Category (Basic mapping)
    let category = 'fruit-veg';
    if (text.includes('meat') || text.includes('steak') || text.includes('chicken')) category = 'meat-poultry';
    if (text.includes('bread') || text.includes('cake') || text.includes('bakery')) category = 'bakery';
    
    // 4. Extract Unit
    let unit = 'ea';
    if (text.includes('box')) unit = 'box';
    if (text.includes('kg')) unit = '1kg';
    if (text.includes('pack') || text.includes('pk')) unit = 'pk';

    // 5. Clean Title (Remove price and quantity context)
    let title = input
      .replace(/[Rr]?\s?(\d+([.,]\d{2})?)/g, '') // remove price
      .replace(/(\d+)\s?(units|boxes|pk|crates|qty|ea|each)/gi, '') // remove qty/unit
      .replace(/i have|we got|just arrived|at|for|each/gi, '') // remove fillers
      .trim();
    
    // Capitalize first letter
    title = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return {
      title: title || 'New Premium Product',
      description: `AI Generated draft from: "${input}"`,
      category,
      base_price: basePrice,
      premium_price: calculatePremiumPrice(basePrice),
      unit,
      stock_quantity: qty || 50,
      supplier_id: '550e8400-e29b-41d4-a716-446655440000', // Mock ID
      image_url: `https://via.placeholder.com/200x200?text=${encodeURIComponent(title || 'Product')}`,
      rating: 5,
      reviewCount: 0
    };
  }
};
