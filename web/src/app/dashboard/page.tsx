import { redirect } from 'next/navigation';
import { SupplierDashboard } from '@/components/dashboard/SupplierDashboard';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const rawRole = params.role;
  const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;

  // If no role is provided or it's invalid, we could default to customer 
  // or redirect to home. For now, let's treat unknown roles as customer.
  const isSupplier = role === 'provider' || role === 'supplier';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {isSupplier ? <SupplierDashboard /> : <CustomerDashboard />}
    </div>
  );
}
