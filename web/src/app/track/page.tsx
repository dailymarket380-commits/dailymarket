'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './track.module.css';

const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => <div style={{height: '100vh', width: '100vw', background: '#f1f5f9', display: 'grid', placeItems: 'center', color: '#64748b'}}>Loading live tracker...</div>
});

// Extracted to avoid complex escaped string in JSX
const CHAT_BG = '#E5DDD5';

function sendReply(setMessages: React.Dispatch<React.SetStateAction<{id: number; from: string; text: string; time: string}[]>>, chatEndRef: React.RefObject<HTMLDivElement | null>, time: string) {
  setTimeout(() => {
    setMessages(prev => [...prev, { id: Date.now() + 1, from: 'driver', text: 'Got it! See you shortly 👍', time }]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, 2000);
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [dbError, setDbError] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [etaMins, setEtaMins] = useState(15);
  const [progressPct, setProgressPct] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return [
      { id: 1, from: 'driver', text: 'Hi! I have picked up your order and I am on my way 🚗', time: timeStr },
      { id: 2, from: 'driver', text: 'I will be there in about 15 minutes', time: timeStr },
    ];
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hide global header/footer/bottom-nav on this full-screen page
  useEffect(() => {
    document.body.classList.add('page-track');
    return () => document.body.classList.remove('page-track');
  }, []);

  const currentStep = progressPct > 0.95 ? 4 : progressPct > 0.15 ? 3 : progressPct > 0.05 ? 2 : 1;

  const [customerLocation, setCustomerLocation] = useState<[number, number] | undefined>(undefined);

  useEffect(() => {
    if (orderId) {
      handleSearchInternal(orderId);
    }
  }, []);

  const handleSearchInternal = async (id: string) => {
    setIsLoading(true);
    
    // Fetch real location from database
    try {
      let cleanId = id.replace(/^(dm-|DM-)/i, '').trim();

      // If it's a short 8-character ID, look up the full UUID in seller_orders
      if (cleanId.length < 32) {
        const { data: refData } = await supabase
          .from('seller_orders')
          .select('order_id')
          .eq('order_ref', cleanId.toUpperCase())
          .single();
        if (refData?.order_id) {
          cleanId = refData.order_id;
        }
      }

      const { data } = await supabase
        .from('orders')
        .select('shipping_address')
        .eq('id', cleanId)
        .single();
        
      if (data?.shipping_address?.lat && data?.shipping_address?.lng) {
        setCustomerLocation([data.shipping_address.lat, data.shipping_address.lng]);
      } else {
        setDbError("DB Data Null");
      }
    } catch(err: any) {
      console.warn("Could not find real coordinates for tracking, using fallback.");
      setDbError(err?.message || "Unknown error occurred");
    }

    setTimeout(() => { setIsLoading(false); setIsSearched(true); }, 800);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    handleSearchInternal(orderId.trim());
  };

  const getHeadingText = () => {
    if (currentStep === 1) return 'Order confirmed';
    if (currentStep === 2) return 'Preparing order';
    if (currentStep === 3) return 'On the way';
    return 'Arriving now';
  };

  const getETAText = () => progressPct >= 0.98 ? 'Arrived' : `${etaMins} min`;

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text: chatInput.trim(), time }]);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    sendReply(setMessages, chatEndRef, time);
  };

  return (
    <div className={styles.container}>

      {/* Background Map */}
      <div className={styles.mapBackground}>
        <LiveMap
          isActive={isSearched}
          customerLocation={customerLocation}
          onProgress={({ pct, mins }) => { setProgressPct(pct); setEtaMins(mins); }}
        />
      </div>

      {/* Floating back button */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backBtn}>←</Link>
      </div>

      {/* Search or Tracking UI */}
      {!isSearched ? (
        <div className={styles.searchOverlay}>
          <div className={styles.searchCard}>
            <h1>Track Order</h1>
            <p>Enter your order ID to locate your delivery live.</p>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="e.g. DM-92302"
                className={styles.searchInput}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn} disabled={isLoading}>
                {isLoading ? 'Locating...' : 'Track'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* ── Tracking Bottom Sheet — fixed, independent of map DOM ── */}
      {isSearched && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 9999,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.14)',
          padding: '8px 20px 36px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {/* Drag pill — tap to minimise */}
          <div
            onClick={() => setIsMinimized(v => !v)}
            style={{ width: '100%', padding: '8px 0 14px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2, margin: '0 auto' }} />
          </div>

          {/* ETA row — always visible */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMinimized ? 0 : 16 }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                {getHeadingText()}
              </div>
              {!isMinimized && <div style={{ fontSize: '0.88rem', color: '#666', marginTop: 4 }}>
                Latest arrival by {new Date(Date.now() + etaMins * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>}
            </div>
            <div style={{ background: '#ecfdf5', color: '#05a357', padding: '8px 12px', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {getETAText()}
            </div>
          </div>

          {/* Collapsible content */}
          {!isMinimized && (
            <>
              {/* Progress segments */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {[1,2,3,4].map(s => (
                  <div key={s} style={{ flex: 1, height: 5, borderRadius: 3, background: currentStep >= s ? '#05a357' : '#f1f5f9' }} />
                ))}
              </div>

              {/* Driver card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px solid #f1f5f9', borderRadius: 16, marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&w=256&h=256&q=80) center/cover' }} />
                  <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>⭐ 4.9</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>Your Driver</div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>DailyMarket Fleet</div>
                  <div style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155', marginTop: 4, display: 'inline-block' }}>Awaiting Details</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={() => setShowContact(true)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '13px', borderRadius: 12, fontWeight: 700, color: '#111', fontSize: '0.92rem', cursor: 'pointer' }}
                >
                  💬 Chat
                </button>
                <button
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '13px', borderRadius: 12, fontWeight: 700, color: '#111', fontSize: '0.92rem', cursor: 'pointer' }}
                >
                  Order Details
                </button>
              </div>
            </>
          )}
        </div>
      )}


      {/* ── WhatsApp-style Chat ── */}
      {showContact && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999,
          display: 'flex', flexDirection: 'column',
          height: '100%',
          animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
        }}>

          {/* Header */}
          <div style={{ background: '#075E54', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0 }}>
            <button onClick={() => setShowContact(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', padding: '4px 8px 4px 0', lineHeight: 1 }}>
              ←
            </button>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&w=256&h=256&q=80) center/cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>Your Driver</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Online · DailyMarket Fleet</div>
            </div>
            <a href="tel:+27600000000" style={{ color: '#fff', fontSize: '1.2rem', padding: 8 }}>📞</a>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: CHAT_BG }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 12, fontSize: '0.72rem', color: '#555', fontWeight: 600 }}>TODAY</span>
            </div>

            {messages.map((msg) => {
              const isMine = msg.from === 'me';
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                  <div style={{
                    maxWidth: '78%', padding: '8px 12px 6px',
                    background: isMine ? '#DCF8C6' : '#ffffff',
                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: '#111', lineHeight: 1.45 }}>{msg.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: '0.65rem', color: '#8696a0' }}>{msg.time}</span>
                      {isMine && <span style={{ fontSize: '0.7rem', color: '#53bdeb' }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div style={{
            background: '#f0f0f0',
            padding: '8px 12px',
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
            minHeight: 64,
          }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 24, padding: '10px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Message Michael..."
                style={{ border: 'none', outline: 'none', fontSize: '0.95rem', width: '100%', background: 'transparent', fontFamily: 'inherit' }}
              />
            </div>
            <button
              disabled={!chatInput.trim()}
              onClick={handleSend}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: chatInput.trim() ? '#075E54' : '#b0bec5',
                color: '#fff', fontSize: '1.1rem',
                cursor: chatInput.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.2s'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{height: '100vh', width: '100vw'}} />}>
      <TrackOrderContent />
    </Suspense>
  );
}
