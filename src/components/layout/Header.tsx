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
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${!isHome ? styles.notHome : ''}`}>
        <div className={styles.topBar}>
          <div className="container">
            <div className={styles.topBarContent}>
              <Link href="/" className={styles.logo}>
                DAILYMARKET
              </Link>

              <div className={styles.searchArea}>
                <ConsumerMagicAdd />
              </div>

              <div className={styles.actions}>
                {!loading && (
                  user ? (
                    <div className={styles.accountMenu}>
                      <span>{user.email?.split('@')[0]}</span>
                      <button onClick={signOut}>Log Out</button>
                    </div>
                  ) : (
                    <Link href="/login" className={styles.authLink}>Sign In</Link>
                  )
                )}

                <div className={styles.cartIcon} onClick={() => setIsCartOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  {mounted && totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className={styles.navigation}>
          <div className="container">
            <div className={styles.navLinks}>
              <Link href="/shop">ALL PRODUCTS</Link>
              <Link href="/shop?category=fruit-veg">PRODUCE</Link>
              <Link href="/shop?category=meat-poultry">BUTCHERY</Link>
              <Link href="/shop?category=pantry">PANTRY</Link>
              <Link href="/shop?category=household-care">HOUSEHOLD</Link>
            </div>
          </div>
        </nav>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
