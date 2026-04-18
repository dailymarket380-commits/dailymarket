'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from '../checkout.module.css';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'Unknown';
  const orderRef = searchParams.get('order_ref') || 'XXXXXXXX';
  const { user } = useAuth();
  
  const [confirmed, setConfirmed] = useState(false);
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();

    // Fallback confirmation since local webhooks don't work without ngrok.
    // In production, the backend handles this via the webhook.
    if (orderId && !confirmed) {
      fetch('/api/payfast-webhook/fallback', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ orderId })
      }).then(() => setConfirmed(true)).catch(() => {});
    }
  }, [orderId, confirmed]); // intentionally omitted clearCart to prevent infinite loop

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Hero confirmation banner */}
      <div style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        padding: '60px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className={styles.successIcon} style={{ background: '#10b981', boxShadow: '0 0 0 12px rgba(16,185,129,0.15)', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="32" height="32">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <br/>
        <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>✓ Payment Confirmed</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Thank you, {firstName}!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500 }}>
          Order Reference: <span style={{ color: '#fff', fontWeight: 800, fontFamily: 'monospace' }}>{orderRef}</span>
        </p>
      </div>

      <div style={{ flex: 1, padding: '0 16px 40px', marginTop: -32, maxWidth: 600, margin: '-32px auto 0', width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', padding: '28px 24px', marginBottom: 16 }}>
          <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.8, textAlign: 'center', marginBottom: 24 }}>
            Your payment was successful and your order is being prepared for delivery. You'll receive an <strong style={{ color: '#111' }}>SMS and email confirmation</strong> shortly.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 8 }}>
            {[
              { icon: '📦', title: 'Packing', active: true },
              { icon: '🚚', title: 'On the Way', active: false },
              { icon: '🏠', title: 'Delivered', active: false },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px',
                    background: step.active ? '#0f172a' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: step.active ? '0 4px 14px rgba(15,23,42,0.25)' : 'none'
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: step.active ? '#0f172a' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{step.title}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ height: 2, flex: 0.5, background: '#e2e8f0', marginBottom: 24, flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href={`/track?orderId=${orderId}`} style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #111 100%)',
            color: 'white', padding: '18px', fontWeight: 900, borderRadius: 14,
            fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.04em',
            textDecoration: 'none', textAlign: 'center', display: 'block',
            boxShadow: '0 4px 20px rgba(15,23,42,0.3)'
          }}>
            📍 Track My Order
          </Link>
          <Link href="/" style={{
            background: '#f8fafc', color: '#0f172a', padding: '16px', fontWeight: 800,
            borderRadius: 14, fontSize: '14px', textDecoration: 'none',
            textAlign: 'center', display: 'block', border: '1.5px solid #e2e8f0'
          }}>
            🛍️ Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
