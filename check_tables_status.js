require('dotenv').config({ path: './web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTables() {
  console.log("Checking tables...");
  const { data: reviews, error: reviewErr } = await supabase.from('product_reviews').select('id').limit(1);
  if (reviewErr) {
    console.error("Reviews table error:", reviewErr.message);
  } else {
    console.log("Reviews table exists.");
  }

  const { data: wishlists, error: wishlistErr } = await supabase.from('wishlists').select('id').limit(1);
  if (wishlistErr) {
    console.error("Wishlists table error:", wishlistErr.message);
  } else {
    console.log("Wishlists table exists.");
  }
}

checkTables();
