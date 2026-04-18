'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface WishlistButtonProps {
  productId: string;
  productTitle?: string;
}

export function WishlistButton({ productId, productTitle }: WishlistButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const checkWishlist = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();
    setSaved(!!data);
  }, [user, productId]);

  useEffect(() => {
    setMounted(true);
    checkWishlist();
  }, [checkWishlist]);

  const toggle = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    try {
      if (saved) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setSaved(false);
      } else {
        await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
        setSaved(true);
      }
    } catch (e) {
      console.error('Wishlist toggle failed:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      style={{
        background: saved ? '#cc0000' : '#ffffff',
        border: `2px solid ${saved ? '#cc0000' : '#e2e8f0'}`,
        borderRadius: 50,
        padding: '0 20px',
        height: '100%',
        minHeight: 52,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.5px',
        color: saved ? '#ffffff' : '#000000',
        textTransform: 'uppercase',
        opacity: loading ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!saved) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#cc0000';
          (e.currentTarget as HTMLButtonElement).style.color = '#cc0000';
        }
      }}
      onMouseLeave={e => {
        if (!saved) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
          (e.currentTarget as HTMLButtonElement).style.color = '#000000';
        }
      }}
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24"
        fill={saved ? '#ffffff' : 'none'}
        stroke={saved ? '#ffffff' : '#000000'}
        strokeWidth="2.5"
        style={{ transition: 'all 0.2s', flexShrink: 0 }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
