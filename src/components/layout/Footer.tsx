import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>

      {/* ── B.L.A.S.T Trust Bar (Believe + Satisfy) ── */}
      <div className={styles.trustBar}>
        <div className="container">
          <div className={styles.trustGrid}>
            {[
              { icon: '🚚', title: 'Same-Day Delivery', desc: 'Order before 2 PM' },
              { icon: '🔒', title: '100% Secure Payments', desc: 'PayFast & PCI DSS Certified' },
              { icon: '↩️', title: 'Easy Returns', desc: 'Not happy? Full refund in 24h' },
              { icon: '🌿', title: 'Fresh Guarantee', desc: 'Farm-to-door freshness promise' },
              { icon: '💬', title: '24/7 Support', desc: 'WhatsApp & email always open' },
            ].map((item) => (
              <div key={item.title} className={styles.trustItem}>
                <span className={styles.trustIcon}>{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3>Shop</h3>
            <ul>
              <li><Link href="/fruit-veg">Fruit, Veg &amp; Salad</Link></li>
              <li><Link href="/meat-poultry">Meat, Poultry &amp; Fish</Link></li>
              <li><Link href="/bakery">Bakery &amp; Desserts</Link></li>
              <li><Link href="/sweets">Sweets &amp; Snacks</Link></li>
              <li><Link href="/frozen">Frozen Foods</Link></li>
              <li><Link href="/pantry">Pantry Essentials</Link></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3>Customer Care</h3>
            <ul>
              <li><Link href="/support">💬 Help Centre &amp; FAQ</Link></li>
              <li><Link href="/support">↩️ Returns Policy</Link></li>
              <li><Link href="/support">🚚 Delivery Info</Link></li>
              <li><Link href="/support">📞 Contact Us</Link></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3>About DailyMarket</h3>
            <ul>
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/sustainability">Sustainability</Link></li>
              <li><Link href="/suppliers">Our Suppliers</Link></li>
              <li><Link href="/login">My Account</Link></li>
              <li><a href={process.env.NEXT_PUBLIC_BUSINESS_PORTAL_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, color: '#10b981' }}>🚀 Merchant Portal</a></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3>Join Our Newsletter</h3>
            <p>Get early access to deals, seasonal picks, and new vendor launches.</p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
            <div className={styles.socialRow}>
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="WhatsApp">💬</a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} DailyMarket. All rights reserved. 🇿🇦</p>
          <div className={styles.legal}>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/support">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
