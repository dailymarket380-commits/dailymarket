const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtfypdvcqjniiafmzucq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
        .from('orders')
        .select(`
          id, total_amount, status, created_at,
          order_items(quantity, products(title, image_url))
        `).limit(1);
  console.log(error || data);
}
test();
