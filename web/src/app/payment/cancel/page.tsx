import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      textAlign: 'center',
      background: '#fafafa',
    }}>
      <div style={{ maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>😕</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
          No worries — your cart has been saved. You can go back and try again whenever you're ready. <br /><br />
          If you had a problem paying, our support team is available 24/7.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/cart" style={{ background: '#1a1a1a', color: 'white', padding: '1rem 2rem', fontWeight: 900, borderRadius: '6px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            🛒 Return to Cart
          </Link>
          <Link href="/support" style={{ background: 'transparent', color: '#f97316', padding: '1rem 2rem', fontWeight: 900, border: '2px solid #f97316', borderRadius: '6px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            💬 Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
