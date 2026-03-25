import React from 'react';
import styles from './SupplierDashboard.module.css';
import { productService } from '@/services/productService';
import { SupplierInventoryView } from './SupplierInventoryView';

export async function SupplierDashboard() {
  // Fetch initial products from the service (with fallback)
  const initialProducts = await productService.getAllProducts();

  return (
    <div className={styles.dashboard}>
      <SupplierInventoryView initialProducts={initialProducts} />
    </div>
  );
}
