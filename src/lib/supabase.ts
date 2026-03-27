import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Only warn server-side during build — client always has NEXT_PUBLIC_ vars embedded
if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[DailyMarket] ⚠️  NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.\n' +
    'Add them to your .env.local and restart the dev server.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
