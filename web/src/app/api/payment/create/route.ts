import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/payment/create
 * 
 * Accepts cart + shipping details from the checkout page,
 * builds a signed PayFast payment request, and returns the
 * PayFast URL + form data for the client to POST to.
 * 
 * PayFast Docs: https://developers.payfast.co.za/docs
 */

const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';
const PAYFAST_URL = PAYFAST_SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

function buildSignature(data: Record<string, string>, passphrase: string): string {
  // Build param string (alphabetical order, URL-encoded)
  const paramString = Object.keys(data)
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  const withPassphrase = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : paramString;

  return crypto.createHash('md5').update(withPassphrase).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, subtotal, shipping, user } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const merchantId = process.env.PAYFAST_MERCHANT_ID!;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate a unique order ID
    const orderId = `DM-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    // Build the item name from cart contents
    const itemName = cart.length === 1
      ? cart[0].title
      : `DailyMarket Order (${cart.length} items)`;

    const itemDescription = cart
      .map((item: any) => `${item.title} x${item.quantity}`)
      .join(', ')
      .slice(0, 255); // PayFast max 255 chars

    const data: Record<string, string> = {
      // Merchant details
      merchant_id: merchantId,
      merchant_key: merchantKey,

      // Redirect URLs
      return_url: `${appUrl}/payment/success?order=${orderId}`,
      cancel_url: `${appUrl}/payment/cancel`,
      notify_url: `${appUrl}/api/payment/notify`,

      // Customer details
      name_first: shipping?.firstName || user?.user_metadata?.full_name?.split(' ')[0] || 'Customer',
      name_last: shipping?.lastName || user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'DailyMarket',
      email_address: user?.email || shipping?.email || 'customer@dailymarket.co.za',
      cell_number: shipping?.phone?.replace(/\D/g, '').slice(0, 20) || '',

      // Order details
      m_payment_id: orderId,
      amount: subtotal.toFixed(2),
      item_name: itemName.slice(0, 100),
      item_description: itemDescription,

      // Custom data (we'll use this in the ITN to identify the order)
      custom_str1: user?.id || 'guest',
      custom_str2: orderId,
    };

    // Remove empty values (PayFast rejects empty strings on some fields)
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === undefined) {
        delete data[key];
      }
    });

    // Generate signature
    const signature = buildSignature(data, passphrase);
    data.signature = signature;

    return NextResponse.json({
      payfast_url: PAYFAST_URL,
      form_data: data,
      order_id: orderId,
    });

  } catch (error: any) {
    console.error('[PayFast] Create payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
