import { redirect } from 'next/navigation';

// The "sweets" category page is handled under the (shop) route group
// This file ensures /sweets resolves correctly even if accessed directly
export default function SweetsPage() {
  redirect('/shop');
}
