export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import { fetchSAProducts } from '@/services/marketplaceService';
import styles from './page.module.css';

const FEATURE_CARDS = [
  {
    title: 'FARM FRESH PRODUCE',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1200&q=80',
    link: '/shop?category=fruit-veg'
  },
  {
    title: 'THE BUTCHERY',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&q=80',
    link: '/shop?category=meat-poultry'
  },
  {
    title: 'ARTISAN PANTRY',
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=1200&q=80',
    link: '/shop?category=pantry'
  },
  {
    title: 'BAKERY & MEALS',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80',
    link: '/shop?category=bakery'
  }
];

const CATEGORIES = [
  { label: 'Produce', cat: 'fruit-veg', photo: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' },
  { label: 'Butchery', cat: 'meat-poultry', photo: 'https://images.unsplash.com/photo-1603048297172-c9254479895e?w=200&h=200&fit=crop' },
  { label: 'Bakery', cat: 'bakery', photo: 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=200&h=200&fit=crop' },
  { label: 'Dairy', cat: 'dairy', photo: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop' },
  { label: 'Pantry', cat: 'pantry', photo: 'https://images.unsplash.com/photo-1587049352847-4d4e12e2c0e8?w=200&h=200&fit=crop' },
  { label: 'Beverages', cat: 'beverages', photo: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop' },
  { label: 'Sweets', cat: 'sweets', photo: 'https://images.unsplash.com/photo-1582293041079-7814c2b12047?w=200&h=200&fit=crop' },
  { label: 'Household', cat: 'household-care', photo: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' }
];

export default async function Home() {
  let allProducts: any[] = [];
  try {
    allProducts = await fetchSAProducts(1, 400);
  } catch (err) {
    console.error('[LandingPage] Failed to fetch products:', err);
  }

  const getRow = (cat: string, max = 4) => allProducts.filter(p => p.category === cat).slice(0, max);
  const localRow = allProducts.slice(0, 8);

  return (
    <div className={styles.pageContainer}>
      
      {/* ── High-Contrast Hero Section ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=90" 
          alt="DailyMarket Hero" 
          className={styles.heroBg}
        />
        
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>PREMIUM MARKETPLACE DELIVERY</span>
            <h1 className={styles.heroTitle}>DAILYMARKET</h1>
            <p className={styles.heroSubtitle}>
              Authentic farm produce, artisan meats, and daily essentials from local merchants—delivered with precision.
            </p>
            
            <div className={styles.heroActionRow}>
              <Link href="/shop" className={styles.primaryBtn}>SHOP NOW</Link>
              <Link href="/register?role=supplier" className={styles.secondaryBtn}>BECOME A SELLER</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Quick Links ── */}
      <div className={styles.categoryRowWrap}>
        <div className="container">
          <div className={styles.categoryRow}>
            {CATEGORIES.map(c => (
              <Link key={c.cat} href={`/shop?category=${c.cat}`} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                   {/* Using grayscale images and simple UI */}
                  <img src={c.photo} alt={c.label} style={{ filter: 'grayscale(100%)' }} />
                </div>
                <span>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Latest Products ── */}
      <section className="container" style={{ padding: '100px 0' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>FRESH SELECTIONS</h2>
          <Link href="/shop" className={styles.viewMoreLink}>EXPLORE ALL PRODUCTS &rarr;</Link>
        </div>
        
        <div className={styles.productGrid}>
          {localRow.map(p => (
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
            />
          ))}
        </div>
      </section>

      {/* ── Feature Masonry (Monochrome) ── */}
      <section className={styles.featureGridSection}>
        <div className="container">
          <div className={styles.featureGrid}>
            {FEATURE_CARDS.map((card, i) => (
              <Link key={i} href={card.link} className={styles.featureCard}>
                <img src={card.image} alt={card.title} style={{ filter: 'grayscale(100%)' }} />
                <div className={styles.featureOverlay}>
                   <h3>{card.title}</h3>
                   <span className={styles.featureLink}>EXPLORE CATEGORY &rsaquo;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Merchant Acquisition Banner ── */}
      <section className="container">
        <div className={styles.merchantBanner}>
           <div className={styles.merchantText}>
             <h2>SELL ON DAILYMARKET</h2>
             <p>Scale your local business with our enterprise delivery infrastructure.</p>
             <Link href="/register?role=supplier" className={styles.primaryBtn}>OPEN YOUR STORE</Link>
           </div>
        </div>
      </section>

    </div>
  );
}
