'use client';

import React, { useEffect, useState } from 'react';
import { fetchSAProducts, MarketplaceProduct } from '@/services/marketplaceService';
import { ProductCard } from '@/components/ui/ProductCard';
import { ConsumerMagicAdd } from '@/components/layout/ConsumerMagicAdd';
import styles from './page.module.css';

export default function DiscoveryPage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('viral');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await fetchSAProducts();
      // Discovery logic: mix of new shops and viral tags
      const discoveryFeed = all.sort(() => 0.5 - Math.random());
      setProducts(discoveryFeed);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter((p: MarketplaceProduct) => {
    if (activeTab === 'new') return !p.id.startsWith('shp-'); // Local merchants
    if (activeTab === 'viral') return ['sweetie-shop', 'market-anatolia', 'peachz', 'gadget-shop'].includes(p.supplier_id);
    return true;
  });

  return (
    <div className={styles.discoveryContainer}>
      <header className={styles.discoveryHeader}>
        <h1 className={styles.title}>Discovery</h1>
        <p className={styles.subtitle}>Curated products trending in South Africa</p>
        
        <div className={styles.magicSearchMobile}>
          <ConsumerMagicAdd />
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'viral' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('viral')}
          >
            Viral
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'new' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('new')}
          >
            Local First
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Explore
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Discovering new arrivals...</p>
        </div>
      ) : (
        <div className={styles.feedGrid}>
          {filteredProducts.map((product: MarketplaceProduct) => (
            <div key={product.id} className={styles.productWrapper}>
              <ProductCard
                id={product.id}
                title={product.title}
                price={product.premium_price}
                imageUrl={product.image_url}
                unit={product.unit}
                rating={product.rating}
                reviewCount={product.reviewCount}
                vendorName={product.vendor_name}
                badge={product.supplier_id === 'sweetie-shop' ? { type: 'save', text: 'VIRAL' } : undefined}
              />
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.bottomSpacer} />
    </div>
  );
}
