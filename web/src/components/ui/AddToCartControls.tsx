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
    if (addToCart) {
      // Add 'quantity' times
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          vendorName: product.vendorName
        });
      }
    }
  };

  return (
    <div className={styles.purchaseControls}>
      <div className={styles.quantitySelector}>
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
        <input 
          type="number" 
          value={quantity} 
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        />
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={handleAdd}>
        ADD TO CART
      </Button>
    </div>
  );
}
