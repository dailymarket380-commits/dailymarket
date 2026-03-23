'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveBankDetails } from './actions';
import Link from 'next/link';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const vendorName = searchParams.get('vendor') || '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | string>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setResult('idle');
    const formData = new FormData(e.currentTarget);
    const res = await saveBankDetails(formData);
    setIsSubmitting(false);
    if (res.success) setResult('success'); else setResult('error:' + res.error);
  }

  const inp: React.CSSProperties = { width: '100%', background: '#fafafa', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '12px 14px', color: '#1a1a1a', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: 7 };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      {/* Top Nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ background: '#f97316', color: '#fff', fontWeight: 900, fontSize: '16px', padding: '3px 9px', borderRadius: 5 }}>DM</div>
          <span style={{ fontWeight: 800, fontSize: '15px', color: '#1a1a1a' }}>Seller Center</span>
        </Link>
        {vendorName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '13px' }}>
              {vendorName[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>{vendorName}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #e8e8e8', padding: '20px 12px', flexShrink: 0, minHeight: 'calc(100vh - 60px)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 10 }}>Menu</div>
          {[
            { href: '/products', icon: '🛍️', label: 'My Products', active: false },
            { href: '/onboarding', icon: '➕', label: 'Add Product', active: false },
            { href: '/profile', icon: '🏦', label: 'Bank Details', active: true },
          ].map(item => (
            <Link key={item.href} href={`${item.href}?vendor=${encodeURIComponent(vendorName)}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 8, textDecoration: 'none', fontSize: '14px', fontWeight: item.active ? 700 : 500, background: item.active ? '#fff7ed' : 'transparent', color: item.active ? '#f97316' : '#666', borderLeft: item.active ? '3px solid #f97316' : '3px solid transparent', marginBottom: 2 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </aside>

        {/* Content */}
        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: '#1a1a1a', marginBottom: 4 }}>Payout Settings</h1>
              <p style={{ color: '#aaa', fontSize: '14px' }}>Configure where you want to receive your bi-weekly earnings.</p>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
              <div style={{ background: '#f97316', padding: '14px 24px', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                🏦 South African Banking Details
              </div>
              
              <div style={{ padding: '28px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label style={lbl} htmlFor="email">Email Address</label><input id="email" name="email" type="email" required style={inp} placeholder="seller@example.com" /></div>
                    <div><label style={lbl} htmlFor="vendorName">Business Name</label><input id="vendorName" name="vendorName" type="text" defaultValue={vendorName} style={inp} /></div>
                  </div>

                  <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div><label style={lbl} htmlFor="bankName">Bank Name</label><input id="bankName" name="bankName" type="text" required style={inp} placeholder="e.g. FNB, Capitec" /></div>
                      <div><label style={lbl} htmlFor="branchCode">Branch Code</label><input id="branchCode" name="branchCode" type="text" required style={inp} placeholder="e.g. 250655" /></div>
                    </div>
                    <div><label style={lbl} htmlFor="accountNumber">Account Number</label><input id="accountNumber" name="accountNumber" type="text" required style={{ ...inp, letterSpacing: '2px', fontWeight: 700, fontSize: '16px' }} placeholder="0000000000" /></div>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>🔒</span>
                    <span style={{ color: '#15803d', fontSize: '13px', fontWeight: 600 }}>
                      Your information is encrypted and stored securely for EFT payouts only.
                    </span>
                  </div>

                  <button type="submit" disabled={isSubmitting} style={{ background: isSubmitting ? '#fbbf80' : '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '15px', fontWeight: 800, fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>
                    {isSubmitting ? 'Saving Details...' : '💾 Save Banking Details'}
                  </button>

                  {result === 'success' && <div style={{ padding: '14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>✓ Settings updated successfully!</div>}
                  {typeof result === 'string' && result.startsWith('error:') && <div style={{ padding: '14px', borderRadius: 8, background: '#fff8f8', border: '1px solid #ffdcdc', color: '#e53e3e', fontSize: '14px' }}>⨯ {result.slice(6)}</div>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
