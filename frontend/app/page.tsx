'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { TrendingUp, LogOut, Star, Trash2, LogIn, BarChart3, Sparkles } from 'lucide-react';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  changePct: number;
}

interface WatchItem {
  id: string;
  coin_id: string;
  name: string;
  symbol: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLive, setListLive] = useState(false);
  const [streamSymbols, setStreamSymbols] = useState<string[]>([]);
  const pendingRef = useRef<Record<string, Partial<Coin>>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch('https://api.coinpaprika.com/v1/tickers?quotes=USD&limit=20');
        const data = await res.json();
        if (Array.isArray(data)) {
          const list = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            symbol: (c.symbol || '').toLowerCase(),
            price: c.quotes?.USD?.price || 0,
            changePct: c.quotes?.USD?.percent_change_24h || 0,
          }));
          setCoins(list);
          setStreamSymbols(prev => prev.length === 0 ? list.map((c: Coin) => c.symbol) : prev);
        }
      } catch {}
      setLoading(false);
    };
    fetchCoins();
  }, []);

  useEffect(() => {
    if (streamSymbols.length === 0) return;
    let ws: WebSocket | null = null;
    let cancelled = false;

    const setup = async () => {
      try {
        let valid: Set<string>;
        const cached = sessionStorage.getItem('binance_symbols');
        if (cached) {
          valid = new Set(JSON.parse(cached));
        } else {
          const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
          const info = await res.json();
          valid = new Set(
            info.symbols
              .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
              .map((s: any) => s.baseAsset)
          );
          sessionStorage.setItem('binance_symbols', JSON.stringify([...valid]));
        }
        if (cancelled) return;

        const streams = streamSymbols
          .filter(s => valid.has(s.toUpperCase()))
          .map(s => `${s.toLowerCase()}usdt@miniTicker`);
        if (streams.length === 0) return;

        ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`);
        ws.onopen = () => setListLive(true);
        ws.onclose = () => setListLive(false);
        ws.onerror = () => setListLive(false);
        ws.onmessage = (e) => {
          try {
            const d = JSON.parse(e.data).data;
            if (!d || !d.s) return;
            const sym = d.s.replace(/USDT$/i, '').toLowerCase();
            const price = parseFloat(d.c);
            const open = parseFloat(d.o);
            pendingRef.current[sym] = {
              price,
              changePct: open > 0 ? ((price - open) / open) * 100 : 0,
            };
          } catch {}
        };
      } catch {}
    };

    setup();
    return () => { cancelled = true; ws?.close(); };
  }, [streamSymbols]);

  useEffect(() => {
    const flush = setInterval(() => {
      const pending = pendingRef.current;
      if (Object.keys(pending).length === 0) return;
      pendingRef.current = {};
      setCoins(prev => prev.map(c => pending[c.symbol] ? { ...c, ...pending[c.symbol] } : c));
    }, 1000);
    return () => clearInterval(flush);
  }, []);

  useEffect(() => {
    if (user) fetchWatchlist();
  }, [user]);

  const fetchWatchlist = async () => {
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false });
    setWatchlist(data || []);
  };

  const addToWatchlist = async (coin: Coin) => {
    if (!user) return;
    const { error } = await supabase.from('watchlist').insert({
      user_id: user.id,
      coin_id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
    });
    if (!error) fetchWatchlist();
  };

  const removeFromWatchlist = async (coinId: string) => {
    const { error } = await supabase.from('watchlist').delete().eq('coin_id', coinId);
    if (!error) fetchWatchlist();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const inWatchlist = (coinId: string) => watchlist.some(w => w.coin_id === coinId);

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-500/[0.07] blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-blue-500/[0.05] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[400px] bg-purple-500/[0.05] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      {/* Live Ticker Marquee */}
      {!loading && coins.length > 0 && (
        <div className="relative border-b border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden py-2.5">
          <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] w-max">
            {[...coins, ...coins].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-xs">
                <span className="text-white/50 font-semibold">{c.symbol.toUpperCase()}</span>
                <span className="font-mono text-white/90">{formatPrice(c.price)}</span>
                <span className={c.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {c.changePct >= 0 ? '▲' : '▼'} {Math.abs(c.changePct).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Glass Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-black/30 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-orange-500/30 blur-md" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">CryptoWatch</h1>
              <p className="text-[11px] text-white/40">Personal watchlist · Live data</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {listLive && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[11px] font-bold text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                LIVE
              </span>
            )}
            {user ? (
              <>
                <span className="hidden sm:block text-xs text-white/50 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                  {user.email}
                </span>
                <button onClick={handleLogout} className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link href="/auth" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Hero (logged out) */}
        {!user && (
          <section className="text-center py-16 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] text-white/60 mb-6 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Real-time Binance WebSocket data
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent mb-5">
              Apni Crypto Watchlist
              <br />
              Banayein
            </h2>
            <p className="text-white/50 max-w-md mx-auto mb-9 leading-relaxed">
              Login karein, apne favorite coins save karein, aur live prices + interactive charts dekhein.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 font-bold shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all"
            >
              Shuru Karein →
            </Link>
          </section>
        )}

        {/* Watchlist */}
        {user && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Meri Watchlist
            </h2>
            {watchlist.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center text-white/40 text-sm bg-white/[0.02]">
                Watchlist khali hai - neeche coins par ⭐ daba kar add karein
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {watchlist.map(item => {
                  const live = coins.find(c => c.id === item.coin_id);
                  return (
                    <div key={item.id} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/[0.12]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                          {item.symbol.toUpperCase().slice(0, 4)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                          <p className="text-[11px] text-white/40 uppercase">{item.symbol}</p>
                        </div>
                        {live && (
                          <div className="text-right">
                            <p className="font-mono font-semibold text-sm">{formatPrice(live.price)}</p>
                            <p className={`text-[11px] font-medium ${live.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {live.changePct >= 0 ? '+' : ''}{live.changePct.toFixed(2)}%
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                        <Link href={`/coin/${item.coin_id}?symbol=${item.symbol}&name=${encodeURIComponent(item.name)}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-white/70 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400 transition-all">
                          <BarChart3 className="w-3.5 h-3.5" /> Chart
                        </Link>
                        <button onClick={() => removeFromWatchlist(item.coin_id)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Coins List */}
        <section>
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Top 20 · Live
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {coins.map((coin, i) => (
                <div key={coin.id} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-xl hover:shadow-orange-500/5">
                  <span className="text-xs font-mono text-white/30 w-6">#{i + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                    {coin.symbol.toUpperCase().slice(0, 4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{coin.name}</h3>
                    <p className="text-[11px] text-white/40 uppercase">{coin.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">{formatPrice(coin.price)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${coin.changePct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {coin.changePct >= 0 ? '+' : ''}{coin.changePct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/coin/${coin.id}?symbol=${coin.symbol}&name=${encodeURIComponent(coin.name)}`} className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all">
                      <BarChart3 className="w-4 h-4" />
                    </Link>
                    {user && (
                      <button
                        onClick={() => inWatchlist(coin.id) ? removeFromWatchlist(coin.id) : addToWatchlist(coin)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          inWatchlist(coin.id)
                            ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                            : 'text-white/50 border-white/10 bg-white/5 hover:text-yellow-400 hover:border-yellow-500/30'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${inWatchlist(coin.id) ? 'fill-yellow-400' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
