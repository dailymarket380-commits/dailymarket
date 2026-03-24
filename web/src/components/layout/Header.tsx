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

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className={`${styles.header} ${isHomePage ? styles.homeHeader : ''}`}>
      {/* Top Header */}
      <div className={styles.topHeader}>
        <div className="container">
          <div className={styles.topHeaderContent}>
            <Link href="/" className={styles.logo}>
              DAILYMARKET
            </Link>

            <div className={styles.headerActions}>
              {/* Magic Add - Added for the "New Add Features" request */}
              <div className={styles.magicSearchWrapper}>
                <ConsumerMagicAdd />
              </div>

              {/* Auth State */}
              {!loading && (
                user ? (
                  <div className={styles.userMenu}>
                    <span className={styles.userGreeting}>
                      👋 {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <button className={styles.signOutBtn} onClick={signOut}>
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className={styles.actionBtn}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Sign In / Register
                  </Link>
                )
              )}

              <Link href="/delivery" className={styles.actionBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Delivery Address
              </Link>

              <div className={styles.cartBtn} onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f97316', color: 'white', fontSize: '10px', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {totalItems}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={styles.bottomHeader}>
        <div className={`container ${styles.navContainer}`}>
          <div className={styles.navLinks}>
            <Link href="/shop">SHOP BY DEPARTMENT <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></Link>
            <Link href="/discovery">DISCOVERY</Link>
            <Link href="/shop?category=sweets">GOURMET SELECTIONS</Link>
            <Link href="/shop?category=meat-poultry">THE BUTCHERY</Link>
            <Link href="/shop?category=pantry">ARTISAN PANTRY</Link>
            <Link href="/re-order">BUY AGAIN</Link>
          </div>

          <div className={styles.searchBar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search products..." />
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
