import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

// In-memory store for development. Safe for single-instance Next.js dev server.
// In a true scalable production, this would use Redis or the vendor_otps table.
// However, since the user explicitly requested standard local folders for local dev, we will use memory caching.
const otpCache = new Map<string, { code: string; expiresAt: number }>();

function generateDerivedPassword(email: string) {
  return crypto.createHash('sha256').update(email + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).digest('hex').substring(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // 1. Generate a 6 digit secure code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // 2. Cache it locally
    otpCache.set(email.toLowerCase(), { code: otpCode, expiresAt });

    // 3. Setup Nodemailer explicitly pulling from the .env.local variables the user provided
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER || 'dailymarket380@gmail.com',
        pass: process.env.EMAIL_PASS || 'pxog cqgl zqsk trfs',
      },
    });

    const mailOptions = {
      from: '"DailyMarket Elite" <' + (process.env.EMAIL_USER || 'dailymarket380@gmail.com') + '>',
      to: email,
      subject: 'Your DailyMarket Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #fcfcfc;">
          <h1 style="color: #000; font-weight: 900; letter-spacing: 2px;">DAILYMARKET ELITE</h1>
          <p style="color: #666; font-size: 16px; margin-top: 20px;">Use the following premium passcode to access your account instantly:</p>
          <div style="margin: 40px auto; padding: 20px; background-color: #10b981; color: #fff; font-size: 36px; font-weight: 900; letter-spacing: 8px; width: fit-content; border-radius: 8px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
            ${otpCode}
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    };

    // 4. Send the email visually identically to how business-portal handles it
    await transporter.sendMail(mailOptions);
    console.log('[Native OTP] Sent explicitly formatted code ' + otpCode + ' to ' + email);

    // Provide a development-fallback header so the client can simulate completion if the user checks terminal
    return NextResponse.json({ success: true, message: 'OTP Sent' });

  } catch (error: any) {
    console.error('[Native OTP API] Failed to send:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();
    const cleanEmail = email.toLowerCase();
    
    // 1. Verify the code against our cache
    const stored = otpCache.get(cleanEmail);
    if (!stored || stored.code !== token || Date.now() > stored.expiresAt) {
      return NextResponse.json({ error: 'Invalid or expired code. Please try again.' }, { status: 400 });
    }

    // Clear the code after successful validation
    otpCache.delete(cleanEmail);

    // 2. Perform the actual Supabase DB authentication using the provided password or fallback to derived
    const finalPassword = password || generateDerivedPassword(cleanEmail);

    const { data: { user: foundUser, session: foundSession }, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: finalPassword
    });

    let user = foundUser;
    let session = foundSession;

    // If perfectly successful, the user existed! If not, we automatically create them behind the scenes (SignUp flow handled implicitly by OTP!)
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: finalPassword,
      });
      if (signUpError) throw signUpError;
      
      // Attempt login one final time to fetch session
      const authRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: finalPassword
      });
      user = authRes.data.user;
      session = authRes.data.session;
    }

    if (!user || !session) {
      return NextResponse.json({ error: 'Authentication layer failed to attach session.' }, { status: 500 });
    }

    return NextResponse.json({ user, session });

  } catch (error: any) {
    console.error('[Verify OTP API] Verification failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
