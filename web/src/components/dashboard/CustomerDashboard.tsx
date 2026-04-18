'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './CustomerDashboard.module.css';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        if (ordersData && ordersData.length > 0) {
          // Process basic info without images to avoid schema relation errors
          const mappedOrders = ordersData.map(o => ({
            id: o.id,
            total_amount: o.total_amount,
            status: o.status,
            created_at: o.created_at,
            order_items: [] // Placeholder
          }));
          setOrders(mappedOrders);
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return <div style={{padding: 40, textAlign: 'center'}}>Please sign in to view your dashboard.</div>;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user.email?.[0].toUpperCase()}</div>
          <div>
            <h1 className={styles.title}>Welcome back, {user.email?.split('@')[0]}!</h1>
            <p className={styles.subtitle}>View your recent orders and manage your account</p>
          </div>
        </div>
        <div className={styles.loyaltyBox}>
          <span className={styles.loyaltyLabel}>Fresh Points</span>
          <span className={styles.loyaltyValue}>{(orders.length * 150).toLocaleString()}</span>
        </div>
      </header>

      <section className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <h2>My Recent Orders</h2>
        </div>
        
        {loading ? (
          <p>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't placed any orders yet.</p>
            <Link href="/shop"><Button variant="outline" style={{marginTop: 15}}>Start Shopping</Button></Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((order) => {
              const orderRef = order.id.substring(0, 8).toUpperCase();
              
              const isDelivered = order.status === 'delivered';
              const isProcessing = order.status === 'pending' || order.status === 'processing';
              const badgeClass = isDelivered ? styles.statusBadgeDelivered : 
                                 isProcessing ? styles.statusBadgeProcessing : styles.statusBadgeProcessing;

              return (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <p className={styles.orderNumber}>Order #{orderRef}</p>
                      <p className={styles.orderDate}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={badgeClass} style={{textTransform: 'capitalize'}}>{order.status}</span>
                  </div>
                  <div className={styles.orderDetails}>
                    <div className={styles.orderItems} style={{display: 'flex', gap: 5, alignItems: 'center'}}>
                      <div className={styles.itemImageText}>📦 Grocery Items</div>
                    </div>
                    <div className={styles.orderTotal}>
                      <span>Total</span>
                      <strong>R {order.total_amount.toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className={styles.orderActions}>
                    {!isDelivered ? (
                      <Link href={`/track?orderId=${orderRef}`} style={{width: '100%'}}>
                        <Button variant="outline" fullWidth>Track Delivery</Button>
                      </Link>
                    ) : (
                      <Button variant="secondary" fullWidth>Re-order</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
