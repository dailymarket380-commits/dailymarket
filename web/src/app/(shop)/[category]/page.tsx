import DepartmentListing from '@/components/ui/DepartmentListing';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const validCategories = ['snacks', 'candy', 'chips', 'biscuits', 'chocolates', 'sweets', 'drinks', 'groceries', 'fruit-veg', 'meat-poultry', 'bakery', 'ready-meals', 'dairy', 'pantry', 'beverages', 'flowers', 'frozen', 'deli', 'toiletries', 'household', 'kids'];

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  if (!validCategories.includes(resolvedParams.category)) {
    return notFound();
  }

  // Basic title case for the heading
  const title = resolvedParams.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return <DepartmentListing title={title} category={resolvedParams.category} />;
}
