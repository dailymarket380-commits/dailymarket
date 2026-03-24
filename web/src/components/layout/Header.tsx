'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from '../cart/CartDrawer';
import styles from './Header.module.css';

import { ConsumerMagicAdd } from './ConsumerMagicAdd';

export default function Header() {
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, loading, signOut } = useAuth();
  
  return (
    <header className={styles.header}>
      <div className={styles.topHeader}>
        <div className="container">
          <div className={styles.topHeaderContent}>
            <Link href="/" className={styles.logo}>
              DAILYMARKET
            </Link>

            <div className={styles.headerActions}>
              {!loading && (
                user ? (
                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>👋 {user.email?.split('@')[0]}</span>
                      <button onClick={signOut} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}>Sign Out</button>
                   </div>
                ) : (
                  <Link href="/login" className={styles.actionBtn}>Sign In</Link>
                )
              )}

              <div onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer', position: 'relative' }}>
                🛒 {totalItems > 0 && <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'orange', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', color: 'white' }}>{totalItems}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
