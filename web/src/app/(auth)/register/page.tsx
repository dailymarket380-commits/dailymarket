'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import styles from '../login/page.module.css';

function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await authService.signUp(email, password, fullName);
      setMessage({
        text: '✅ Account created! Check your email to verify, then sign in.',
        success: true,
      });
      // After a moment, redirect to login with the same redirect param
      setTimeout(() => {
        router.push(`/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`);
      }, 2500);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to register. Please try again.', success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <div className={styles.authIcon}>✨</div>

        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>
          {redirectTo === '/checkout'
            ? '🔒 One quick step before checkout'
            : 'Join DailyMarket — free forever'}
        </p>

        {redirectTo === '/checkout' && (
          <div className={styles.checkoutBanner}>
            <strong>Almost there!</strong> Create your free account to complete your purchase and track your orders.
          </div>
        )}

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

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

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              minLength={6}
            />
          </div>

          {message && (
            <p className={message.success ? styles.success : styles.error}>{message.text}</p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE FREE ACCOUNT'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Already have an account?{' '}
          <Link href={`/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
