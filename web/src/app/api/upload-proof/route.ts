import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const orderId = formData.get('orderId') as string;
    const name = formData.get('name') as string;
    const reference = formData.get('reference') as string;

    if (!file || !orderId) {
      return NextResponse.json({ error: 'Missing file or order ID' }, { status: 400 });
    }

    // Prepare upload directory
    const uploadsDir = path.join(process.cwd(), 'public', 'proofs');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Save file locally (in production you would upload to Supabase Storage or S3)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${orderId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    
    await fs.writeFile(filePath, buffer);
    const proofUrl = `/proofs/${filename}`;

    // Update order in Supabase
    // We update status and since "proofOfPaymentUrl" and "paymentMethod" might not
    // exist in a strict schema yet, we encode them in the jsonb shipping_address just
    // in case, OR assume they added the new columns. Best practice is to use the columns.
    
    // Attempt standard column update first (assumes user ran the schema update)
    const { error: dbError } = await supabase
      .from('orders')
      .update({
        status: 'awaiting_verification',
        payment_method: 'EFT',
        proof_of_payment_url: proofUrl,
        customer_name: name,
        payment_reference: reference
      })
      .eq('id', orderId);

    if (dbError) {
      // Fallback: If columns don't exist yet, we inject them into the shipping_address JSONB payload
      // so the app still functions while schema updates are pending.
      console.warn('[Upload Proof] Fallback DB update due to schema:', dbError.message);
      
      const { data: currentOrder } = await supabase.from('orders').select('shipping_address').eq('id', orderId).single();
      const existingMeta = currentOrder?.shipping_address || {};
      
      await supabase.from('orders').update({
        status: 'awaiting_verification',
        shipping_address: {
            ...existingMeta,
            payment_method: 'EFT',
            proof_of_payment_url: proofUrl,
            payment_name: name,
            payment_reference: reference
        }
      }).eq('id', orderId);
    }

    return NextResponse.json({ success: true, url: proofUrl });
  } catch (error: any) {
    console.error('[Upload Proof] Error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
