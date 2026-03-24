'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from './Button';
import styles from '@/app/(shop)/product/[id]/page.module.css';

interface AddToCartControlsProps {
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    vendorName?: string;
  };
}

export function AddToCartControls({ product }: AddToCartControlsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAdd = () => {
    // Mobile Haptic Feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      window.navigator.vibrate(50);
    }

    if (addToCart) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        vendorName: product.vendorName,
        quantity: quantity // Assuming CartContext supports a quantity parameter
      });
    }
  };

  return (
    <div className={styles.purchaseControls}>
      <div className={styles.quantityStepper}>
        <button 
          className={styles.stepperBtn} 
          onClick={() => {
            setQuantity(Math.max(1, quantity - 1));
            if ('vibrate' in navigator) navigator.vibrate(10);
          }}
        >
          -
        </button>
        <div className={styles.quantityDisplay}>
          <span className={styles.quantityNum}>{quantity}</span>
        </div>
        <button 
          className={styles.stepperBtn} 
          onClick={() => {
            setQuantity(quantity + 1);
            if ('vibrate' in navigator) navigator.vibrate(10);
          }}
        >
          +
        </button>
      </div>
      <Button 
        variant="primary" 
        size="lg" 
        fullWidth 
        onClick={handleAdd}
        className={styles.addToCartBtn}
      >
        ADD TO CART
      </Button>
    </div>
  );
}
