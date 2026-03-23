import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/payment/notify
 * 
 * PayFast ITN (Instant Transaction Notification) handler.
 * PayFast calls this endpoint AFTER every payment attempt — successful or failed.
 * 
 * Security checks:
 * 1. Validate the signature matches our passphrase
 * 2. Verify request came from PayFast's IP addresses
 * 3. Check payment_status === 'COMPLETE'
 * 
 * PayFast ITN docs: https://developers.payfast.co.za/docs#notify
 */

const PAYFAST_VALID_IPS = [
  '197.97.145.144',
  '197.97.145.145',
  '197.97.145.146',
  '197.97.145.147',
  '197.97.145.148',
  '197.97.145.149',
  '197.97.145.150',
  '197.97.145.151',
  // Sandbox IPs
  '196.33.227.224',
  '196.33.227.225',
  '196.33.227.226',
  '196.33.227.227',
];

const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';

function validateSignature(data: Record<string, string>, passphrase: string): boolean {
  const receivedSignature = data.signature;
  const dataWithoutSig = { ...data };
  delete dataWithoutSig.signature;

  const paramString = Object.keys(dataWithoutSig)
    .sort()
    .map(key => `${key}=${encodeURIComponent(dataWithoutSig[key]).replace(/%20/g, '+')}`)
    .join('&');

  const withPassphrase = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : paramString;

  const computedSignature = crypto.createHash('md5').update(withPassphrase).digest('hex');
  return computedSignature === receivedSignature;
}

export async function POST(req: NextRequest) {
  try {
    // Parse form-encoded body
    const text = await req.text();
    const params = new URLSearchParams(text);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    console.log('[PayFast ITN] Received notification:', {
      payment_status: data.payment_status,
      order_id: data.m_payment_id,
      amount: data.amount_gross,
      custom_str2: data.custom_str2,
    });

    // 1. Validate signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    if (!validateSignature(data, passphrase)) {
      console.error('[PayFast ITN] ❌ Invalid signature');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // 2. Skip IP check in sandbox mode
    if (!PAYFAST_SANDBOX) {
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
      const isValidIp = PAYFAST_VALID_IPS.some(ip => clientIp.includes(ip));
      if (!isValidIp) {
        console.error('[PayFast ITN] ❌ Invalid IP:', clientIp);
        return new NextResponse('Unauthorized IP', { status: 403 });
      }
    }

    // 3. Handle payment outcome
    const orderId = data.m_payment_id || data.custom_str2;
    const status = data.payment_status;
    const userId = data.custom_str1;
    const amountPaid = parseFloat(data.amount_gross || '0');

    if (status === 'COMPLETE') {
      console.log(`[PayFast ITN] ✅ Payment COMPLETE for order ${orderId} — R${amountPaid}`);

      // TODO: Save order to your Supabase database
      // Example:
      // const { supabase } = await import('@/lib/supabase');
      // await supabase.from('orders').insert({
      //   id: orderId,
      //   user_id: userId,
      //   amount: amountPaid,
      //   status: 'paid',
      //   payfast_payment_id: data.pf_payment_id,
      //   created_at: new Date().toISOString(),
      // });

    } else if (status === 'CANCELLED') {
      console.log(`[PayFast ITN] ⚠️ Payment CANCELLED for order ${orderId}`);
    } else if (status === 'FAILED') {
      console.log(`[PayFast ITN] ❌ Payment FAILED for order ${orderId}`);
    }

    // PayFast expects a 200 OK response
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error('[PayFast ITN] Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
