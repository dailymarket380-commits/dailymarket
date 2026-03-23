import { SHOPIFY_STORES, fetchSAProducts } from './src/services/marketplaceService';

async function verify() {
  console.log('--- Testing Individual Stores ---');
  for (const store of SHOPIFY_STORES) {
    try {
      console.log(`Checking ${store.name} (${store.url})...`);
      const start = Date.now();
      const res = await fetch(store.url, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000)
      });
      console.log(`  Status: ${res.status} (${Date.now() - start}ms)`);
    } catch (err: any) {
      console.log(`  FAILED: ${err.message}`);
    }
  }

  console.log('\n--- Testing Aggregate Fetch ---');
  const products = await fetchSAProducts();
  console.log(`Total Products: ${products.length}`);
  
  const categories = [...new Set(products.map(p => p.category))];
  console.log('Categories:', categories);
}

verify();
