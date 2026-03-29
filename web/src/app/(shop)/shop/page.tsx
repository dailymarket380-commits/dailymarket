import Link from 'next/link';
import styles from './page.module.css';

const CATEGORIES = [
  { name: 'Fruit, Veg & Salad', href: '/fruit-veg' },
  { name: 'Meat, Poultry & Fish', href: '/meat-poultry' },
  { name: 'Bakery & Desserts', href: '/bakery' },
  { name: 'Ready Meals', href: '/ready-meals' },
  { name: 'Dairy, Eggs & Milk', href: '/dairy' },
  { name: 'Pantry', href: '/pantry' },
  { name: 'Beverages & Juice', href: '/beverages' },
  { name: 'Flowers & Plants', href: '/flowers' },
  { name: 'Deli & Entertaining', href: '/deli' },
  { name: 'Toiletries & Health', href: '/toiletries' },
  { name: 'Household', href: '/household' },
  { name: 'Kids', href: '/kids' },
  { name: 'Frozen Foods', href: '/frozen' },
];

export default function ShopPage() {
  return (
    <div className={`container ${styles.shopContainer}`}>
      <h1 className={styles.title}>Shop by Department</h1>
      <div className={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <Link key={cat.name} href={cat.href} className={styles.categoryCard}>
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
