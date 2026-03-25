import DepartmentListing from '@/components/ui/DepartmentListing';

export const dynamic = 'force-dynamic';

export default function FrozenPage() {
  return <DepartmentListing title="Frozen Foods" category="frozen" />;
}
