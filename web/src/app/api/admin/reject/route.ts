import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'rejected' })
      .eq('id', orderId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, message: 'Payment rejected' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
