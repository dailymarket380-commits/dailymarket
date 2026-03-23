import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff7ed 100%)',
    }}>
      {/* Big emoji */}
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: 1 }}>🛒</div>

      {/* 404 number */}
      <h1 style={{
        fontSize: 'clamp(5rem, 15vw, 10rem)',
        fontWeight: 900,
        color: '#f97316',
        letterSpacing: '-0.05em',
        lineHeight: 0.9,
        marginBottom: '1rem',
      }}>404</h1>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', color: '#1a1a1a' }}>
        Oops — This aisle is empty!
      </h2>
      <p style={{ color: '#666', fontSize: '1rem', maxWidth: '440px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
        The page you're looking for may have been moved, deleted, or never existed.
        Don't worry — our shelves are still full of great products!
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          background: '#1a1a1a',
          color: 'white',
          padding: '1rem 2rem',
          fontWeight: 900,
          borderRadius: '6px',
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          🏠 Back to Home
        </Link>
        <Link href="/shop" style={{
          background: '#f97316',
          color: 'white',
          padding: '1rem 2rem',
          fontWeight: 900,
          borderRadius: '6px',
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          🛍️ Browse the Shop
        </Link>
      </div>

      {/* Quick links */}
      <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { href: '/fruit-veg', label: '🥦 Fruit & Veg' },
          { href: '/meat-poultry', label: '🥩 Butchery' },
          { href: '/bakery', label: '🍞 Bakery' },
          { href: '/sweets', label: '🍬 Sweets' },
        ].map(link => (
          <Link key={link.href} href={link.href} style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#f97316',
            borderBottom: '2px solid #fed7aa',
            paddingBottom: '2px',
          }}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
