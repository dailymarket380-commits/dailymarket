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
   * Sends a One-Time Password (OTP) or Magic Link to the email.
   */
  async signInWithOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) {
      console.error('OTP send error:', error);
      throw error;
    }
  },

  /**
   * Verifies the 6-digit OTP code sent to the email.
   */
  async verifyOtp(email: string, token: string) {
    const { data: { user, session }, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error('OTP verify error:', error);
      throw error;
    }

    // Explicitly set the session so the app recognizes the user
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
