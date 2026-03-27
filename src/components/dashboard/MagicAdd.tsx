'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { aiService } from '@/services/aiService';
import { Product } from '@/services/productService';
import styles from './MagicAdd.module.css';

interface MagicAddProps {
  onProductGenerated: (product: Product) => void;
}

export function MagicAdd({ onProductGenerated }: MagicAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMagicAdd = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const draftedProduct = await aiService.parseMagicProduct(input);
      onProductGenerated(draftedProduct as Product);
      setInput('');
      setIsOpen(false);
    } catch (error) {
      console.error('Magic Add failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className={styles.magicToggle}
      >
        <span className={styles.sparkle}>✨</span> Magic Add (AI)
      </Button>

      {isOpen && (
        <div className={styles.magicPanel}>
          <div className={styles.panelHeader}>
            <h4>AI Product Assistant</h4>
            <p>Describe your inventory in plain text</p>
          </div>
          <textarea
            className={styles.magicInput}
            placeholder='e.g., "Just received 20kg of Premium Wagyu Ribeye at R450 per kg"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
          />
          <div className={styles.panelFooter}>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleMagicAdd}
              disabled={isProcessing || !input.trim()}
            >
              {isProcessing ? 'Generating...' : 'Generate Product'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
