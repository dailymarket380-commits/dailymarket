'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span className={styles.navItemText}>Shop</span>
      </Link>

      <Link href="/shop" className={`${styles.navItem} ${pathname.startsWith('/shop') ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className={styles.navItemText}>Search</span>
      </Link>

      <Link href="/discovery" className={`${styles.navItem} ${pathname.startsWith('/discovery') ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
        <span className={styles.navItemText}>Discovery</span>
      </Link>

      <div className={styles.navItem} onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer', color: 'black' }}>
        <div className={styles.cartWrapper}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
        </div>
        <span className={styles.navItemText}>Cart</span>
      </div>

      <Link href="/dashboard" className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className={styles.navItemText}>Profile</span>
      </Link>
    </nav>
  );
}
