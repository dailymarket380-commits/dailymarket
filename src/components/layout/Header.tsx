'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from '../cart/CartDrawer';
import styles from './Header.module.css';

import { ConsumerMagicAdd } from './ConsumerMagicAdd';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);
  const isHome = pathname === '/';

  return (
    <header className={`${styles.header} ${isHome ? styles.homeHeader : ''}`}>
      <div className={styles.topHeader}>
        <div className="container">
          <div className={styles.topHeaderContent}>
            <Link href="/" className={styles.logo}>
              DAILYMARKET
            </Link>

            <div className={styles.headerActions}>
              {!loading && (
                user ? (
                  <div className={styles.userMenu}>
                    <span className={styles.userGreeting}>👋 {user.email?.split('@')[0]}</span>
                    <button onClick={signOut} className={styles.signOutBtn}>Log Out</button>
                  </div>
                ) : (
                  <Link href="/login" className={styles.actionBtn}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Sign In</span>
                  </Link>
                )
              )}

              <div className={styles.cartBtn} onClick={() => setIsCartOpen(true)}>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                 {mounted && totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className={styles.bottomHeader}>
        <div className={`container ${styles.navContainer}`}>
          <div className={styles.navLinks}>
            <Link href="/shop">SHOP</Link>
            <Link href="/bakery">BAKERY</Link>
            <Link href="/meat-poultry">BUTCHERY</Link>
            <Link href="/discovery">OFFERS</Link>
          </div>

          <div className={styles.magicSearchRow}>
            <ConsumerMagicAdd />
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
