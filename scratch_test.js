import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import dotenv from 'dotenv';
const envConfig = dotenv.parse(fs.readFileSync('./web/.env.local'));

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const orderId = "0cda91eb-94e8-46cc-9da4-90a614cd1234";
  console.log("Testing SELECT from orders...");
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
