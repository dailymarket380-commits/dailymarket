'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestOTP, verifyOTP } from '../login/actions';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setMessage('');
    const formData = new FormData(e.currentTarget);
    setEmail(formData.get('email') as string);
    setBusinessName(formData.get('businessName') as string);
    const result = await requestOTP(formData);
    setIsSubmitting(false);
    if (result.success) setStep('otp'); else setMessage(result.error || 'Failed to send PIN.');
  }

  async function handleOTPSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setMessage('');
    const formData = new FormData(e.currentTarget);
    formData.append('email', email);
    formData.append('businessName', businessName); 
    const result = await verifyOTP(formData);
    setIsSubmitting(false);
    if (result.success) router.push(`/products?vendor=${encodeURIComponent(result.vendor as string)}`);
    else setMessage(result.error || 'Invalid PIN.');
  }

  const inp: React.CSSProperties = { width: '100%', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px 18px', color: 'var(--text-main)', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.02em' };
  const btn: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)', color: '#fff', border: 'none', borderRadius: 10, padding: '16px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-main)' }}>
      {/* Premium Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 40px', display: 'flex', alignItems: 'center', height: 72, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', fontWeight: 900, fontSize: '20px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>DM</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.5px' }}>DailyMarket</div>
            <div style={{ fontSize: '10px', color: '#f97316', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SELLER CENTER</div>
          </div>
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '60px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'center' }}>
        {/* Left Side: Brand Value */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', padding: '6px 14px', background: '#fff7ed', borderRadius: 30, fontSize: '12px', fontWeight: 800, color: '#f97316', marginBottom: 24, border: '1px solid #fed7aa' }}>
            🚀 NOW FEATURING 3 MONTHS FREE
          </div>
          <h1 style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24, color: '#0f172a' }}>
            Scale your store with <span style={{ color: '#f97316' }}>DailyMarket</span> Premium
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
            Join South Africa's most elite vendor network. We handle the logistics, you focus on your craft.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              { icon: '💎', title: 'Elite Visibility', desc: 'Reach thousands of premium customers daily.' },
              { icon: '🚚', title: 'Logistics Handled', desc: 'We pick, pack, and deliver to the customer.' },
              { icon: '💳', title: 'Fast Payouts', desc: 'Bi-weekly EFT payments directly to your bank.' },
              { icon: '📈', title: 'Live Insights', desc: 'Real-time dashboard to track your performance.' },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: '24px', marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 16 }}>
             <div style={{ display: 'flex', marginLeft: 10 }}>
                {[1,2,3,4].map(x => <div key={x} style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #fff', background: '#e2e8f0', marginLeft: -10 }}></div>)}
             </div>
             <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Join <strong>2,400+ vendors</strong> across SA</div>
          </div>
        </div>

        {/* Right Side: Enhanced Signup Form */}
        <div className="premium-card" style={{ padding: '48px 40px' }}>
          {step === 'form' ? (
            <>
              <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', marginBottom: 8, color: '#0f172a' }}>Create your storefront</h2>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: 32 }}>Secure your first 3 months of premium listing for free.</p>
              
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={lbl} htmlFor="businessName">Store / Business Name</label>
                  <input id="businessName" name="businessName" type="text" required style={inp} placeholder="e.g. Unity Cash & Carry" />
                </div>
                <div>
                  <label style={lbl} htmlFor="email">Work Email</label>
                  <input id="email" name="email" type="email" required style={inp} placeholder="you@business.com" />
                </div>

                <div style={{ display: 'flex', gap: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', alignItems: 'flex-start' }}>
                  <input type="checkbox" id="terms" name="terms" required style={{ accentColor: '#f97316', width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
                  <label htmlFor="terms" style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, cursor: 'pointer' }}>
                    I agree to the <Link href="/terms" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 700 }} target="_blank">Merchant Agreement</Link>. After trial, a monthly fee of R120 applies.
                  </label>
                </div>

                <button type="submit" disabled={isSubmitting} style={{ ...btn, marginTop: 10, opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Initializing...' : 'Get My Store PIN →'}
                </button>
              </form>

              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px dotted #e2e8f0' }}>
                Already a vendor? <Link href="/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 700 }}>DailyMarket Sign In</Link>
              </p>
            </>
          ) : (
            <>
              <div style={{ width: 64, height: 64, background: '#fff7ed', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 24, border: '1px solid #fed7aa' }}>📬</div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', marginBottom: 8, color: '#0f172a' }}>Check your email</h2>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: 32 }}>We've sent a 6-digit PIN to <strong style={{ color: '#0f172a' }}>{email}</strong></p>
              
              <form onSubmit={handleOTPSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={lbl} htmlFor="otp">Verification PIN</label>
                  <input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} required style={{ ...inp, textAlign: 'center', fontSize: '32px', fontWeight: 900, letterSpacing: '12px', paddingLeft: 20, background: '#f8fafc' }} placeholder="000000" />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ ...btn, opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Verifying...' : 'Complete Registration'}
                </button>
                <button type="button" onClick={() => setStep('form')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Use a different email</button>
              </form>
            </>
          )}
          {message && <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 10, background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', fontSize: '14px', fontWeight: 500 }}>⚠️ {message}</div>}
        </div>
      </div>
    </main>
  );
}

