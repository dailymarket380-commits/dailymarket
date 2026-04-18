require('dotenv').config({ path: './web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkPhoneLogic() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, shipping_address, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error("DB Error:", error.message);
    return;
  }

  data.forEach((o, i) => {
    let originalPhone = o.shipping_address?.phone;
    console.log(`\n--- Order ${i+1} (${o.id.substring(0,8)}) ---`);
    console.log(`Raw Phone:`, originalPhone);
    
    if (originalPhone) {
      let phone = originalPhone.replace(/\s+/g, '').replace(/-/g, '');
      if (phone.startsWith('0')) phone = '+27' + phone.slice(1);
      else if (!phone.startsWith('+')) phone = '+27' + phone;

      console.log(`Formatted Phone:`, phone);
      const isValid = /^\+[1-9]\d{6,14}$/.test(phone);
      console.log(`Passes Regex?`, isValid ? '✅ YES' : '❌ NO');
    } else {
      console.log(`❌ No phone number in DB.`);
    }
  });
}

checkPhoneLogic();
