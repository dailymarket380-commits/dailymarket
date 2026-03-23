import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { fetchSAProducts } from '@/services/marketplaceService';
import styles from './listing.module.css';

interface DepartmentListingProps {
  title: string;
  category: string;
}

const SIDEBAR_CATEGORIES = [
  { label: 'FRUIT, VEG & SALAD', cat: 'fruit-veg' },
  { label: 'MEAT, POULTRY & FISH', cat: 'meat-poultry' },
  { label: 'BAKERY & DESSERTS', cat: 'bakery' },
  { label: 'DAIRY, EGGS & MILK', cat: 'dairy' },
  { label: 'PANTRY & DRY GOODS', cat: 'pantry' },
  { label: 'BEVERAGES & JUICE', cat: 'beverages' },
  { label: 'SWEETS & SNACKS', cat: 'sweets' },
  { label: 'HOUSEHOLD & CARE', cat: 'household-care' },
  { label: 'FROZEN FOODS', cat: 'frozen' }
];

export default async function DepartmentListing({ title, category }: DepartmentListingProps) {
  let products: any[] = [];
  try {
    const allProducts = await fetchSAProducts(1, 200);
    products = allProducts.filter(p => p.category === category)
      .sort((a, b) => a.premium_price - b.premium_price); // Sort by value by default
  } catch (err) {
    console.error(`[DepartmentListing] Error loading ${category}:`, err);
  }

  return (
    <div className={`container ${styles.listingLayout}`}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.filterSection}>
          <div className={styles.filterHeader}>
            <span className={styles.toggleLabel}>ON PROMOTION</span>
            <div className={styles.toggleSwitch} />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>
            DEPARTMENTS <span className={styles.minusIcon}>−</span>
          </h3>
          <div className={styles.filterList}>
            {SIDEBAR_CATEGORIES.map((item) => (
              <Link 
                key={item.cat} 
                href={`/${item.cat}`}
                className={category === item.cat ? styles.activeLink : ''}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>
            LIFESTYLE <span className={styles.minusIcon}>−</span>
          </h3>
          <div className={styles.filterList}>
             <label className={styles.checkboxLabel}>
                <input type="checkbox" /> Halal
             </label>
             <label className={styles.checkboxLabel}>
                <input type="checkbox" /> Vegan
             </label>
             <label className={styles.checkboxLabel}>
                <input type="checkbox" /> Gluten Free
             </label>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={styles.mainContent}>
        <div className={styles.headerTools}>
          <div>
            <h1 className={styles.pageTitle}>{title}</h1>
            <p className={styles.itemCount}>{products.length} Items Found</p>
          </div>
          <div className={styles.toolbar}>
             <div className={styles.viewToggles}>
                <span className={`${styles.viewBtn} ${styles.activeView}`}>▦</span>
                <span className={styles.viewBtn}>≡</span>
             </div>
             <select className={styles.sortSelect}>
                <option>SORT BY: RELEVANCE</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>PRICE: HIGH TO LOW</option>
             </select>
          </div>
        </div>

        {products.length > 0 ? (
          <div className={styles.gridContainer}>
            {products.map(p => (
              <ProductCard 
                key={p.id} 
                id={p.id} 
                title={p.title} 
                price={p.premium_price} 
                imageUrl={p.image_url} 
                unit={p.unit} 
                rating={p.rating} 
                reviewCount={p.reviewCount} 
                vendorName={p.vendor_name}
                badge={p.premium_price < 150 ? { type: 'save', text: 'VALUE CHOICE' } : undefined}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} style={{ padding: '4rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--secondary-text)', fontSize: '1.25rem' }}>
                We're currently sourcing the finest premium {title.toLowerCase()} for you.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <Link href="/" style={{ color: 'var(--primary-text)', fontWeight: '700', textDecoration: 'underline' }}>
                  BACK TO HOME
                </Link>
              </div>
          </div>
        )}
      </main>
    </div>
  );
}
