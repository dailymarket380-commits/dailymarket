'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { fetchSAProducts } from '@/services/marketplaceService';
import styles from './ConsumerMagicAdd.module.css';

export function ConsumerMagicAdd() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const { addToCart, setIsCartOpen } = useCart();

  const handleMagicAdd = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setStatus('Analyzing request...');
    
    try {
      const allProducts = await fetchSAProducts();
      const query = input.toLowerCase();
      
      const qtyMatch = query.match(/(\d+)/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      
      const searchTerm = query
        .replace(/add|to cart|please|get me|i want|find/gi, '')
        .replace(/\d+/g, '')
        .trim();

      const match = allProducts.find(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        p.vendor_name?.toLowerCase().includes(searchTerm)
      );

      if (match) {
        setStatus(`Added ${quantity}x ${match.title}!`);
        for (let i = 0; i < quantity; i++) {
          addToCart({
            id: match.id,
            title: match.title,
            price: match.premium_price,
            imageUrl: match.image_url,
            vendorName: match.vendor_name
          });
        }
        
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        setIsCartOpen(true);
        
        setTimeout(() => {
          setInput('');
          setStatus('');
        }, 3000);
      } else {
        setStatus('Could not find that exact product.');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (error) {
      setStatus('Search failed. Try again?');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.magicContainer}>
      <div className={styles.inputWrapper}>
        <div className={styles.searchIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          type="text" 
          placeholder='Try "Add 2 Ugandan Coffee"...' 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleMagicAdd()}
          className={styles.magicInput}
        />
        <button 
          onClick={handleMagicAdd} 
          disabled={isProcessing || !input.trim()}
          className={styles.magicBtn}
        >
          {isProcessing ? '✨' : 'ADD TO CART'}
        </button>
      </div>
      {status && <div className={styles.status}>{status}</div>}
    </div>
  );
}
