'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EFTUploadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order') || '';
  const amount = searchParams.get('amount') || '0.00';
  
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (orderId) {
      setReference(`ORDER-${orderId.slice(0, 8).toUpperCase()}`);
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Invalid Order</h2>
        <Link href="/shop" style={{ display: 'inline-block', marginTop: '1rem', padding: '10px 20px', background: 'black', color: 'white' }}>Return to Shop</Link>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a proof of payment file.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);
      formData.append('name', name);
      formData.append('reference', reference);

      const res = await fetch('/api/upload-proof', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload proof');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #fff7ed 100%)', minHeight: '70vh', padding: '5rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#16a34a' }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Proof Uploaded!
          </h1>
          <p style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⏳ Awaiting Verification
          </p>
          <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you! Your payment proof for Reference <strong>{reference}</strong> has been received. Our team will verify it shortly and process your order. You will receive an email once it is approved.
          </p>
          <Link href="/" style={{ background: '#1e293b', color: 'white', padding: '1rem 2rem', fontWeight: 800, borderRadius: '8px', display: 'inline-block', textDecoration: 'none' }}>
             RETURN TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <div style={{ background: '#0f172a', padding: '2rem', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>EFT Payment Required</h1>
          <p style={{ opacity: 0.8, marginTop: '0.5rem', fontSize: '0.95rem' }}>Upload your Proof of Payment to complete the order.</p>
        </div>
        
        <div style={{ padding: '2rem' }}>
          <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem' }}>
             <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Transfer Amount</h3>
             <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>R {amount}</div>
             <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#334155' }}>
               Please use <strong>{reference}</strong> as your payment reference.
             </div>
          </div>

          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Full Name (used for payment)</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe" 
                value={name} 
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Payment Reference Used</label>
              <input 
                type="text" 
                required 
                value={reference} 
                onChange={e => setReference(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Proof of Payment (Image or PDF)</label>
              <input 
                type="file" 
                required 
                accept="image/jpeg, image/png, application/pdf"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '2px dashed #cbd5e1', fontSize: '1rem', cursor: 'pointer' }}
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !file}
              style={{ 
                width: '100%', padding: '1rem', background: (loading || !file) ? '#94a3b8' : '#16a34a', color: 'white', 
                fontWeight: 900, borderRadius: '8px', fontSize: '1rem', border: 'none', cursor: (loading || !file) ? 'not-allowed' : 'pointer' 
              }}
            >
              {loading ? 'UPLOADING...' : 'SUBMIT PROOF OF PAYMENT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
