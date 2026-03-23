'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, deleteProduct } from './actions';

type Product = {
  id: string; title: string; description: string; category: string;
  base_price: number; premium_price: number; unit: string;
  stock_quantity: number; vendor_name: string; created_at: string;
};

const CAT: Record<string, string> = {
  'fruit-veg': '🥦 Fruit & Veg', 'meat-poultry': '🥩 Bouchery', 'bakery': '🍞 Bakery',
  'dairy': '🥛 Dairy', 'pantry': '🫙 Pantry', 'beverages': '☕ Beverages',
  'sweets': '🍬 Sweets', 'frozen': '🧊 Frozen',
};

const CAT_COLOR: Record<string, string> = {
  'fruit-veg': '#dcfce7', 'meat-poultry': '#fee2e2', 'bakery': '#fef9c3',
  'dairy': '#dbeafe', 'pantry': '#f3e8ff', 'beverages': '#fce7f3',
  'sweets': '#ffedd5', 'frozen': '#e0f2fe',
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vendorName = searchParams.get('vendor') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorName) { 
      setLoading(false); 
      // Redirect to login if no vendor session found?
      // router.push('/login');
      return; 
    }
    getProducts(vendorName).then(res => {
      setLoading(false);
      if (res.success) setProducts(res.products as Product[]);
      else setError(res.error || 'Error loading products');
    });
  }, [vendorName]);

  async function handleDelete(id: string) {
    if (!confirm('Remove this product from the marketplace?')) return;
    setDeletingId(id);
    const res = await deleteProduct(id);
    if (res.success) setProducts(prev => prev.filter(p => p.id !== id));
    else alert('Error: ' + res.error);
    setDeletingId(null);
  }

  const sidebarBtn = (item: any) => (
    <Link key={item.href} href={`${item.href}?vendor=${encodeURIComponent(vendorName)}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', fontSize: '14px', fontWeight: item.active ? 800 : 500, background: item.active ? 'var(--primary-light)' : 'transparent', color: item.active ? 'var(--primary)' : 'var(--text-muted)', border: item.active ? '1px solid #fed7aa' : '1px solid transparent', marginBottom: 6 }}>
      <span style={{ fontSize: 18, opacity: item.active ? 1 : 0.7 }}>{item.icon}</span> {item.label}
    </Link>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
           <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', fontWeight: 900, fontSize: '18px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, boxShadow: '0 4px 10px rgba(249,115,22,0.2)' }}>DM</div>
           <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', letterSpacing: '-0.3px' }}>Seller Center</div>
              <div style={{ fontSize: '9px', color: '#f97316', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Premium Merchant</div>
           </div>
        </Link>

        {vendorName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '6px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px' }}>
              {vendorName[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{vendorName}</span>
            <div style={{ width: 1, height: 16, background: '#e2e8f0' }}></div>
            <Link href="/login" style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textDecoration: 'none' }}>LOGOUT</Link>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 260, background: '#fff', borderRight: '1px solid var(--border)', padding: '32px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 16px', marginBottom: 20 }}>DASHBOARD</div>
          {[
            { href: '/products', icon: '🛍️', label: 'Storefront Inventory', active: true },
            { href: '/onboarding', icon: '➕', label: 'List New Product', active: false },
            { href: '/profile', icon: '🏦', label: 'Payout Settings', active: false },
          ].map(sidebarBtn)}
          
          <div style={{ marginTop: 'auto', padding: '24px 16px', background: 'var(--primary-light)', borderRadius: 12, border: '1px solid #fed7aa' }}>
             <p style={{ fontSize: '12px', fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>Merchant Support</p>
             <p style={{ fontSize: '11px', color: '#c2410c', lineHeight: 1.5 }}>Need help with a shipment? Our elite support team is ready.</p>
             <button style={{ marginTop: 12, background: '#fff', border: '1px solid #fed7aa', borderRadius: 6, padding: '6px 12px', fontSize: '11px', fontWeight: 800, color: '#f97316', cursor: 'pointer' }}>CONTACT US</button>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
              {[
                { icon: '📦', label: 'Total Inventory', val: loading ? '...' : products.length, trend: '+0.0%' },
                { icon: '🌟', label: 'Average Quality', val: '4.9/5', trend: 'TOP 10%' },
                { icon: '💰', label: 'Est. Revenue', val: loading || !products.length ? 'R0.00' : `R${(products.reduce((a, p) => a + p.premium_price, 0)).toLocaleString()}`, trend: 'SOUT ACTIVE' },
              ].map((s, i) => (
                <div key={i} className="premium-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '40px', position: 'absolute', right: -10, bottom: -10, opacity: 0.05 }}>{s.icon}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                     <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' }}>{s.val}</div>
                     <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: 20 }}>{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Your Storefront Inventory</h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: 4 }}>Manage and track your premium marketplace listings.</p>
              </div>
              <Link href={`/onboarding?vendor=${encodeURIComponent(vendorName)}`} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)', color: '#fff', textDecoration: 'none', fontWeight: 800, padding: '14px 24px', borderRadius: 12, fontSize: '14px', boxShadow: '0 4px 12px rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>➕</span> List a New Product
              </Link>
            </div>

            {/* Error */}
            {error && <div style={{ padding: '16px 20px', borderRadius: 12, background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', fontSize: '14px', fontWeight: 500, marginBottom: 24 }}>⚠️ {error}</div>}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="premium-card" style={{ padding: '100px 40px', textAlign: 'center', borderStyle: 'dashed', background: 'transparent' }}>
                <div style={{ fontSize: 64, marginBottom: 24 }}>📥</div>
                <h3 style={{ fontWeight: 900, fontSize: '22px', marginBottom: 12, color: '#0f172a' }}>Your catalog is empty</h3>
                <p style={{ color: '#64748b', fontSize: '16px', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Start your premium experience by listing your first high-quality product for our shoppers.</p>
                <Link href={`/onboarding?vendor=${encodeURIComponent(vendorName)}`} style={{ background: 'var(--text-main)', color: '#fff', textDecoration: 'none', fontWeight: 800, padding: '16px 32px', borderRadius: 12, fontSize: '15px' }}>+ List your first product</Link>
              </div>
            )}

            {/* Product List Grid */}
            {!loading && products.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {products.map(p => (
                  <div key={p.id} className="premium-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Visual Preview */}
                    <div style={{ height: 160, background: CAT_COLOR[p.category] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                       {p.image_url ? (
                         <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                         <div style={{ fontSize: 64, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>{(CAT[p.category] || '📦').split(' ')[0]}</div>
                       )}
                       <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.9)', padding: '5px 12px', borderRadius: 30, fontSize: '11px', fontWeight: 800, color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', letterSpacing: '0.02em', zIndex: 2 }}>
                          {CAT[p.category] || p.category}
                       </div>
                    </div>


                    <div style={{ padding: '24px' }}>
                      <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a', marginBottom: 8, letterSpacing: '-0.5px' }}>{p.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: 24, minHeight: 42 }}>{p.description}</p>

                      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>DailyMarket Price</span>
                            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>R{p.premium_price?.toFixed(2)}</span>
                         </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Your Earnings (incl):</span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>R{p.base_price?.toFixed(2)} / {p.unit}</span>
                         </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                         <div style={{ display: 'flex', gap: 6 }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#fbbf24', fontSize: '14px' }}>★</span>)}
                         </div>
                         <div style={{ fontSize: '12px', fontWeight: 700, color: p.stock_quantity > 0 ? '#10b981' : '#ef4444' }}>
                            ● {p.stock_quantity > 0 ? `${p.stock_quantity} IN STOCK` : 'OUT OF STOCK'}
                         </div>
                      </div>

                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} style={{ width: '100%', background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 10, padding: '12px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', cursor: deletingId === p.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                        {deletingId === p.id ? 'REMOVING...' : '🗑 REMOVE LISTING'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

