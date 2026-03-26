'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import styles from './page.module.css';

function LoginForm() {
  const [authMode, setAuthMode] = useState<'password' | 'otp_request' | 'otp_verify'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Where to redirect after login (defaults to home)
  const redirectTo = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (authMode === 'password') {
        await authService.signIn(email, password);
        router.push(redirectTo);
        router.refresh();
      } else if (authMode === 'otp_request') {
        await authService.signInWithOtp(email);
        setSuccessMsg('A 6-digit code has been sent to your email.');
        setAuthMode('otp_verify');
      } else if (authMode === 'otp_verify') {
        await authService.verifyOtp(email, otpToken);
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        {/* Icon */}
        <div className={styles.authIcon}>🛍️</div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          {redirectTo === '/checkout'
            ? '🔒 Sign in to complete your purchase'
            : 'Sign in to your DailyMarket account'}
        </p>

        {/* Checkout reminder banner */}
        {redirectTo === '/checkout' && (
          <div className={styles.checkoutBanner}>
            <strong>Your cart is waiting!</strong> Sign in to complete your order securely.
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          {authMode !== 'otp_verify' && (
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
          )}

          {authMode === 'password' && (
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          )}

          {authMode === 'otp_verify' && (
            <div className={styles.inputGroup}>
              <label htmlFor="otpToken">Enter 6-Digit Code</label>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                Sent to {email}
              </p>
              <input
                id="otpToken"
                type="text"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                required
                placeholder="123456"
                maxLength={6}
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {successMsg && <p style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', padding: '10px', background: '#d1fae5', borderRadius: '4px' }}>{successMsg}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'PROCESSING...' : authMode === 'password' ? 'SIGN IN' : authMode === 'otp_request' ? 'SEND LOGIN CODE' : 'VERIFY & LOGIN'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          {authMode === 'password' ? (
            <button type="button" onClick={() => { setAuthMode('otp_request'); setError(null); }} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              Sign in with Email Code (Passwordless)
            </button>
          ) : (
            <button type="button" onClick={() => { setAuthMode('password'); setError(null); }} style={{ background: 'none', border: 'none', color: '#666', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
              Use Password Instead
            </button>
          )}
        </div>

        <p className={styles.switchAuth}>
          Don&apos;t have an account?{' '}
          <Link href={`/register${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
