'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveBankDetails, saveStoreLogo, getStoreLogo } from './actions';
import Link from 'next/link';
import { getSession } from '../login/actions';
import { useRouter } from 'next/navigation';
import TopNavProfile from '@/components/TopNavProfile';

import { Suspense, useEffect, useRef } from 'react';

function ProfileContent() {
  const router = useRouter();
  const [vendorName, setVendorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | string>('idle');
  const [logoState, setLogoState] = useState<'idle' | 'uploading' | 'success' | string>('idle');
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSession().then((res) => {
      if (!res.success || !res.vendorName) {
        router.push('/login');
        return;
      }
      setVendorName(res.vendorName);
      getStoreLogo(res.vendorName).then(logoRes => {
        if (logoRes.success && logoRes.logoUrl) {
          setCurrentLogo(logoRes.logoUrl);
        }
      });
    });
  }, [router]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoState('uploading');
    
    // 1. Upload file via our API route
    const uploadForm = new FormData();
    uploadForm.set('file', file);
    uploadForm.set('vendorName', vendorName + '-logo');

    try {
      const uploadRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadForm,
      });
      const uploadResult = await uploadRes.json();

      if (!uploadResult.success) {
        setLogoState('error:' + uploadResult.error);
        return;
      }

      // 2. Save URL to the sellers table
      const saveRes = await saveStoreLogo(vendorName, uploadResult.url);
      if (!saveRes.success) {
        setLogoState('error:' + saveRes.error);
        return;
      }

      // 3. Success
      setCurrentLogo(uploadResult.url);
      setLogoState('success');
      setTimeout(() => setLogoState('idle'), 3000);
    } catch (err: any) {
      setLogoState('error:Upload failed');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setResult('idle');
    const formData = new FormData(e.currentTarget);
    const res = await saveBankDetails(formData);
    setIsSubmitting(false);
    if (res.success) setResult('success'); else setResult('error:' + res.error);
  }

  const inp: React.CSSProperties = { width: '100%', background: '#fafafa', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '14px 18px', color: '#1a1a1a', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: 7 };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      {/* Top Nav */}
      <div className="dashboard-header">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ background: '#0f172a', color: '#fff', fontWeight: 900, fontSize: '16px', padding: '3px 9px', borderRadius: 5 }}>DM</div>
          <span className="dashboard-header-brand-text" style={{ fontWeight: 800, fontSize: '15px', color: '#1a1a1a' }}>Seller Center</span>
        </Link>
        {vendorName && <TopNavProfile vendorName={vendorName} />}
      </div>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 10 }}>Menu</div>
          {[
            { href: '/products', icon: '🛍️', label: 'Storefront Inventory', active: false },
            { href: '/orders', icon: '📦', label: 'Customer Orders', active: false },
            { href: '/onboarding', icon: '➕', label: 'List New Product', active: false },
            { href: '/profile', icon: '🏦', label: 'Payout Settings', active: true },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 8, textDecoration: 'none', fontSize: '14px', fontWeight: item.active ? 700 : 500, background: item.active ? '#f1f5f9' : 'transparent', color: item.active ? '#0f172a' : '#666', borderLeft: item.active ? '3px solid #0f172a' : '3px solid transparent', marginBottom: 2 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </aside>

        {/* Content */}
        <div className="dashboard-main">
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: '#1a1a1a', margin: '0 0 4px 0' }}>Store Settings</h1>
              <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>Configure your brand identity and payout methods.</p>
            </div>

            {/* Store Brand Identity */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ background: '#0f172a', padding: '14px 24px', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                🏪 Store Brand Identity
              </div>
              <div className="flex-between-responsive" style={{ padding: '24px', alignItems: 'flex-start' }}>
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: 100, height: 100, background: '#f8fafc', borderRadius: '50%', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', position: 'relative' }}
                 >
                    {currentLogo ? (
                      <img src={currentLogo} alt="Store Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '32px' }}>🏪</span>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: '9px', fontWeight: 800, textAlign: 'center', padding: '4px 0' }}>EDIT LOGO</div>
                 </div>
                 
                 <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Store Logo</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', maxWidth: 400 }}>
                      This image will be displayed on the Cash & Carry marketplace homepage and your dedicated store page.
                    </p>
                    
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} style={{ display: 'none' }} />
                    
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={logoState === 'uploading'} style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: logoState === 'uploading' ? 'wait' : 'pointer' }}>
                      {logoState === 'uploading' ? 'Uploading...' : 'Upload New Logo'}
                    </button>
                    
                    {logoState === 'success' && <span style={{ marginLeft: 12, fontSize: '13px', fontWeight: 700, color: '#10b981' }}>✓ Saved to database</span>}
                    {typeof logoState === 'string' && logoState.startsWith('error:') && (
                        <div style={{ marginTop: 12, fontSize: '12px', fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, border: '1px solid #fecaca' }}>
                            {logoState.slice(6)}
                        </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Payout Settings */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
              <div style={{ background: '#0f172a', padding: '14px 24px', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                🏦 South African Banking Details
              </div>
              
              <div style={{ padding: '28px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="stat-grid" style={{ gap: 16, marginBottom: 0 }}>
                    <div><label style={lbl} htmlFor="email">Email Address</label><input id="email" name="email" type="email" required style={inp} placeholder="seller@example.com" /></div>
                    <div><label style={lbl} htmlFor="vendorName">Business Name</label><input id="vendorName" name="vendorName" type="text" defaultValue={vendorName} style={inp} /></div>
                  </div>

                  <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 24 }}>
                    <div className="stat-grid" style={{ gap: 16, marginBottom: 16 }}>
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

                  <button type="submit" disabled={isSubmitting} style={{ background: isSubmitting ? '#fbbf80' : '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '15px', fontWeight: 800, fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(15,23,42,0.3)' }}>
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
      
      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <Link href={`/products`} className="mobile-nav-item">
          <span className="mobile-nav-icon">🛍️</span>
          <span>Inventory</span>
        </Link>
        <Link href={`/orders`} className="mobile-nav-item">
          <span className="mobile-nav-icon">📦</span>
          <span>Orders</span>
        </Link>
        <Link href={`/onboarding`} className="mobile-nav-item">
          <span className="mobile-nav-icon">➕</span>
          <span>List Item</span>
        </Link>
        <Link href={`/profile`} className="mobile-nav-item active">
          <span className="mobile-nav-icon">🏦</span>
          <span>Payouts</span>
        </Link>
      </nav>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
