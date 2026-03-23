import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import { fetchSAProducts } from '@/services/marketplaceService';
import styles from './page.module.css';

const FEATURE_CARDS = [
  {
    title: 'THE ART OF ENTERTAINING',
    image: 'https://images.unsplash.com/photo-1547573854-74d2a71d0827?w=600&h=800&fit=crop',
    link: '/shop',
    accent: '#1a1a1a'
  },
  {
    title: 'PREMIUM CUTS & AGED MEATS',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=800&fit=crop',
    link: '/shop?category=meat-poultry',
    accent: '#2c3e50'
  },
  {
    title: 'GOURMET PANTRY ESSENTIALS',
    image: 'https://images.unsplash.com/photo-1511130523224-699fd19cad80?w=600&h=800&fit=crop',
    link: '/shop?category=pantry',
    accent: '#7d6608'
  },
  {
    title: 'ARTISAN BAKERY & SWEETS',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=800&fit=crop',
    link: '/shop?category=bakery',
    accent: '#1a1a1a'
  }
];

const CATEGORIES = [
  { label: 'FRUIT, VEG & SALAD', cat: 'fruit-veg' },
  { label: 'MEAT, POULTRY & FISH', cat: 'meat-poultry' },
  { label: 'BAKERY & DESSERTS', cat: 'bakery' },
  { label: 'DAIRY, EGGS & MILK', cat: 'dairy' },
  { label: 'PANTRY & DRY GOODS', cat: 'pantry' },
  { label: 'BEVERAGES & JUICE', cat: 'beverages' },
  { label: 'SWEETS & SNACKS', cat: 'sweets' },
  { label: 'HOUSEHOLD & CARE', cat: 'household-care' }
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
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=900&fit=crop" alt="Fresh Marketplace Delivery" />
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
          <div className={styles.qualityImage} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488459711635-078593971c27?w=1200&h=400&fit=crop')" }} />
          <div className={styles.qualityText}>
            <h2>BUY DIRECT FROM THE SOURCE</h2>
            <p>We connect you with artisan producers and elite vendors who deliver straight to your door. No middlemen, just quality.</p>
            <Link href="/shop" className={styles.qualityLink}>EXPLORE LOCAL VENDORS &rsaquo;</Link>
          </div>
        </div>
      </section>

      {/* ── Category Chips ── */}
      <section className="container" style={{ marginTop: '2.5rem', marginBottom: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '10px' }}>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {CATEGORIES.map(c => (
            <Link 
              key={c.cat} 
              href={`/shop?category=${c.cat}`}
              className={styles.categoryChip}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Local Merchants Section ── */}
      {localRow.length > 0 && (
        <section className="container" style={{ marginTop: '4rem', padding: '2rem', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0, color: '#c2410c', textAlign: 'left' }}>🇿🇦 NEW FROM LOCAL MERCHANTS</h2>
              <p style={{ margin: '0.25rem 0 0', opacity: 0.8, fontSize: '0.8rem', color: '#9a3412', fontWeight: 600 }}>Supporting local South African businesses</p>
            </div>
            <Link href="/shop" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f97316', textDecoration: 'none', border: '1.5px solid #f97316', padding: '8px 16px', borderRadius: '6px' }}>EXPLORE ALL</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
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

      {/* ── Gourmet Selection (Market Anatolia, etc.) ── */}
      {trendingRow.length > 0 && (
        <section className="container" style={{ marginTop: '3rem', padding: '3rem', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', borderBottom: '1px solid #1a1a1a', paddingBottom: '1rem' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0, color: 'black', letterSpacing: '2px', textAlign: 'left', fontSize: '1.5rem' }}>GOURMET SELECTIONS</h2>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>World-class snacks and imported delicacies</p>
            </div>
            <Link href="/shop?category=sweets" style={{ fontSize: '0.75rem', fontWeight: 900, textDecoration: 'none', color: 'white', background: 'black', padding: '0.6rem 1.5rem', borderRadius: '2px', textTransform: 'uppercase' }}>EXPLORE ALL</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
        <div className={styles.valueImage} />
      </section>

    </>
  );
}
