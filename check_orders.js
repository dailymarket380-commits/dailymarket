require('dotenv').config({ path: './web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkLastOrder() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, shipping_info, status, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error:", error.message);
  } else {
    data.forEach((o, i) => {
      console.log(`[Order ${i+1}] ID: ${o.id.substring(0,8)} - Status: ${o.status}`);
      console.log(` Shipping Phone:`, o.shipping_info ? o.shipping_info.phone : 'NO SHIPPING INFO');
    });
  }
}

checkLastOrder();
