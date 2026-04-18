require('dotenv').config({ path: './web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function verifyOrder() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total_amount, shipping_address')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("DB Error:", error.message);
  } else {
    console.log(`✅ Order Found! ID: ${data.id.substring(0,8).toUpperCase()}`);
    console.log(`Status: ${data.status}`);
    console.log(`Total: R${data.total_amount}`);
    console.log(`Phone:`, data.shipping_address?.phone);
  }
}

verifyOrder();
