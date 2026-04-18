'use client';

import { useState } from 'react';
import Link from 'next/link';

const STORE_IMAGES = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80',
  'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800&q=80',
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
];

interface StoreCardProps {
  id: string;
  name: string;
  subtitle: string;
  logo?: string;
  idx: number;
}

export default function StoreCard({ id, name, subtitle, logo, idx }: StoreCardProps) {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link
      href={`/stores/${id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          border: '1.5px solid #f1f5f9',
          borderRadius: 20,
          overflow: 'hidden',
          background: '#fff',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
          (e.currentTarget as HTMLElement).style.transform = 'none';
        }}
      >
        {/* Store Image */}
        <div style={{ height: 180, overflow: 'hidden', position: 'relative', background: '#f8fafc' }}>
          <img
            src={logo && !logoError ? logo : STORE_IMAGES[idx % STORE_IMAGES.length]}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setLogoError(true)}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 14, right: 14, background: '#10b981', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.04em' }}>
            ● OPEN
          </div>
        </div>

        {/* Store Info */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: 4, letterSpacing: '-0.3px' }}>{name}</h3>
              <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{subtitle}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {logo && !logoError ? (
                <img 
                  src={logo} 
                  alt={name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>{name[0]}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              <span>🚚</span> Free delivery over R500
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              <span>⏱</span> 30–60 min
            </div>
          </div>

          <div style={{ marginTop: 16, background: '#0f172a', color: '#fff', textAlign: 'center', padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: '14px' }}>
            Shop Now →
          </div>
        </div>
      </div>
    </Link>
  );
}
