'use server';

import { supabase } from '@/lib/supabase';
import { sendOtpEmail } from '@/lib/mailer';

// Generate a random 6-digit number
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const businessName = formData.get('businessName') as string || '';
  
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const otp = generateOTP();
  
  // Calculate expiry (10 minutes from now)
  const expires_at = new Date();
  expires_at.setMinutes(expires_at.getMinutes() + 10);
  
  // Store the OTP in Supabase
  const { error } = await supabase
    .from('vendor_otps')
    .upsert({ 
      email, 
      otp, 
      verified: false, 
      expires_at: expires_at.toISOString(),
      created_at: new Date().toISOString()
    }, { onConflict: 'email' });

  if (error) {
    console.error('Error saving OTP:', error);
    return { success: false, error: `Database Error: ${error.message} (Hint: Make sure vendor_otps migration ran)` };
  }

  // Send the email
  const emailSent = await sendOtpEmail(email, otp);
  
  if (!emailSent) {
    return { success: false, error: 'Failed to send OTP email.' };
  }

  return { success: true };
}

export async function verifyOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;
  const businessName = formData.get('businessName') as string; // Available during signup

  if (!email || !otp) {
    return { success: false, error: 'Email and OTP are required' };
  }

  // Fetch the latest OTP for this email
  const { data: otpData, error: otpError } = await supabase
    .from('vendor_otps')
    .select('*')
    .eq('email', email)
    .single();

  if (otpError || !otpData) {
    return { success: false, error: 'No active OTP found.' };
  }

  if (otpData.otp !== otp) {
    return { success: false, error: 'Invalid PIN.' };
  }

  // Check if expired
  if (new Date(otpData.expires_at).getTime() < Date.now()) {
    return { success: false, error: 'PIN expired. Please request a new one.' };
  }

  // Mark as verified
  await supabase
    .from('vendor_otps')
    .update({ verified: true })
    .eq('email', email);

  // If businessName is provided (Signup), store it in 'sellers' table
  if (businessName) {
    const { error: sellerError } = await supabase
      .from('sellers')
      .upsert({ email, business_name: businessName, password: 'PIN_ONLY' }, { onConflict: 'email' });
    
    if (sellerError) {
      console.error('Error saving seller:', sellerError);
      // We still return true because OTP is verified, but log the error
    }
    return { success: true, vendor: businessName };
  }

  // If no businessName (Login), try to find it in 'sellers'
  const { data: sellerData } = await supabase
    .from('sellers')
    .select('business_name')
    .eq('email', email)
    .single();

  return { 
    success: true, 
    vendor: sellerData?.business_name || 'My Store' 
  };
}

