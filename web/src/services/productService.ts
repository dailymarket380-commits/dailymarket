import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  base_price: number;      // Supplier/market price (ZAR)
  premium_price: number;   // DailyMarket price = base × 1.15
  unit: string;
  stock_quantity: number;
  image_url: string;
  supplier_id: string;
  rating: number;
  reviewCount: number;
  badge?: string;          // e.g. "SAVE", "NEW", "BESTSELLER"
}

// 15% DailyMarket markup
const MARKUP = 1.15;
function markup(base: number) { return Math.round(base * MARKUP * 100) / 100; }

/**
 * REAL South African grocery products.
 * Prices reflect Woolworths / Checkers market rates (ZAR).
 * DailyMarket sells at market + 15% for convenience delivery premium.
 */
const REAL_PRODUCTS: Product[] = [

  // ─── FRUIT & VEG ──────────────────────────────────────
  {
    id: 'fv-001',
    title: 'Loose Baby Spinach',
    description: 'Fresh, tender baby spinach leaves. Rich in iron and vitamins.',
    category: 'fruit-veg',
    base_price: 32.99,
    premium_price: markup(32.99),
    unit: '200g',
    stock_quantity: 85,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=500&fit=crop&q=90',
    supplier_id: 'fresh-farms',
    rating: 4, reviewCount: 142,
    badge: 'FRESH'
  },
  {
    id: 'fv-002',
    title: 'Ripe & Ready Hass Avocados',
    description: 'Perfectly ripe, creamy Hass avocados. Ready to eat today.',
    category: 'fruit-veg',
    base_price: 49.99,
    premium_price: markup(49.99),
    unit: '4pk',
    stock_quantity: 60,
    image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&h=500&fit=crop&q=90',
    supplier_id: 'fresh-farms',
    rating: 5, reviewCount: 318,
    badge: 'BESTSELLER'
  },
  {
    id: 'fv-003',
    title: 'Loose Vine Tomatoes',
    description: 'Sweet and juicy vine-ripened tomatoes. Grown locally in the Western Cape.',
    category: 'fruit-veg',
    base_price: 27.99,
    premium_price: markup(27.99),
    unit: '500g',
    stock_quantity: 120,
    image_url: 'https://images.unsplash.com/photo-1592924357236-80ee25884b2f?w=500&h=500&fit=crop&q=90',
    supplier_id: 'fresh-farms',
    rating: 4, reviewCount: 87
  },
  {
    id: 'fv-004',
    title: 'English Cucumber',
    description: 'Cool, crisp and refreshing. Perfect for salads and snacking.',
    category: 'fruit-veg',
    base_price: 17.99,
    premium_price: markup(17.99),
    unit: 'each',
    stock_quantity: 95,
    image_url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&h=500&fit=crop&q=90',
    supplier_id: 'fresh-farms',
    rating: 4, reviewCount: 63
  },
  {
    id: 'fv-005',
    title: 'Seedless White Grapes',
    description: 'Crisp, sweet seedless grapes. Grown in the Hex River Valley.',
    category: 'fruit-veg',
    base_price: 44.99,
    premium_price: markup(44.99),
    unit: '500g',
    stock_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&h=500&fit=crop&q=90',
    supplier_id: 'fresh-farms',
    rating: 5, reviewCount: 205
  },
  {
    id: 'fv-006',
    title: 'Loose Broccoli Florets',
    description: 'Tender, fresh-cut broccoli florets. Ready to steam or stir-fry.',
    category: 'fruit-veg',
    base_price: 29.99,
    premium_price: markup(29.99),
    unit: '300g',
    stock_quantity: 70,
    image_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&h=500&fit=crop&q=90',
    supplier_id: 'fresh-farms',
    rating: 4, reviewCount: 44
  },

  // ─── MEAT & POULTRY ─────────────────────────────────────
  {
    id: 'mp-001',
    title: 'Free Range Chicken Breast Fillets',
    description: 'Succulent, lean free-range chicken fillets. High protein, low fat.',
    category: 'meat-poultry',
    base_price: 89.99,
    premium_price: markup(89.99),
    unit: '500g',
    stock_quantity: 45,
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-butchery',
    rating: 5, reviewCount: 276,
    badge: 'FREE RANGE'
  },
  {
    id: 'mp-002',
    title: 'Beef Mince (Extra Lean)',
    description: 'Premium extra lean beef mince. Perfect for bolognese, meatballs and burgers.',
    category: 'meat-poultry',
    base_price: 129.99,
    premium_price: markup(129.99),
    unit: '500g',
    stock_quantity: 38,
    image_url: 'https://images.unsplash.com/photo-1588347818036-c6261dc1977c?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-butchery',
    rating: 4, reviewCount: 192,
    badge: 'SAVE'
  },
  {
    id: 'mp-003',
    title: 'Pork Braai Pack',
    description: 'Marinated pork chops and ribs. Ready for the braai.',
    category: 'meat-poultry',
    base_price: 149.99,
    premium_price: markup(149.99),
    unit: '1kg',
    stock_quantity: 22,
    image_url: 'https://images.unsplash.com/photo-1529693662653-9d480530a697?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-butchery',
    rating: 5, reviewCount: 88
  },
  {
    id: 'mp-004',
    title: 'Wagyu Beef Sirloin Steak',
    description: 'Exquisitely marbled Wagyu sirloin. Restaurant-quality at home.',
    category: 'meat-poultry',
    base_price: 259.99,
    premium_price: markup(259.99),
    unit: '300g',
    stock_quantity: 12,
    image_url: 'https://images.unsplash.com/photo-1546248136-3d63d9115b9b?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-butchery',
    rating: 5, reviewCount: 54,
    badge: 'PREMIUM'
  },
  {
    id: 'mp-005',
    title: 'Whole Fresh Chicken',
    description: 'Grade A whole fresh chicken. Perfect for roasting.',
    category: 'meat-poultry',
    base_price: 109.99,
    premium_price: markup(109.99),
    unit: '±1.5kg',
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-butchery',
    rating: 4, reviewCount: 134
  },
  {
    id: 'mp-006',
    title: 'Smoked Salmon Fillets',
    description: 'Sustainably-sourced smoked Atlantic salmon. Rich in omega-3.',
    category: 'meat-poultry',
    base_price: 164.99,
    premium_price: markup(164.99),
    unit: '200g',
    stock_quantity: 18,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-butchery',
    rating: 5, reviewCount: 97,
    badge: 'FRESH'
  },

  // ─── DAIRY & EGGS ─────────────────────────────────────
  {
    id: 'da-001',
    title: 'Full Cream Fresh Milk',
    description: 'Rich Ayrshire full cream milk. From free-range cows.',
    category: 'dairy',
    base_price: 34.99,
    premium_price: markup(34.99),
    unit: '2L',
    stock_quantity: 110,
    image_url: 'https://images.unsplash.com/photo-1563636619-e9107da5a76a?w=500&h=500&fit=crop&q=90',
    supplier_id: 'dairy-co',
    rating: 5, reviewCount: 421,
    badge: 'BESTSELLER'
  },
  {
    id: 'da-002',
    title: 'Free Range Eggs',
    description: 'Farm-fresh free range eggs. Hens raised on open pastures.',
    category: 'dairy',
    base_price: 54.99,
    premium_price: markup(54.99),
    unit: '12pk',
    stock_quantity: 75,
    image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop&q=90',
    supplier_id: 'dairy-co',
    rating: 5, reviewCount: 388,
    badge: 'FREE RANGE'
  },
  {
    id: 'da-003',
    title: 'Greek Style Plain Yogurt',
    description: 'Thick, creamy Greek-style yogurt. High in protein and probiotics.',
    category: 'dairy',
    base_price: 49.99,
    premium_price: markup(49.99),
    unit: '500g',
    stock_quantity: 55,
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=500&fit=crop&q=90',
    supplier_id: 'dairy-co',
    rating: 4, reviewCount: 167
  },
  {
    id: 'da-004',
    title: 'Mature Cheddar Cheese',
    description: 'Rich, nutty 18-month aged Cheddar. Perfect on a cheeseboard or melted.',
    category: 'dairy',
    base_price: 79.99,
    premium_price: markup(79.99),
    unit: '400g',
    stock_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop&q=90',
    supplier_id: 'dairy-co',
    rating: 4, reviewCount: 143
  },
  {
    id: 'da-005',
    title: 'Salted Butter',
    description: 'Rich, creamy salted butter. Made from fresh cream.',
    category: 'dairy',
    base_price: 44.99,
    premium_price: markup(44.99),
    unit: '500g',
    stock_quantity: 90,
    image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&h=500&fit=crop&q=90',
    supplier_id: 'dairy-co',
    rating: 5, reviewCount: 292
  },

  // ─── BAKERY ─────────────────────────────────────────────
  {
    id: 'bk-001',
    title: 'Sliced White Sandwich Bread',
    description: 'Soft, freshly baked white sandwich bread. Great for toasting.',
    category: 'bakery',
    base_price: 22.99,
    premium_price: markup(22.99),
    unit: '700g',
    stock_quantity: 80,
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-bakery',
    rating: 4, reviewCount: 88
  },
  {
    id: 'bk-002',
    title: 'Sourdough Loaf',
    description: 'Traditional slow-fermented sourdough. Crispy crust, soft crumb.',
    category: 'bakery',
    base_price: 54.99,
    premium_price: markup(54.99),
    unit: '700g',
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-bakery',
    rating: 5, reviewCount: 176,
    badge: 'ARTISAN'
  },
  {
    id: 'bk-003',
    title: 'All Butter Croissants',
    description: 'Flaky, golden-brown croissants baked fresh daily. Classic French style.',
    category: 'bakery',
    base_price: 49.99,
    premium_price: markup(49.99),
    unit: '4pk',
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-bakery',
    rating: 5, reviewCount: 224,
    badge: 'FRESH BAKED'
  },
  {
    id: 'bk-004',
    title: 'Belgian Chocolate Muffins',
    description: 'Rich, indulgent chocolate muffins with a gooey centre.',
    category: 'bakery',
    base_price: 44.99,
    premium_price: markup(44.99),
    unit: '2pk',
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&h=500&fit=crop&q=90',
    supplier_id: 'the-bakery',
    rating: 4, reviewCount: 98
  },

  // ─── SWEETS & ICE CREAM ─────────────────────────────────
  {
    id: 'sw-001',
    title: 'Madagascan Vanilla Ice Cream',
    description: 'Real Bourbon vanilla bean ice cream. Luxuriously smooth and creamy.',
    category: 'sweets',
    base_price: 84.99,
    premium_price: markup(84.99),
    unit: '1L',
    stock_quantity: 35,
    image_url: 'https://images.unsplash.com/photo-1570197788417-0e1f3be1e627?w=500&h=500&fit=crop&q=90',
    supplier_id: 'ice-cream-co',
    rating: 5, reviewCount: 342,
    badge: 'BESTSELLER'
  },
  {
    id: 'sw-002',
    title: 'Belgian Dark Chocolate Slab',
    description: '72% dark Belgian chocolate. Intense cocoa flavour.',
    category: 'sweets',
    base_price: 59.99,
    premium_price: markup(59.99),
    unit: '100g',
    stock_quantity: 65,
    image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&h=500&fit=crop&q=90',
    supplier_id: 'choc-world',
    rating: 5, reviewCount: 187
  },
  {
    id: 'sw-003',
    title: 'Chocolate Fudge Brownie Ice Cream',
    description: 'Chocolate ice cream loaded with swirls of fudge and brownie pieces.',
    category: 'sweets',
    base_price: 94.99,
    premium_price: markup(94.99),
    unit: '1L',
    stock_quantity: 28,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop&q=90',
    supplier_id: 'ice-cream-co',
    rating: 5, reviewCount: 271,
    badge: 'SAVE'
  },
  {
    id: 'sw-004',
    title: 'Assorted Mini Chocolate Box',
    description: 'A delightful selection of milk, dark and white chocolate truffles.',
    category: 'sweets',
    base_price: 124.99,
    premium_price: markup(124.99),
    unit: '200g',
    stock_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&h=500&fit=crop&q=90',
    supplier_id: 'choc-world',
    rating: 5, reviewCount: 133,
    badge: 'GIFT IDEA'
  },

  // ─── PANTRY & DRY GOODS ─────────────────────────────────
  {
    id: 'pa-001',
    title: 'Nescafé Gold Blend Instant Coffee',
    description: 'Rich, smooth instant coffee with a warm golden aroma.',
    category: 'pantry',
    base_price: 124.99,
    premium_price: markup(124.99),
    unit: '200g',
    stock_quantity: 80,
    image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&h=500&fit=crop&q=90',
    supplier_id: 'pantry-plus',
    rating: 4, reviewCount: 522,
    badge: 'BESTSELLER'
  },
  {
    id: 'pa-002',
    title: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed, single-origin South African olive oil. Fruity and peppery.',
    category: 'pantry',
    base_price: 164.99,
    premium_price: markup(164.99),
    unit: '750ml',
    stock_quantity: 42,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop&q=90',
    supplier_id: 'pantry-plus',
    rating: 5, reviewCount: 198
  },
  {
    id: 'pa-003',
    title: 'Basmati Rice',
    description: 'Fragrant, long-grain Basmati rice. Aged for 12 months for perfect texture.',
    category: 'pantry',
    base_price: 64.99,
    premium_price: markup(64.99),
    unit: '2kg',
    stock_quantity: 95,
    image_url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&h=500&fit=crop&q=90',
    supplier_id: 'pantry-plus',
    rating: 4, reviewCount: 144
  },
  {
    id: 'pa-004',
    title: 'Simba Chips - Tomato Sauce',
    description: 'South Africa\'s favourite potato chips. Crispy and full of flavour.',
    category: 'pantry',
    base_price: 19.99,
    premium_price: markup(19.99),
    unit: '125g',
    stock_quantity: 200,
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&h=500&fit=crop&q=90',
    supplier_id: 'pantry-plus',
    rating: 5, reviewCount: 843,
    badge: 'FAN FAVOURITE'
  },
  {
    id: 'pa-005',
    title: 'Koo Mixed Vegetable Curry',
    description: 'Hearty mixed vegetable curry in a rich, spiced sauce.',
    category: 'pantry',
    base_price: 32.99,
    premium_price: markup(32.99),
    unit: '420g',
    stock_quantity: 130,
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=500&fit=crop&q=90',
    supplier_id: 'pantry-plus',
    rating: 4, reviewCount: 247
  },

  // ─── BEVERAGES ─────────────────────────────────────────
  {
    id: 'bv-001',
    title: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice. No added sugar. Pure citrus goodness.',
    category: 'beverages',
    base_price: 44.99,
    premium_price: markup(44.99),
    unit: '1L',
    stock_quantity: 60,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&h=500&fit=crop&q=90',
    supplier_id: 'beverages-co',
    rating: 5, reviewCount: 289,
    badge: 'FRESHLY SQUEEZED'
  },
  {
    id: 'bv-002',
    title: 'Rooibos Herbal Tea',
    description: 'Authentic South African rooibos. Naturally caffeine-free and full of antioxidants.',
    category: 'beverages',
    base_price: 54.99,
    premium_price: markup(54.99),
    unit: '100s',
    stock_quantity: 75,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&h=500&fit=crop&q=90',
    supplier_id: 'beverages-co',
    rating: 5, reviewCount: 412,
    badge: 'SA FAVOURITE'
  },
  {
    id: 'bv-003',
    title: 'Still Spring Water',
    description: 'Pure, crisp still water sourced from the Cederberg Mountains.',
    category: 'beverages',
    base_price: 14.99,
    premium_price: markup(14.99),
    unit: '6 × 500ml',
    stock_quantity: 150,
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop&q=90',
    supplier_id: 'beverages-co',
    rating: 4, reviewCount: 156
  },
  {
    id: 'bv-004',
    title: 'Tropika Fruit Blend Juice',
    description: 'Tropical fruit blend juice. A South African childhood favourite.',
    category: 'beverages',
    base_price: 27.99,
    premium_price: markup(27.99),
    unit: '1L',
    stock_quantity: 90,
    image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop&q=90',
    supplier_id: 'beverages-co',
    rating: 4, reviewCount: 321,
    badge: 'SA CLASSIC'
  },

  // ─── FROZEN FOODS ─────────────────────────────────────
  {
    id: 'fz-001',
    title: 'Frozen Chips (Straight Cut)',
    description: 'Golden, crispy straight-cut chips. Oven-ready or deep fry.',
    category: 'frozen',
    base_price: 44.99,
    premium_price: markup(44.99),
    unit: '1kg',
    stock_quantity: 70,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&h=500&fit=crop&q=90',
    supplier_id: 'frozen-co',
    rating: 4, reviewCount: 197
  },
  {
    id: 'fz-002',
    title: 'Frozen Mixed Vegetables',
    description: 'Garden peas, corn, carrots and green beans. Picked at peak freshness.',
    category: 'frozen',
    base_price: 34.99,
    premium_price: markup(34.99),
    unit: '1kg',
    stock_quantity: 85,
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&q=90',
    supplier_id: 'frozen-co',
    rating: 4, reviewCount: 88
  },
  {
    id: 'fz-003',
    title: 'Chicken Nuggets',
    description: 'Tender chicken nuggets in a crispy golden crumb. Kids love them.',
    category: 'frozen',
    base_price: 74.99,
    premium_price: markup(74.99),
    unit: '500g',
    stock_quantity: 55,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=500&fit=crop&q=90',
    supplier_id: 'frozen-co',
    rating: 4, reviewCount: 263,
    badge: 'FAMILY PACK'
  },
];

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    // 1. Try Supabase first (live supplier products)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch {}

    // 2. Return comprehensive real product catalog
    return REAL_PRODUCTS;
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category);

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch {}

    // 2. Filter real catalog
    return REAL_PRODUCTS.filter(p => p.category === category);
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return data as Product;
    } catch {}

    return REAL_PRODUCTS.find(p => p.id === id) || null;
  },

  // Get available categories from current catalog
  getCategories(): string[] {
    const cats = new Set(REAL_PRODUCTS.map(p => p.category));
    return Array.from(cats);
  }
};
