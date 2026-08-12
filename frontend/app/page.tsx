'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { TrendingUp, LogOut, Star, Trash2, LogIn } from 'lucide-react';

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

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Coins fetch
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch('https://api.coinpaprika.com/v1/tickers?quotes=USD&limit=20');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCoins(data.map((c: any) => ({
            id: c.id,
            name: c.name,
            symbol: (c.symbol || '').toLowerCase(),
            price: c.quotes?.USD?.price || 0,
            changePct: c.quotes?.USD?.percent_change_24h || 0,
          })));
        }
      } catch {}
      setLoading(false);
    };
    fetchCoins();
  }, []);

  // Watchlist fetch
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
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('coin_id', coinId);
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CryptoWatch</h1>
              <p className="text-xs text-slate-400">Personal watchlist</p>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">{user.email}</span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-sm transition">
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Not logged in hero */}
        {!user && (
          <div className="text-center py-10 mb-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2">Apni Crypto Watchlist Banayein ⭐</h2>
            <p className="text-slate-400 mb-6 px-4">Login karein aur apne favorite coins ko save karein - live prices ke sath!</p>
            <Link href="/auth" className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl font-bold transition">
              Shuru Karein
            </Link>
          </div>
        )}

        {/* Watchlist Section */}
        {user && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Meri Watchlist
            </h2>
            {watchlist.length === 0 ? (
              <p className="text-slate-500 text-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-center">
                Watchlist khali hai - neeche coins par ⭐ daba kar add karein!
              </p>
            ) : (
              <div className="space-y-3">
                {watchlist.map(item => {
                  const live = coins.find(c => c.id === item.coin_id);
                  return (
                    <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {item.symbol.toUpperCase().slice(0, 4)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <p className="text-xs text-slate-400 uppercase">{item.symbol}</p>
                      </div>
                      {live && (
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(live.price)}</p>
                          <p className={`text-xs ${live.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {live.changePct >= 0 ? '+' : ''}{live.changePct.toFixed(2)}%
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => removeFromWatchlist(item.coin_id)}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Coins List */}
        <section>
          <h2 className="text-lg font-bold mb-4">🔥 Top 20 Coins</h2>
          {loading ? (
            <p className="text-slate-500 text-center py-10">Loading coins...</p>
          ) : (
            <div className="space-y-3">
              {coins.map((coin, i) => (
                <div key={coin.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
                  <span className="text-sm text-slate-500 w-6">#{i + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                    {coin.symbol.toUpperCase().slice(0, 4)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{coin.name}</h3>
                    <p className="text-xs text-slate-400 uppercase">{coin.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(coin.price)}</p>
                    <p className={`text-xs ${coin.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.changePct >= 0 ? '+' : ''}{coin.changePct.toFixed(2)}%
                    </p>
                  </div>
                  {user && (
                    <button
                      onClick={() => inWatchlist(coin.id) ? removeFromWatchlist(coin.id) : addToWatchlist(coin)}
                      className={`p-2 rounded-lg transition ${
                        inWatchlist(coin.id)
                          ? 'text-yellow-400 bg-yellow-500/10'
                          : 'text-slate-400 bg-slate-700/50 hover:text-yellow-400'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${inWatchlist(coin.id) ? 'fill-yellow-400' : ''}`} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
