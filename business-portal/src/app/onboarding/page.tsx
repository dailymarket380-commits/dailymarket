'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addProduct } from './actions';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'fruit-veg', label: '🥦 Fruit & Veg' },
  { value: 'meat-poultry', label: '🥩 Butchery' },
  { value: 'bakery', label: '🍞 Bakery' },
  { value: 'dairy', label: '🥛 Dairy & Eggs' },
  { value: 'pantry', label: '🫙 Artisan Pantry' },
  { value: 'beverages', label: '☕ Beverages' },
  { value: 'sweets', label: '🍬 Confectionery' },
  { value: 'frozen', label: '🧊 Frozen Foods' },
];

import { Suspense } from 'react';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const vendorName = searchParams.get('vendor') || '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | string>('idle');
  const [selectedCat, setSelectedCat] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSubmitting(true); setResult('idle');
    const formData = new FormData(e.currentTarget);
    const res = await addProduct(formData);
    setIsSubmitting(false);
    if (res.success) { 
      setResult('success'); 
      (e.target as HTMLFormElement).reset(); 
      setSelectedCat('');
      setImagePreview(null);
    }
    else setResult('error:' + res.error);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  const inp: React.CSSProperties = { width: '100%', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px 18px', color: 'var(--text-main)', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'all 0.2s' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.02em' };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
           <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', fontWeight: 900, fontSize: '18px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, boxShadow: '0 4px 10px rgba(249,115,22,0.2)' }}>DM</div>
           <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', letterSpacing: '-0.3px' }}>Seller Center</div>
              <div style={{ fontSize: '9px', color: '#f97316', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Listing</div>
           </div>
        </Link>

        {vendorName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '6px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px' }}>
              {vendorName[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{vendorName}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 260, background: '#fff', borderRight: '1px solid var(--border)', padding: '32px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 16px', marginBottom: 20 }}>DASHBOARD</div>
          {[
            { href: '/products', icon: '🛍️', label: 'Storefront Inventory', active: false },
            { href: '/onboarding', icon: '➕', label: 'List New Product', active: true },
            { href: '/profile', icon: '🏦', label: 'Payout Settings', active: false },
          ].map(item => (
            <Link key={item.href} href={`${item.href}?vendor=${encodeURIComponent(vendorName)}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', fontSize: '14px', fontWeight: item.active ? 800 : 500, background: item.active ? 'var(--primary-light)' : 'transparent', color: item.active ? 'var(--primary)' : 'var(--text-muted)', border: item.active ? '1px solid #fed7aa' : '1px solid transparent', marginBottom: 6 }}>
              <span style={{ fontSize: 18, opacity: item.active ? 1 : 0.7 }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </aside>

        {/* Content */}
        <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
               <div style={{ display: 'inline-flex', padding: '6px 14px', background: 'var(--primary-light)', borderRadius: 30, fontSize: '11px', fontWeight: 800, color: 'var(--primary)', marginBottom: 16 }}>
                MARKETPLACE ASSET
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1.5px', color: '#0f172a', marginBottom: 8 }}>List New Product</h1>
              <p style={{ color: '#64748b', fontSize: '16px' }}>Provide accurate details to ensure your product reaches the right elite customers.</p>
            </div>

            <div className="premium-card">
              <div style={{ background: 'linear-gradient(to right, #f97316, #ea580c)', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 Product Specifications</span>
              </div>
              <div style={{ padding: '40px 32px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }} encType="multipart/form-data">
                  <input type="hidden" name="vendorName" value={vendorName} />

                  {/* Image Upload Header */}
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '24px', background: '#f8fafc', borderRadius: 16, border: '1px dashed var(--border)' }}>
                     <div style={{ width: 140, height: 140, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        {imagePreview ? <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '40px' }}>📦</span>}
                     </div>
                     <div style={{ flex: 1 }}>
                        <label style={lbl}>Product Visual *</label>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 12 }}>High-resolution photos increase sales by 40%.</p>
                        <input type="file" name="imageFile" accept="image/*" onChange={handleImageChange} required style={{ fontSize: '13px', color: 'var(--text-muted)' }} />
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>

                    <div>
                      <label style={lbl} htmlFor="title">Display Name *</label>
                      <input id="title" name="title" type="text" required style={inp} placeholder="e.g. Heirloom Purple Carrots (Bunch)" />
                    </div>
                    <div>
                      <label style={lbl} htmlFor="description">Marketplace Description *</label>
                      <textarea id="description" name="description" required rows={4} style={{ ...inp, resize: 'none' }} placeholder="Describe the origin, taste, and quality of your product..." />
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>Gallery Category *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {CATEGORIES.map(cat => (
                        <label key={cat.value} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="category" value={cat.value} checked={selectedCat === cat.value} onChange={() => setSelectedCat(cat.value)} required style={{ display: 'none' }} />
                          <div style={{ background: selectedCat === cat.value ? 'var(--primary-light)' : '#f8fafc', border: selectedCat === cat.value ? '2px solid var(--primary)' : '1.5px solid var(--border)', borderRadius: 12, padding: '14px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: selectedCat === cat.value ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {cat.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={lbl} htmlFor="basePrice">Your Price (EFT Payout) *</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 16, top: 14, fontWeight: 800, color: 'var(--text-muted)' }}>R</span>
                        <input id="basePrice" name="basePrice" type="number" step="0.01" required style={{ ...inp, paddingLeft: 34 }} placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label style={lbl} htmlFor="unit">Unit / Scale *</label>
                      <input id="unit" name="unit" type="text" required style={inp} placeholder="e.g. 500g / box" />
                    </div>
                    <div>
                      <label style={lbl} htmlFor="stock">Available Stock</label>
                      <input id="stock" name="stock" type="number" defaultValue="50" style={inp} />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 24 }}>💡</div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Elite Fulfilment Pricing</p>
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                        We add a <strong>15% Marketplace Premium</strong> to your asking price. This covers logistics, cold chain storage, and premium delivery. You will always receive your full payout per unit sold.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                    <Link href={`/products?vendor=${vendorName}`} style={{ padding: '16px 24px', borderRadius: 12, fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Cancel</Link>
                    <button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 32px', fontWeight: 800, fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      {isSubmitting ? 'Publishing Asset...' : '🚀 Publish Listing'}
                    </button>
                  </div>

                  {result === 'success' && <div style={{ padding: '16px', borderRadius: 12, background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', fontSize: '14px', fontWeight: 800, textAlign: 'center' }}>✓ Listing published to Marketplace!</div>}
                  {typeof result === 'string' && result.startsWith('error:') && <div style={{ padding: '16px', borderRadius: 12, background: '#fff1f2', border: '1px solid #e11d48', color: '#9f1239', fontSize: '14px', fontWeight: 800, textAlign: 'center' }}>⚠️ {result.slice(6)}</div>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading marketplace asset...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

