import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Suppliers | DailyMarket',
  description: 'Meet the local farmers, artisans, and vendors who power DailyMarket — South Africa\'s freshest premium marketplace.',
};

const SUPPLIERS = [
  { emoji: '🥬', name: 'Cape Greens Co-op', location: 'Stellenbosch, WC', specialty: 'Organic leafy greens & herbs', joined: '2024' },
  { emoji: '🥩', name: 'Karoo Heritage Meats', location: 'Beaufort West, WC', specialty: 'Free-range lamb & beef', joined: '2024' },
  { emoji: '🍞', name: 'The Artisan Loaf', location: 'Cape Town, WC', specialty: 'Sourdough & specialty breads', joined: '2024' },
  { emoji: '🥛', name: 'Westmead Dairy Farm', location: 'Paarl, WC', specialty: 'Full-cream dairy & cheeses', joined: '2024' },
  { emoji: '🍊', name: 'Citrusdal Groves', location: 'Citrusdal, WC', specialty: 'Seasonal citrus & subtropical fruits', joined: '2024' },
  { emoji: '🍯', name: 'Fynbos Bee Works', location: 'Hermanus, WC', specialty: 'Raw honey & bee products', joined: '2024' },
];

export default function SuppliersPage() {
  return (
    <main style={{ background: '#ffffff', color: '#0f172a' }}>
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '30px', marginBottom: '24px', border: '1px solid rgba(16,185,129,0.3)' }}>Verified Local Partners</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>The People Behind Your Plate.</h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.7 }}>Every product you buy on DailyMarket supports a real South African farmer, baker, or artisan. Here's who we work with.</p>
        </div>
      </section>

      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
          {SUPPLIERS.map(s => (
            <div key={s.name} style={{ border: '1.5px solid #f1f5f9', borderRadius: 20, padding: 32, background: '#fafafa' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{s.emoji}</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 6, color: '#0f172a' }}>{s.name}</h2>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>📍 {s.location}</p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>{s.specialty}</p>
              <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: 30 }}>✓ Verified Partner since {s.joined}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.03em' }}>Want to sell on DailyMarket?</h2>
        <p style={{ color: '#64748b', marginBottom: 32, fontSize: '1rem', maxWidth: 480, margin: '0 auto 32px' }}>We're always looking for exceptional local producers who share our passion for quality. Apply to become a verified DailyMarket vendor.</p>
        <Link href="/business-portal" style={{ background: '#0f172a', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>Apply as a Vendor →</Link>
      </section>
    </main>
  );
}
