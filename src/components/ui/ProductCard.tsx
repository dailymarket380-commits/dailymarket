'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  unit: string;
  rating: number;
  reviewCount: number;
  vendorName?: string;
  badge?: {
    type: 'wlist' | 'save' | 'premium';
    text?: string;
  };
}

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  imageUrl,
  unit,
  rating,
  reviewCount,
  vendorName,
  badge
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      title,
      price,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
      vendorName
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const safeRating = Math.min(Math.max(Math.round(rating || 4), 1), 5);
  const safeImage = imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';
  const isLocal = !id.startsWith('shp-');

  return (
    <div className={styles.card}>
      {/* Badges */}
      {badge && (
        <div className={`${styles.badge} ${
          badge.type === 'save' ? styles.badgeSave :
          badge.type === 'premium' ? (isLocal ? styles.badgeLocal : styles.badgePremium) :
          styles.badgeWlist
        }`}>
          {badge.text || (badge.type === 'save' ? 'SAVE' : badge.type === 'premium' ? 'PREMIUM' : 'WLIST')}
        </div>
      )}

      {/* Added to Cart Toast */}
      {added && (
        <div className={styles.addedToast}>
          ✓ Added to Cart!
        </div>
      )}

      <Link href={`/product/${id}`} className={styles.linkWrapper}>
        {/* Image */}
        <div className={styles.imageContainer}>
          <img src={safeImage} alt={title} className={styles.image} />
        </div>

        {/* Content */}
        <div className={styles.content}>
          {vendorName && (
            <div className={styles.vendor}>
              {vendorName}
              <svg className={styles.verifiedIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          )}
          <h3 className={styles.title}>{title}</h3>

          {/* Rating */}
          <div className={styles.ratingBox}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={star <= safeRating ? styles.starFilled : styles.starEmpty} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className={styles.reviewCount}>({reviewCount})</span>
          </div>
        </div>
      </Link>

      <div className={styles.footerRow}>
        <div className={styles.priceInfo}>
          <span className={styles.price}>R {price.toFixed(2)}</span>
          {originalPrice && (
            <span className={styles.originalPrice}>R {originalPrice.toFixed(2)}</span>
          )}
          <span className={styles.unit}>{unit}</span>
        </div>
        <button
          className={`${styles.addBtn} ${added ? styles.addBtnSuccess : ''}`}
          onClick={handleAddToCart}
          aria-label={`Add ${title} to cart`}
        >
          {added ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
