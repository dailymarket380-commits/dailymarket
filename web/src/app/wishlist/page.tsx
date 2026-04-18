'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    title: string;
    image_url: string;
    premium_price: number;
    vendor_name: string;
    category: string;
    stock_quantity: number;
  };
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetchWishlist();
  }, [user, authLoading]);

  async function fetchWishlist() {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('id, product_id, created_at, products(id, title, image_url, premium_price, vendor_name, category, stock_quantity)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data as any);
    setLoading(false);
  }

  async function removeItem(wishlistId: string) {
    setRemoving(wishlistId);
    await supabase.from('wishlists').delete().eq('id', wishlistId);
    setItems(prev => prev.filter(i => i.id !== wishlistId));
    setRemoving(null);
  }

  function handleAddToCart(item: WishlistItem) {
    addToCart({
      id: item.products.id,
      title: item.products.title,
      price: item.products.premium_price,
      imageUrl: item.products.image_url,
      vendorName: item.products.vendor_name,
    });
    setAddedToCart(item.id);
    setTimeout(() => setAddedToCart(null), 2000);
  }

  if (!authLoading && !user) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>❤️</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Your Wishlist</h1>
        <p style={{ color: '#64748b', marginBottom: 28 }}>Sign in to see your saved products.</p>
        <Link href="/login?redirect=/wishlist" style={{ background: '#0f172a', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', fontSize: 15 }}>
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '32px 24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>❤️</span>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: 0 }}>My Wishlist</h1>
            {!loading && (
              <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 999, padding: '2px 12px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Products you've saved for later</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 320, animation: 'pulse 1.5s infinite', opacity: 0.6 }} />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 20, border: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>💔</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Nothing saved yet</h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
              Browse the store and tap the heart ❤️ icon on any product to save it here.
            </p>
            <Link href="/shop" style={{ background: '#0f172a', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', fontSize: 15 }}>
              Browse Products →
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            {/* Quick add all to cart */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, gap: 12 }}>
              <button
                onClick={() => items.forEach(i => handleAddToCart(i))}
                style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                🛒 Add All to Cart
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {items.map(item => (
                <div key={item.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}>
                  
                  {/* Image */}
                  <Link href={`/product/${item.products.id}`} style={{ display: 'block', textDecoration: 'none', position: 'relative' }}>
                    <img
                      src={item.products.image_url || 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=300&fit=crop'}
                      alt={item.products.title}
                      style={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                    {/* Remove button */}
                    <button
                      onClick={e => { e.preventDefault(); removeItem(item.id); }}
                      disabled={removing === item.id}
                      style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 16 }}>
                      {removing === item.id ? '⏳' : '❤️'}
                    </button>
                  </Link>

                  {/* Info */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      {item.products.vendor_name}
                    </div>
                    <Link href={`/product/${item.products.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.3 }}>
                        {item.products.title}
                      </h3>
                    </Link>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
                        R {item.products.premium_price?.toFixed(2)}
                      </span>
                      <span style={{ fontSize: 11, color: item.products.stock_quantity > 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        {item.products.stock_quantity > 0 ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.products.stock_quantity === 0}
                      style={{
                        width: '100%', marginTop: 12, padding: '12px', borderRadius: 10, border: 'none',
                        background: addedToCart === item.id ? '#16a34a' : (item.products.stock_quantity === 0 ? '#f1f5f9' : '#0f172a'),
                        color: item.products.stock_quantity === 0 ? '#94a3b8' : '#fff',
                        fontWeight: 800, fontSize: 13, cursor: item.products.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.2s',
                      }}>
                      {addedToCart === item.id ? '✓ Added to Cart!' : item.products.stock_quantity === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
