'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Order = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
  user_id: string;
};

export default function EFTOdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    // Fetch EFT orders (status awaiting_verification, verified, rejected)
    // For simplicity, we fetch all orders that have proof of payment URL inside the JSONB, or use the EFT status.
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Filter out non-EFT orders
      const eftOrders = data.filter(o => 
        o.shipping_address?.payment_method === 'EFT' || 
        o.status === 'awaiting_verification'
      );
      setOrders(eftOrders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId: string, action: 'verify' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      if (res.ok) {
        alert(`Order successfully ${action === 'verify' ? 'verified' : 'rejected'}`);
        fetchOrders();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      alert('Network error occurred.');
    }
  };

  return (
    <div style={{ padding: '3rem 2rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>EFT Payment Approvals</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Review direct bank transfer proofs and manage orders.</p>
          </div>
          <Link href="/" style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
            Return to Storefront
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Refreshing orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#475569' }}>No EFT orders found</h2>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {orders.map((order) => {
              const proofUrl = order.shipping_address?.proof_of_payment_url;
              const customerName = order.shipping_address?.payment_name || order.shipping_address?.firstName || 'Unknown';
              const reference = order.shipping_address?.payment_reference || `ORDER-${order.id.slice(0,8).toUpperCase()}`;
              
              const isPending = order.status === 'awaiting_verification' || order.status === 'pending';
              const isVerified = order.status === 'verified';
              const isRejected = order.status === 'rejected';

              return (
                <div key={order.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '2rem', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  
                  {/* Left Side: Proof Image */}
                  <div style={{ width: '200px', flexShrink: 0 }}>
                    {proofUrl ? (
                      <div>
                        {proofUrl.endsWith('.pdf') ? (
                          <a href={proofUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', height: '150px', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px', color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                            View PDF Layout
                          </a>
                        ) : (
                          <a href={proofUrl} target="_blank" rel="noreferrer">
                            <img src={proofUrl} alt="Proof" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'zoom-in' }} />
                          </a>
                        )}
                        <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#64748b', marginTop: '0.5rem' }}>Click to enlarge</p>
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '150px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        No proof uploaded
                      </div>
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                      {isPending && <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>⏳ Awaiting Verification</span>}
                      {isVerified && <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>✅ Verified</span>}
                      {isRejected && <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>❌ Rejected</span>}
                      
                      <span style={{ marginLeft: 'auto', fontWeight: 900, fontSize: '1.25rem' }}>
                        R {order.total_amount.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      <div>
                        <p style={{ color: '#64748b', marginBottom: '0.25rem' }}>Customer Name</p>
                        <p style={{ fontWeight: 600, color: '#0f172a' }}>{customerName}</p>
                      </div>
                      <div>
                        <p style={{ color: '#64748b', marginBottom: '0.25rem' }}>Provided Reference</p>
                        <p style={{ fontWeight: 600, color: '#0f172a' }}>{reference}</p>
                      </div>
                      <div>
                        <p style={{ color: '#64748b', marginBottom: '0.25rem' }}>Date</p>
                        <p style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Right Side: Action Buttons */}
                    {isPending && (
                      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button onClick={() => handleAction(order.id, 'verify')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          Approve Payment
                        </button>
                        <button onClick={() => handleAction(order.id, 'reject')} style={{ background: 'white', color: '#dc2626', border: '1px solid #dc2626', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
