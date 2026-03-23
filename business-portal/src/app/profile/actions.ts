'use server';

import { supabase } from '@/lib/supabase';

export async function saveBankDetails(formData: FormData) {
  const email = formData.get('email') as string;
  const vendorName = formData.get('vendorName') as string;
  const bankName = formData.get('bankName') as string;
  const branchCode = formData.get('branchCode') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const accountHolder = formData.get('accountHolder') as string;

  if (!email || !bankName || !accountNumber) {
    return { success: false, error: 'Email, Bank Name, and Account Number are required.' };
  }

  const { error } = await supabase
    .from('vendor_profiles')
    .upsert({ 
      email, 
      vendor_name: vendorName,
      bank_name: bankName,
      branch_code: branchCode,
      account_number: accountNumber,
      account_holder: accountHolder
    }, { onConflict: 'email' });


  if (error) {
    console.error('Error saving profile:', error);
    return { success: false, error: `Database Error: ${error.message} (Is vendor_profiles migration run?)` };
  }

  return { success: true };
}

export async function getBankDetails(vendorName: string) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('vendor_name', vendorName)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return { success: false, error: 'No profile found' };
  }

  return {
    success: true,
    details: {
      email: data.email,
      bankName: data.bank_name,
      branchCode: data.branch_code,
      accountNumber: data.account_number,
      accountHolder: data.account_holder || ''
    }
  };
}

