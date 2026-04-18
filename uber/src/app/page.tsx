'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

const DispatchMap = dynamic(() => import('@/components/DispatchMap'), { ssr: false });

// ── Geocode an address string via Nominatim (free, no API key) ─────────────
async function geocodeAddress(query: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=za`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

// ── Get driver's real GPS position ─────────────────────────────────────────
function getDriverGPS(): Promise<[number, number] | null> {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve([pos.coords.latitude, pos.coords.longitude]),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  });
}

// ── Background Driver Tracking Task ─────────────────────────────────────────
function useDriverLiveTracking(isOnline: boolean, driverName: string) {
  useEffect(() => {
    if (!isOnline) return;
    
    let [fn, ln] = driverName.split(' ');
    if (!ln) ln = '';
    
    const interval = setInterval(async () => {
      const coords = await getDriverGPS();
      if (coords) {
        await supabase
          .from('drivers')
          .update({ lat: coords[0], lng: coords[1], last_ping: new Date().toISOString(), status: 'available' })
          .eq('first_name', fn)
          .eq('last_name', ln || null);
      }
    }, 10000); // Send GPS to Supabase every 10 seconds
    return () => clearInterval(interval);
  }, [isOnline]);
}

// ── Types ──────────────────────────────────────────────────────────────────
type SellerOrder = {
  id: number;
  order_ref: string;
  vendor_name: string;
  product_title: string;
  quantity: number;
  customer_amount: number;
  status: string;
  created_at: string;
};

type TripState = 'idle' | 'to_store' | 'at_store' | 'to_customer' | 'delivered';

type MapCoords = {
  store: [number, number] | undefined;
  customer: [number, number] | undefined;
  driver: [number, number] | undefined;
};

export default function DispatchDashboard() {
  const [driverName, setDriverName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    import('./login/actions').then(m => m.getDriverSession()).then(res => {
      if (res.success && res.driverName) {
        setDriverName(res.driverName);
      } else {
        window.location.href = '/login';
      }
      setAuthLoading(false);
    });
  }, []);

  const [tripState, setTripState] = useState<TripState>('idle');
  const [navInstruction, setNavInstruction] = useState('');
  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), text: 'System ready. Waiting for dispatch.' }]);
  const [activeTab, setActiveTab] = useState<'map' | 'earnings'>('map');
  const [hasBank, setHasBank] = useState(false);
  const [mapCoords, setMapCoords] = useState<MapCoords>({ store: undefined, customer: undefined, driver: undefined });
  const [mapKey, setMapKey] = useState('init'); // changing this key remounts DispatchMap with new coords
  const [geocoding, setGeocoding] = useState(false);

  // ── Real order state ──────────────────────────────────
  const [pendingOrders, setPendingOrders] = useState<SellerOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<SellerOrder | null>(null);
  const [polling, setPolling] = useState(true);

  // Send real live GPS to DB while available
  useDriverLiveTracking(polling, driverName);

  // ── Fetch pending orders from Supabase ────────────────
  const fetchPendingOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('seller_orders')
      .select('*')
      .eq('status', 'ready')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setPendingOrders(data);
    }
  }, []);

  // Poll every 5 seconds for new orders
  useEffect(() => {
    if (!polling) return;
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 5000);
    return () => clearInterval(interval);
  }, [polling, fetchPendingOrders]);

  // ── TTS helpers ────────────────────────────────────────
  const playTTS = (text: string, isNav = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isNav) setNavInstruction(text);
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
    } catch {}
    setTimeout(() => {
      const msg = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const ukVoice = voices.find(v => v.name === 'Google UK English Female')
        || voices.find(v => v.lang === 'en-GB');
      if (ukVoice) msg.voice = ukVoice;
      window.speechSynthesis.speak(msg);
    }, 180);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const addLog = (text: string) =>
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), text }, ...prev]);

  const handleTurn = (instruction: string) => { addLog(instruction); playTTS(instruction, true); };

  // ── Accept an order + geocode real locations ──────────────────────
  const acceptOrder = async (order: SellerOrder) => {
    const { error } = await supabase
      .from('seller_orders')
      .update({ status: 'accepted' })
      .eq('order_ref', order.order_ref);

    if (error) { console.error('Failed to accept order:', error); return; }

    setActiveOrder(order);
    setPolling(false);
    setPendingOrders([]);
    setLogs([]);
    addLog(`Order #${order.order_ref} assigned to ${driverName}.`);
    playTTS(`New order assigned. Proceed to ${order.vendor_name}.`, true);

    // Fetch the real shipping address from the parent order
    let realCustomerAddress = '123 Dropoff Street'; // fallback
    try {
      const { data: parentOrder } = await supabase
        .from('orders')
        .select('shipping_address')
        .ilike('id', `${order.order_ref.toLowerCase()}%`)
        .single();
      
      if (parentOrder?.shipping_address?.street) {
        realCustomerAddress = `${parentOrder.shipping_address.street}, ${parentOrder.shipping_address.city}`;
      }
    } catch(e) {}
    
    // Attach real addresses to the active order for the UI to use
    setActiveOrder({
      ...order,
      storeAddress: `${order.vendor_name} Headquarters`,
      deliveryAddress: realCustomerAddress
    } as any);

    // ── Geocode real locations in background ──
    setGeocoding(true);
    addLog('📡 Locating pickup & dropoff on map...');

    const [storeCoords, custCoords] = await Promise.all([
      geocodeAddress(`${order.vendor_name} Headquarters, South Africa`),
      geocodeAddress(`${realCustomerAddress}, South Africa`)
    ]);

    try {
      // 1. Get driver real GPS
      const driverGPS = await getDriverGPS();
      if (driverGPS) addLog(`📍 Driver GPS: ${driverGPS[0].toFixed(4)}, ${driverGPS[1].toFixed(4)}`);

      if (storeCoords || driverGPS || custCoords) {
        setMapCoords({
          driver:   driverGPS   || undefined,
          store:    storeCoords    || undefined,
          customer: custCoords || undefined,
        });
        setMapKey(`trip-${order.order_ref}-${Date.now()}`);
        addLog('🗺️ Map updated with real locations');
      } else {
        addLog('⚠️ Using demo Cape Town route (geocoding unavailable)');
      }
    } catch (e) {
      addLog('⚠️ Geocoding failed — using demo route');
    } finally {
      setGeocoding(false);
    }

    setTripState('to_store');
  };

  // ── Arrival callbacks from the map ────────────────────
  const handleArrival = async (destination: string) => {
    if (destination === 'store') {
      addLog(`Arriving at ${activeOrder?.vendor_name || 'store'}`);
      playTTS(`Arriving at ${activeOrder?.vendor_name || 'the store'}.`, true);
      setTripState('at_store');
      setTimeout(() => {
        addLog('Order retrieved. En route to customer.');
        playTTS('Order retrieved. En route to customer.', true);
        setTripState('to_customer');
      }, 3000);
    } else if (destination === 'customer') {
      addLog(`Order #${activeOrder?.order_ref} delivered!`);
      playTTS('You have arrived. Order delivered.', true);

      // Mark as delivered in Supabase
      if (activeOrder) {
        await supabase
          .from('seller_orders')
          .update({ status: 'delivered' })
          .eq('order_ref', activeOrder.order_ref);

        await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .ilike('id', `${activeOrder.order_ref.toLowerCase()}%`);
      }

      setTripState('delivered');
      setTimeout(() => setNavInstruction(''), 5000);

      // Restart polling after delivery
      setTimeout(() => {
        setPolling(true);
        setActiveOrder(null);
        setTripState('idle');
      }, 6000);
    }
  };

  // ── Group pending orders by order_ref ─────────────────
  const groupedOrders = pendingOrders.reduce<Record<string, SellerOrder[]>>((acc, o) => {
    if (!acc[o.order_ref]) acc[o.order_ref] = [];
    acc[o.order_ref].push(o);
    return acc;
  }, {});
  const topOrderRef = Object.keys(groupedOrders)[0];
  const topOrderItems = topOrderRef ? groupedOrders[topOrderRef] : [];
  const topOrderTotal = topOrderItems.reduce((s, o) => s + o.customer_amount, 0);

  if (authLoading || !driverName) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>Checking session...</div>;
  }

  return (
    <div className={styles.dashboardLayout}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brandNav}>
          <div className={styles.brandTitle}>DailyMarket <span style={{ color: '#05A357' }}>●</span></div>
          <div className={styles.brandSubtitle}>Delivery Operations Hub</div>
        </div>
        <div className={styles.sidebarMenu}>
          <div className={`${styles.menuItem} ${activeTab === 'map' ? styles.active : ''}`} onClick={() => setActiveTab('map')}>
            Live Dispatch Map
          </div>
          <div className={`${styles.menuItem} ${activeTab === 'earnings' ? styles.active : ''}`} onClick={() => setActiveTab('earnings')}>
            Earnings &amp; Payouts
          </div>
          <div className={styles.menuItem}>Trips &amp; Schedules</div>
          <div className={styles.menuItem}>Fleet Directory</div>
        </div>

        {/* Driver Profile Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #E2E2E2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{driverName.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{driverName}</div>
              <div style={{ color: '#05A357', fontSize: 12, fontWeight: 600 }}>● Active Driver</div>
            </div>
          </div>
          <button onClick={async () => {
              import('./login/actions').then(m => m.driverLogout().then(() => window.location.href = '/login'));
            }}
            style={{ width: '100%', background: '#F6F6F6', border: '1px solid #E2E2E2', borderRadius: 8, padding: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#545454' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.mainArea}>

        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerTitle}>{activeTab === 'map' ? 'Active Movement' : 'Driver Earnings'}</div>
          <div className={styles.headerActions}>
            {activeTab === 'map' && (
              tripState === 'idle' || tripState === 'delivered' ? (
                <button className={styles.actionBtnBlack} style={{ backgroundColor: '#05A357', color: 'white' }}>
                  {polling ? '● Online: Watching for Orders' : '● Offline'}
                </button>
              ) : (
                <button className={styles.actionBtnGrey}>Tracking Request...</button>
              )
            )}
          </div>
        </header>

        {activeTab === 'map' ? (
          <div className={styles.contentSplit}>

            {/* MAP */}
            <div className={styles.mapSection}>
              {(tripState === 'to_store' || tripState === 'to_customer' || tripState === 'at_store') && navInstruction && (
                <div className={styles.navOverlay}>
                  <div className={styles.navIconContainer}>
                    <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                  <div className={styles.navText}>
                    <div className={styles.navInstruction}>{navInstruction}</div>
                  </div>
                </div>
              )}

              {(tripState === 'to_store' || tripState === 'to_customer') && (
                <div className={styles.navBottom}>
                  <div>
                    <div className={styles.etaText}>{tripState === 'to_store' ? '12 min' : '8 min'}</div>
                    <div className={styles.etaSub}>{tripState === 'to_store' ? '2.4 km • en route to store' : '1.8 km • en route to customer'}</div>
                  </div>
                  <button className={styles.navExit} onClick={() => { setTripState('idle'); setNavInstruction(''); setPolling(true); setActiveOrder(null); }}>Exit</button>
                </div>
              )}

              <div className={styles.mapOverlay} style={{ pointerEvents: 'none', zIndex: 1000, position: 'relative', display: tripState === 'idle' ? 'block' : 'none' }}>
                <div className={styles.statusPill} style={{ pointerEvents: 'auto' }}>
                  <div className={styles.liveIndicator}></div>
                  <span className={styles.statusText}>{pendingOrders.length > 0 ? `${Object.keys(groupedOrders).length} Pending Order(s)` : '9 Online Drivers'}</span>
                  <span style={{ color: '#545454' }}>•</span>
                  <span className={styles.statusText}>4 Active Deliveries</span>
                </div>
              </div>

              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                <DispatchMap
                  key={mapKey}
                  tripState={tripState}
                  storeCoords={mapCoords.store}
                  customerCoords={mapCoords.customer}
                  driverCoords={mapCoords.driver}
                  storeName={activeOrder?.vendor_name || 'Unity C&C'}
                  onArrival={handleArrival}
                  onTurn={handleTurn}
                />
              </div>
            </div>

            {/* SIDE PANEL */}
            <div className={styles.sidePanel}>
              <div className={styles.panelSection}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Trip Details</h2>
                  {tripState !== 'idle' && tripState !== 'delivered' && <span className={styles.liveIndicator}></span>}
                </div>

                {/* ── IDLE: show real incoming order ── */}
                {(tripState === 'idle' || tripState === 'delivered') && (
                  topOrderRef ? (
                    <div className={styles.radarCard}>
                      <div className={styles.radarPulse}></div>
                      <div className={styles.radarHeader}>
                        <span className={styles.radarTitle}>🛒 New Order #{topOrderRef}</span>
                        <span className={styles.radarTime}>Just now</span>
                      </div>

                      <div className={styles.radarOfferPrice}>R{topOrderTotal.toFixed(2)}</div>
                      <div className={styles.radarOfferDist}>
                        {topOrderItems.length} item{topOrderItems.length > 1 ? 's' : ''} · 2.4 km · ~12 mins
                      </div>

                      {/* Item list */}
                      <div style={{ margin: '12px 0', borderRadius: 8, background: '#f8f8f8', padding: '8px 12px' }}>
                        {topOrderItems.slice(0, 3).map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: i < topOrderItems.length - 1 ? '1px solid #eee' : 'none' }}>
                            <span>{item.quantity}× {item.product_title}</span>
                            <span style={{ fontWeight: 700 }}>R{item.customer_amount.toFixed(2)}</span>
                          </div>
                        ))}
                        {topOrderItems.length > 3 && (
                          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>+{topOrderItems.length - 3} more items</div>
                        )}
                      </div>

                      <div className={styles.activityAddresses} style={{ marginTop: 8, marginBottom: 16 }}>
                        <div className={styles.addressRow}>
                          <div className={styles.addressTitle}>Pickup: {topOrderItems[0]?.vendor_name || 'Unity C&C'}</div>
                          <div className={styles.addressSub}>14 Main Road, Cape Town</div>
                        </div>
                        <div className={`${styles.addressRow} ${styles.dropoff}`}>
                          <div className={styles.addressTitle}>Dropoff: Customer</div>
                          <div className={styles.addressSub}>42 Beach Boulevard, Sea Point</div>
                        </div>
                      </div>

                      <button className={styles.acceptBtn} onClick={() => acceptOrder(topOrderItems[0])}>
                        ✓ Accept Delivery — R{topOrderTotal.toFixed(2)}
                      </button>

                      {Object.keys(groupedOrders).length > 1 && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#888', textAlign: 'center' }}>
                          +{Object.keys(groupedOrders).length - 1} more order(s) queued
                        </div>
                      )}
                    </div>
                  ) : (
                    /* No real orders yet — show waiting state */
                    <div className={styles.radarCard}>
                      <div className={styles.radarPulse}></div>
                      <div className={styles.radarHeader}>
                        <span className={styles.radarTitle}>Scanning for orders...</span>
                        <span className={styles.radarTime}>Live</span>
                      </div>
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#888', fontSize: 14 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                        Waiting for a customer to place an order
                      </div>
                    </div>
                  )
                )}

                {/* ── ACTIVE TRIP ── */}
                {tripState !== 'idle' && tripState !== 'delivered' && activeOrder && (
                  <div className={styles.activityCard}>
                    <div className={styles.activityTop}>
                      <span className={styles.orderRef}>Order #{activeOrder.order_ref}</span>
                      <span className={`${styles.uberBadge} ${styles.dark}`}>
                        {tripState === 'to_store' ? 'En Route to Store' :
                         tripState === 'at_store' ? 'At Store' :
                         tripState === 'to_customer' ? 'On Way to Customer' : ''}
                      </span>
                    </div>
                    <div className={styles.activityAddresses}>
                      <div className={styles.addressRow}>
                        <div className={styles.addressTitle}>Pickup: {activeOrder.vendor_name}</div>
                        <div className={styles.addressSub}>14 Main Road</div>
                      </div>
                      <div className={`${styles.addressRow} ${styles.dropoff}`}>
                        <div className={styles.addressTitle}>Dropoff: Customer</div>
                        <div className={styles.addressSub}>123 Dropoff Street</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live log */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Live Feed log:</div>
                  <div className={styles.logBox}>
                    {logs.map((log, i) => (
                      <div key={i} className={styles.logEntry}>
                        <span suppressHydrationWarning className={styles.logTime}>{log.time}</span>
                        <span>{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fleet */}
              <div className={styles.panelSection} style={{ borderBottom: 'none' }}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Fleet Live</h2>
                </div>
                <div className={styles.fleetRow}>
                  <div className={styles.fleetAvatar}>{driverName.charAt(0).toUpperCase()}<div className={styles.fleetOnline}></div></div>
                  <div className={styles.fleetDetails}>
                    <div className={styles.fleetName}>{driverName}</div>
                    <div className={styles.fleetVehicle}>Honda Fit (Silver)</div>
                  </div>
                  <div className={styles.fleetMetric}>
                    {tripState === 'idle' || tripState === 'delivered' ? 'Available' : 'On Trip'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ── EARNINGS TAB ── */
          <div className={styles.earningsDashboard}>
            <div className={styles.earningsGrid}>
              <div className={styles.earningsCol}>
                <div className={styles.balanceCard}>
                  <div className={styles.balanceTitle}>Available to pay out</div>
                  <div className={styles.balanceAmount}>R3,450.00</div>
                  <div className={styles.balanceActions}>
                    <button className={`${styles.payoutBtn} ${!hasBank ? styles.disabled : ''}`} onClick={() => alert('Transferring funds via Stripe!')}>
                      Cash out now
                    </button>
                  </div>
                </div>
                <div className={styles.historyCard}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Recent Trips</h3>
                  <div className={styles.historyList}>
                    {[{ date: 'Today, 2:45 PM', route: 'Unity C&C → Customer', amt: 'R45.00' },
                      { date: 'Today, 1:15 PM', route: 'Fresh Farms → Michael B.', amt: 'R75.00' },
                      { date: 'Yesterday, 6:30 PM', route: 'Daily Market Hub → Sarah T.', amt: 'R110.00' }
                    ].map((t, i) => (
                      <div key={i} className={styles.historyItem}>
                        <div>
                          <div className={styles.tripDate}>{t.date}</div>
                          <div className={styles.tripRoute}>{t.route}</div>
                        </div>
                        <div className={styles.tripAmt}>+{t.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.earningsCol}>
                <div className={styles.paymentCard}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 18, display: 'flex', justifyContent: 'space-between' }}>
                    Payout Methods <span style={{ fontSize: 13, color: '#635BFF', fontWeight: 600 }}>Stripe Express</span>
                  </h3>
                  {hasBank ? (
                    <div className={styles.bankLinked}>
                      <div className={styles.bankIcon}>🏦</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>CHASE BANK</div>
                        <div style={{ color: '#545454', fontSize: 14 }}>Checking •••• 9012</div>
                      </div>
                      <div className={styles.statusBadgeGreen}>Active</div>
                    </div>
                  ) : (
                    <div className={styles.emptyBank}>
                      <div className={styles.emptyBankText}>No bank account linked.</div>
                      <button className={styles.stripeConnectBtn} onClick={() => { if (confirm('Simulate Stripe onboarding?')) setHasBank(true); }}>
                        Link Bank Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
