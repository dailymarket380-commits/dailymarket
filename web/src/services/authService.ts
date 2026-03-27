import { supabase } from '@/lib/supabase';

export const authService = {
  /**
   * Signs up a new user and creates a profile.
   */
  async signUp(email: string, password: string, fullName: string) {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      throw signUpError;
    }

    if (user) {
      // Basic profile creation is handled by DB triggers in a real setup,
      // but we can manually ensure it here if needed.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return user;
  },

  /**
   * Logs in an existing user.
   */
  async signIn(email: string, password: string) {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    return user;
  },

  /**
   * Sends a One-Time Password (OTP) via Custom Next.js API using Nodemailer.
   */
  async signInWithOtp(email: string) {
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const json = await res.json();
    if (!res.ok) {
      console.error('OTP send error:', json.error);
      throw new Error(json.error || 'Failed to send OTP code');
    }
  },

  /**
   * Verifies the 6-digit OTP code against the Custom Local API and handles Supabase auth seamlessly.
   */
  async verifyOtp(email: string, token: string, password?: string) {
    const res = await fetch('/api/auth/otp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password })
    });

    const json = await res.json();
    if (!res.ok) {
      console.error('OTP verify error:', json.error);
      throw new Error(json.error || 'Invalid OTP code');
    }

    const { user, session } = json;

    // Explicitly set the session locally so the app's Supabase context instantly recognizes the newly authenticated user!
    if (session) {
      await supabase.auth.setSession(session);
    }
    
    return user;
  },

  /**
   * Logs out the current user.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  /**
   * Gets the current user session.
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
