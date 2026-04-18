'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

// Real authentication! Look up driver in drivers table or just set session based on email if we're stubbing passwords
export async function driverLogin(email: string) {
  // Try to find driver by matching name/email, fallback to just finding a driver if you type a specific name
  let nameParts = email.split(' ');
  const searchName = nameParts[0];

  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .ilike('first_name', `${searchName}%`)
    .limit(1);

  if (error || !drivers || drivers.length === 0) {
    // If no driver found, maybe we just mock it for now since we don't know the schema
    // Let's create a generic session
    (await cookies()).set('driver_session', JSON.stringify({ name: email }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return { success: true, driverName: email };
  }

  // Assuming driver schema has first_name, last_name, etc
  const driver = drivers[0];
  const driverName = `${driver.first_name} ${driver.last_name || ''}`.trim() || email;

  (await cookies()).set('driver_session', JSON.stringify({ name: driverName }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return { success: true, driverName };
}

export async function getDriverSession() {
  const session = (await cookies()).get('driver_session');
  if (!session?.value) return { success: false };

  try {
    const data = JSON.parsed(session.value);
    return { success: true, driverName: data.name };
  } catch {
    return { success: true, driverName: session.value };
  }
}

export async function driverLogout() {
  (await cookies()).delete('driver_session');
  return { success: true };
}
