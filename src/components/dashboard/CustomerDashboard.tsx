import React from 'react';
import styles from './CustomerDashboard.module.css';
import { Button } from '../ui/Button';

export function CustomerDashboard() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>JD</div>
          <div>
            <h1 className={styles.title}>Welcome back, John!</h1>
            <p className={styles.subtitle}>View your recent orders and manage your account</p>
          </div>
        </div>
        <div className={styles.loyaltyBox}>
          <span className={styles.loyaltyLabel}>Fresh Points</span>
          <span className={styles.loyaltyValue}>1,240</span>
        </div>
      </header>

      <section className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <h2>My Recent Orders</h2>
          <Button variant="outline" size="sm">Order History</Button>
        </div>
        
        <div className={styles.orderList}>
          {/* Order 1 */}
          <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <p className={styles.orderNumber}>Order #5920</p>
                <p className={styles.orderDate}>Placed on March 15, 2026</p>
              </div>
              <span className={styles.statusBadgeProcessing}>Processing</span>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderItems}>
                <div className={styles.itemImage}>🥑</div>
                <div className={styles.itemImage}>🍓</div>
                <div className={styles.itemImageText}>+3 items</div>
              </div>
              <div className={styles.orderTotal}>
                <span>Total</span>
                <strong>R 320.50</strong>
              </div>
            </div>
            <div className={styles.orderActions}>
              <Button variant="outline" fullWidth>Track Delivery</Button>
            </div>
          </div>

          {/* Order 2 */}
          <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <p className={styles.orderNumber}>Order #5811</p>
                <p className={styles.orderDate}>Placed on March 02, 2026</p>
              </div>
              <span className={styles.statusBadgeDelivered}>Delivered</span>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderItems}>
                <div className={styles.itemImage}>🥩</div>
                <div className={styles.itemImage}>🥗</div>
              </div>
              <div className={styles.orderTotal}>
                <span>Total</span>
                <strong>R 450.00</strong>
              </div>
            </div>
            <div className={styles.orderActions}>
              <Button variant="secondary" fullWidth>Re-order</Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.recommendedSection}>
        <h2>Recommended For You</h2>
        <div className={styles.emptyState}>
          <p>We're building a personalized selection for you based on your previous shopping.</p>
        </div>
      </section>
    </div>
  );
}
