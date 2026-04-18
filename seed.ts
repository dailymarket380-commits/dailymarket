
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the .env.local in the web folder
dotenv.config({ path: path.join(__dirname, 'web', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const REAL_PRODUCTS = [
  {
    title: 'Fresh Organic Matooke',
    description: 'A full bunch of farm-fresh organic matooke from the central region. Perfect for steaming.',
    category: 'fruit-veg',
    base_price: 22000,
    premium_price: 25000,
    unit: 'Full Bunch',
    stock_quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    vendor_name: 'Central Farmers'
  },
  {
    title: 'Local Hybrid Chicken',
    description: 'Whole local hybrid chicken, slaughtered and cleaned. Ready for the kienyeji stew.',
    category: 'meat-poultry',
    base_price: 32000,
    premium_price: 35000,
    unit: 'Whole Piece',
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1587593817645-53e77a28e51a?w=800&q=80',
    vendor_name: 'Mpererwe Butchery'
  },
  {
    title: 'Super Quality Rice',
    description: 'A 5kg bag of premium superfine rice. Double polished and sorted.',
    category: 'pantry',
    base_price: 18000,
    premium_price: 22000,
    unit: '5kg Bag',
    stock_quantity: 100,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    vendor_name: 'Rice Millers Co.'
  },
  {
    title: 'Farm Fresh Milk',
    description: 'Freshly pasteurized milk from local dairy farms. No additives.',
    category: 'dairy',
    base_price: 2200,
    premium_price: 2500,
    unit: '1 Litre',
    stock_quantity: 200,
    image_url: 'https://images.unsplash.com/photo-1528750994403-e0b2019a2817?w=800&q=80',
    vendor_name: 'Dairy Hub'
  },
  {
    title: 'Large Avocados',
    description: 'Pack of 3 large, creamy avocados. Rich in nutrients.',
    category: 'fruit-veg',
    base_price: 4000,
    premium_price: 5000,
    unit: '3 Pack',
    stock_quantity: 80,
    image_url: 'https://images.unsplash.com/photo-1523412351214-9447781b072c?w=800&q=80',
    vendor_name: 'Uganda Organics'
  },
  {
    title: 'Red Dry Beans',
    description: 'Top quality sorted yellow/red beans. Quick boiling and very tasty.',
    category: 'pantry',
    base_price: 4000,
    premium_price: 4500,
    unit: '1kg Pack',
    stock_quantity: 150,
    image_url: 'https://images.unsplash.com/photo-1551462147-3a8833b64f05?w=800&q=80',
    vendor_name: 'Pantry Pros'
  },
  {
    title: 'Fresh Sweet Potatoes',
    description: '5kg of large sweet potatoes. High in energy and sourced from eastern farms.',
    category: 'fruit-veg',
    base_price: 10000,
    premium_price: 12000,
    unit: '5kg Bag',
    stock_quantity: 60,
    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80',
    vendor_name: 'East Harvest'
  }
];

async function seed() {
  console.log('Seeding real Ugandan products into DailyMarket...');

  for (const product of REAL_PRODUCTS) {
    const { error } = await supabase
      .from('products')
      .insert([product]);

    if (error) {
      console.error(`Failed to seed ${product.title}:`, error.message);
    } else {
      console.log(`Successfully seeded ${product.title}`);
    }
  }

  console.log('Seeding complete.');
}

seed();
