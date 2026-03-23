import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import { fetchSAProducts } from '@/services/marketplaceService';
import styles from './page.module.css';

const FEATURE_CARDS = [
  {
    title: 'THE ART OF ENTERTAINING',
    image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=600&h=800&fit=crop', /* Charcuterie / Cheese board */
    link: '/shop',
    accent: '#1a1a1a'
  },
  {
    title: 'PREMIUM CUTS & AGED MEATS',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=800&fit=crop', /* Juicy Sizzling Steak */
    link: '/shop?category=meat-poultry',
    accent: '#2c3e50'
  },
  {
    title: 'GOURMET PANTRY ESSENTIALS',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=800&fit=crop', /* High-end olive oil & artisan spices */
    link: '/shop?category=pantry',
    accent: '#7d6608'
  },
  {
    title: 'ARTISAN BAKERY & SWEETS',
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&h=800&fit=crop', /* Warm, fresh, buttery croissants */
    link: '/shop?category=bakery',
    accent: '#1a1a1a'
  }
];

const CATEGORIES = [
  { label: 'Fresh Produce', cat: 'fruit-veg', photo: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' },
  { label: 'Butchery', cat: 'meat-poultry', photo: 'https://images.unsplash.com/photo-1603048297172-c9254479895e?w=200&h=200&fit=crop' },
  { label: 'Bakery', cat: 'bakery', photo: 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=200&h=200&fit=crop' },
  { label: 'Dairy & Eggs', cat: 'dairy', photo: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop' },
  { label: 'Pantry', cat: 'pantry', photo: 'https://images.unsplash.com/photo-1587049352847-4d4e12e2c0e8?w=200&h=200&fit=crop' },
  { label: 'Beverages', cat: 'beverages', photo: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop' },
  { label: 'Sweets', cat: 'sweets', photo: 'https://images.unsplash.com/photo-1582293041079-7814c2b12047?w=200&h=200&fit=crop' },
  { label: 'Household', cat: 'household-care', photo: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' }
];

export default async function Home() {
  // Fetch real SA marketplace products
  const allProducts = await fetchSAProducts(1, 400);

  const getRow = (cat: string, max = 4) => allProducts.filter(p => p.category === cat).slice(0, max);

  // Trending & Viral (Market Anatolia, SweetieShop, Candy Bar)
  const viralStores = ['market-anatolia', 'sweetie-shop', 'the-candy-bar', 'sweet-city'];
  const trendingRow = allProducts
    .filter(p => p.supplier_id && viralStores.includes(p.supplier_id))
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // Best Selling Biltong (SA Biltong, Biltong Boytjies)
  const biltongStores = ['sa-biltong', 'biltong-boytjies'];
  const biltongRow = allProducts
    .filter(p => p.supplier_id && biltongStores.includes(p.supplier_id))
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const vegRow    = getRow('fruit-veg');
  const meatRow   = getRow('meat-poultry');
  const dairyRow  = getRow('dairy');
  const sweetsRow = getRow('sweets');
  const pantryRow = getRow('pantry');
  const beverageRow = getRow('beverages');
  const bakeryRow = getRow('bakery');
  const householdRow = getRow('household-care');

  // NEW: Local Merchant Products (Added via Business Portal)
  const localRow = allProducts.filter(p => !p.id.startsWith('shp-')).slice(0, 4);





  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroTextContainer}>
              <h1 className={styles.heroTitle}>THE FUTURE OF FOOD COMMERCE.</h1>
              <p className={styles.heroSubtitle}>QUALITY ESSENTIALS. COMPETITIVE PRICES. DELIVERED TODAY.</p>
              <Link href="/shop" className={styles.heroBtn}>START SHOPPING</Link>
            </div>
            <div className={styles.heroImage}>
              <img src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1600&h=900&fit=crop" alt="Delicious Gourmet Food App" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="container">
        <div className={styles.featureGrid}>
          {FEATURE_CARDS.map((card, i) => (
            <div key={i} className={styles.featureCard}>
              <img src={card.image} alt={card.title} />
              <div className={styles.featureOverlay} style={{ borderTopColor: card.accent }}>
                <h3>{card.title}</h3>
                <Link href={card.link}>SHOP NOW</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marketplace Quality Banner ── */}
      <section className="container">
        <div className={styles.qualityBanner}>
          <div className={styles.qualityImage} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601314167098-ec58eeef0f25?w=1200&h=400&fit=crop')" }} />
          <div className={styles.qualityText}>
            <h2>BUY DIRECT FROM THE SOURCE</h2>
            <p>We connect you with artisan producers and elite vendors who deliver straight to your door. No middlemen, just quality.</p>
            <Link href="/shop" className={styles.qualityLink}>EXPLORE LOCAL VENDORS &rsaquo;</Link>
          </div>
        </div>
      </section>

      {/* ── Modern App Category Scroll ── */}
      <section className="container" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div className={styles.categoryScroll}>
          {CATEGORIES.map(c => (
            <Link 
              key={c.cat} 
              href={`/shop?category=${c.cat}`}
              className={styles.categoryAppCard}
            >
              <div className={styles.categoryIcon}>
                <img src={c.photo} alt={c.label} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
              </div>
              <span className={styles.categoryText}>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {localRow.length > 0 && (
        <section className={`container ${styles.localSection}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0, color: '#c2410c', textAlign: 'left' }}>🇿🇦 NEW FROM LOCAL MERCHANTS</h2>
              <p style={{ margin: '0.25rem 0 0', opacity: 0.8, fontSize: '0.8rem', color: '#9a3412', fontWeight: 600 }}>Supporting local South African businesses</p>
            </div>
            <Link href="/shop" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f97316', textDecoration: 'none', border: '1.5px solid #f97316', padding: '8px 16px', borderRadius: '6px' }}>EXPLORE ALL</Link>
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
                badge={{ type: 'premium', text: 'LOCAL' }}
              />
            ))}
          </div>
        </section>
      )}

      {trendingRow.length > 0 && (
        <section className={`container ${styles.gourmetSection}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', borderBottom: '1px solid #1a1a1a', paddingBottom: '1rem' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0, color: 'black', letterSpacing: '2px', textAlign: 'left', fontSize: '1.5rem' }}>GOURMET SELECTIONS</h2>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>World-class snacks and imported delicacies</p>
            </div>
            <Link href="/shop?category=sweets" style={{ fontSize: '0.75rem', fontWeight: 900, textDecoration: 'none', color: 'white', background: 'black', padding: '0.6rem 1.5rem', borderRadius: '2px', textTransform: 'uppercase' }}>EXPLORE ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {trendingRow.map(p => (
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
                badge={{ type: 'premium', text: 'GOURMET' }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Best Selling Biltong (SA Pride) ── */}
      {biltongRow.length > 0 && (
        <section className="container" style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0, textAlign: 'left' }}>🇿🇦 BEST SELLING BILTONG</h2>
            <Link href="/shop?category=meat-poultry" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {biltongRow.map(p => (
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
                badge={{ type: 'save', text: 'BEST SELLER' }}
              />
            ))}
          </div>
        </section>
      )}


      {/* ── Fruit & Veg ── */}
      {vegRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🥦 FRUIT & VEGETABLES</h2>
            <Link href="/shop?category=fruit-veg" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {vegRow.map(p => (
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
      )}


      {/* ── Beverages & Juice (SA Classics like Coke/RedBull) ── */}
      {beverageRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🥤 BEVERAGES & JUICE</h2>
            <Link href="/shop?category=beverages" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {beverageRow.map(p => (
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
      )}

      {/* ── Household & Care ── */}
      {householdRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🧼 HOUSEHOLD & PERSONAL CARE</h2>
            <Link href="/shop?category=household-care" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {householdRow.map(p => (
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
      )}

      {/* ── Pantry (Mrs Balls, Jungle Oats, etc.) ── */}
      {pantryRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🛒 PANTRY SHOP</h2>
            <Link href="/shop?category=pantry" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {pantryRow.map(p => (
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
      )}

      {/* ── Bakery & Prepared Meals ── */}
      {bakeryRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🧁 BAKERY & PREPARED MEALS</h2>
            <Link href="/shop?category=bakery" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {bakeryRow.map(p => (
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
      )}

      {/* ── Meat & Poultry ── */}
      {meatRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🥩 MEAT & POULTRY</h2>
            <Link href="/shop?category=meat-poultry" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {meatRow.map(p => (
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
      )}

      {/* ── Sweets & Snacks ── */}
      {sweetsRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🍫 SWEETS & SNACKS</h2>
            <Link href="/shop?category=sweets" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {sweetsRow.map(p => (
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
      )}

      {/* ── Promotional Grids ── */}
      <section className={styles.promoSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>MARKETPLACE PROMOTIONS</h2>
          <div className={styles.promoGrid}>
            <div className={`${styles.promoCard} ${styles.promoRed}`}><h3>VENDOR DEALS</h3><p>MAXIMIZE SAVINGS</p></div>
            <div className={`${styles.promoCard} ${styles.promoBlack}`}><h3>LOCAL ARTISANS</h3><p>ELITE PRODUCERS ONLY</p></div>
            <div className={`${styles.promoCard} ${styles.promoPink}`}><h3>START YOUR STORE</h3><p>BUILD WEALTH WITH US</p></div>
            <div className={`${styles.promoCard} ${styles.promoGrey}`}><h3>BULK BUYING</h3><p>WHOLESALE MARGINS</p></div>
          </div>
        </div>
      </section>

      {/* ── Dairy ── */}
      {dairyRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🥛 CHILLED & DAIRY</h2>
            <Link href="/shop?category=dairy" style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}>VIEW ALL</Link>
          </div>
          <div className={styles.productGrid}>
            {dairyRow.map(p => (
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
      )}

      {/* ── Value Footer Banner ── */}
      <section className={styles.valueBanner} style={{ marginTop: '4rem' }}>
        <div className={styles.valueContent}>
          <h2>TURN YOUR PRODUCTS INTO WEALTH</h2>
          <p>Join thousands of South African vendors selling on DailyMarket. You supply, you deliver, we grow together.</p>
          <Link href="/auth/register?role=supplier" className={styles.heroBtn} style={{ marginTop: '2rem', display: 'inline-block', width: 'fit-content' }}>BECOME A SUPPLIER</Link>
        </div>
        <div className={styles.valueImage} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541544061803-12ce17b4ab3e?w=1200&h=800&fit=crop')" }} />
      </section>

    </>
  );
}
