'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { fetchSAProducts } from '@/services/marketplaceService';
import { Button } from '../ui/Button';
import styles from './ConsumerMagicAdd.module.css';

export function ConsumerMagicAdd() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const { addToCart } = useCart();

  const handleMagicAdd = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setStatus('Analyzing request...');
    
    try {
      const allProducts = await fetchSAProducts();
      const query = input.toLowerCase();
      
      // Basic AI matching logic
      // e.g. "Add 5 simba chips"
      const qtyMatch = query.match(/(\d+)/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      
      const searchTerm = query
        .replace(/add|to cart|please|get me|i want/gi, '')
        .replace(/\d+/g, '')
        .trim();

      // Find best match
      const match = allProducts.find(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        p.vendor_name.toLowerCase().includes(searchTerm)
      );

      if (match) {
        setStatus(`Found ${match.title}!`);
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
        
        setTimeout(() => {
          setInput('');
          setStatus('');
        }, 2000);
      } else {
        setStatus('Could not find that exact product.');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (error) {
      setStatus('Magic Add failed. Try again?');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.magicContainer}>
      <div className={styles.inputWrapper}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#888' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          type="text" 
          placeholder='Try "Add 3 Simba Chips"...' 
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
          {isProcessing ? '✨' : 'ADD'}
        </button>
      </div>
      {status && <div className={styles.status}>{status}</div>}
    </div>
  );
}
