'use client';

import React, { useState } from 'react';
import styles from './SupplierDashboard.module.css';
import { Button } from '../ui/Button';
import { Product } from '@/services/productService';
import { MagicAdd } from './MagicAdd';

interface SupplierInventoryViewProps {
  initialProducts: Product[];
}

export function SupplierInventoryView({ initialProducts }: SupplierInventoryViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleProductGenerated = (newProduct: Product) => {
    // Check if product already exists (by title, since magic add doesn't have real IDs yet)
    if (products.some(p => p.title === newProduct.title)) return;
    setProducts([newProduct, ...products]);
  };

  const activeProductsCount = products.length;
  const totalSales = "R " + (activeProductsCount * 1250).toLocaleString(); 

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Provider Portal</h1>
          <p className={styles.subtitle}>Manage your premium inventory and analytics</p>
        </div>
        <div className={styles.headerActions}>
          <MagicAdd onProductGenerated={handleProductGenerated} />
          <Button variant="primary">Add New Product</Button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Sales</h3>
          <p className={styles.statValue}>{totalSales}</p>
          <span className={styles.trendUp}>+12.5% this week</span>
        </div>
        <div className={styles.statCard}>
          <h3>Active Products</h3>
          <p className={styles.statValue}>{activeProductsCount}</p>
          <span className={styles.trendNeutral}>Up to date</span>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Orders</h3>
          <p className={styles.statValue}>0</p>
          <span className={styles.trendNeutral}>All caught up!</span>
        </div>
      </div>

      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Active Inventory</h2>
          <Button variant="outline" size="sm">Manage Stock</Button>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Stock Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product: Product) => (
                  <tr key={product.id || product.title}>
                    <td>{product.title} <small className={styles.unitText}>({product.unit})</small></td>
                    <td><span className={styles.badgeCategory}>{product.category}</span></td>
                    <td>R {product.base_price.toFixed(2)}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      {product.stock_quantity > 10 ? (
                        <span className={styles.statusBadgeShipped}>In Stock</span>
                      ) : product.stock_quantity > 0 ? (
                        <span className={styles.statusBadgePending}>Low Stock</span>
                      ) : (
                        <span className={styles.statusBadgeProcessing}>Out of Stock</span>
                      )}
                    </td>
                    <td><Button variant="ghost" size="sm">Edit</Button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No products found. Add your first premium product!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
