'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestOTP, verifyOTP } from './actions';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setMessage('');
    const formData = new FormData(e.currentTarget);
    setEmail(formData.get('email') as string);
    const result = await requestOTP(formData);
    setIsSubmitting(false);
    if (result.success) setStep('otp'); else setMessage(result.error || 'Failed to send PIN.');
  }

  async function handleOTPSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setMessage('');
    const formData = new FormData(e.currentTarget);
    formData.append('email', email);
    const result = await verifyOTP(formData);
    setIsSubmitting(false);
    if (result.success) router.push(`/products?vendor=${encodeURIComponent(result.vendor as string)}`);
    else setMessage(result.error || 'Invalid PIN. Try again.');
  }

  const inp: React.CSSProperties = { width: '100%', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px 18px', color: 'var(--text-main)', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.02em' };
  const btn: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)', color: '#fff', border: 'none', borderRadius: 10, padding: '16px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 40px', display: 'flex', alignItems: 'center', height: 72, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', fontWeight: 900, fontSize: '20px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>DM</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.5px' }}>DailyMarket</div>
            <div style={{ fontSize: '10px', color: '#f97316', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SELLER CENTER</div>
          </div>
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="premium-card" style={{ width: '100%', maxWidth: 440, padding: '48px 40px' }}>
          {step === 'email' ? (
            <>
              <div style={{ display: 'inline-flex', padding: '6px 14px', background: 'var(--primary-light)', borderRadius: 30, fontSize: '11px', fontWeight: 800, color: 'var(--primary)', marginBottom: 20 }}>
                WELCOME BACK
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 8, color: '#0f172a' }}>Merchant Sign In</h1>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: 32 }}>Login to manage your DailyMarket storefront.</p>
              
              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={lbl} htmlFor="email">Work Email</label>
                  <input id="email" name="email" type="email" required autoComplete="email" style={inp} placeholder="you@business.com" />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ ...btn, opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Checking account...' : 'Send Login PIN →'}
                </button>
              </form>
              
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px dotted #e2e8f0' }}>
                New to DailyMarket? <Link href="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Become a Vendor</Link>
              </p>
            </>
          ) : (
            <>
              <div style={{ width: 64, height: 64, background: 'var(--primary-light)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 24, border: '1px solid #fed7aa' }}>📬</div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 8, color: '#0f172a' }}>Authorize Login</h1>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: 32 }}>We've sent a 6-digit PIN to <strong style={{ color: '#0f172a' }}>{email}</strong></p>
              
              <form onSubmit={handleOTPSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={lbl} htmlFor="otp">6-Digit Access PIN</label>
                  <input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} required style={{ ...inp, textAlign: 'center', fontSize: '32px', fontWeight: 900, letterSpacing: '12px', paddingLeft: 20, background: '#f8fafc' }} placeholder="000000" />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ ...btn, opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Authorizing...' : 'Sign In to Storefront'}
                </button>
                <button type="button" onClick={() => setStep('email')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Use a different email</button>
              </form>
            </>
          )}
          {message && <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 10, background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', fontSize: '14px', fontWeight: 500 }}>⚠️ {message}</div>}
        </div>
      </div>
    </main>
  );
}

