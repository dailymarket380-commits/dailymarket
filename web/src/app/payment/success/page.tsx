'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || 'DM-XXXXX';
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart on successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div style={{
      minHeight: '70vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>

        {/* Animated success circle */}
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 8px 32px rgba(22,163,74,0.3)',
          animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <style>{`@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

        <h1 style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          Payment Successful! 🎉
        </h1>
        <p style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Order Confirmed via PayFast
        </p>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Order reference: <strong style={{ color: '#1a1a1a' }}>{orderId}</strong>
        </p>

        <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
          Your payment was processed securely by <strong>PayFast</strong>. You'll receive an SMS and email confirmation shortly.
        </p>

        {/* What happens next */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { emoji: '📦', title: 'Packing', desc: 'Vendor preparing your order' },
            { emoji: '🚚', title: 'On the Way', desc: 'Driver heading to you' },
            { emoji: '🏠', title: 'Delivered', desc: 'Enjoy your order!' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', padding: '1.25rem 0.75rem', borderRadius: '10px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ background: '#1a1a1a', color: 'white', padding: '1rem 2rem', fontWeight: 900, borderRadius: '6px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            🛍️ Continue Shopping
          </Link>
          <Link href="/support" style={{ background: 'transparent', color: '#f97316', padding: '1rem 2rem', fontWeight: 900, border: '2px solid #f97316', borderRadius: '6px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            💬 Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}
