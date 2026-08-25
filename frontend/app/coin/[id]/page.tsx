'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/static-components -- this existing client chart intentionally updates from asynchronous Binance data and uses a Recharts tooltip callback. */
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartPoint {
  time: number;
  close: number;
}

const INTERVALS = [
  { label: '24H', value: '1h', limit: '24' },
  { label: '7D', value: '1h', limit: '168' },
  { label: '1M', value: '1d', limit: '30' },
  { label: '1Y', value: '1d', limit: '365' },
];

export default function CoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const symbol = (searchParams.get('symbol') || 'BTC').toUpperCase();
  const name = searchParams.get('name') || symbol;

  const [live, setLive] = useState<{ price: number; changePct: number; high: number; low: number; volume: number } | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(false);
  const [intervalIndex, setIntervalIndex] = useState(1);

  // Live ticker (Binance WebSocket)
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@ticker`);
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        setLive({
          price: parseFloat(d.c),
          changePct: parseFloat(d.P),
          high: parseFloat(d.h),
          low: parseFloat(d.l),
          volume: parseFloat(d.q),
        });
      } catch {}
    };
    return () => ws.close();
  }, [symbol]);

  // Klines chart (browser se direct Binance)
  useEffect(() => {
    const active = INTERVALS[intervalIndex];
    setChartLoading(true);
    setChartError(false);
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${active.value}&limit=${active.limit}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then(k => {
        setChartData(k.map((row: any[]) => ({ time: row[0], close: parseFloat(row[4]) })));
      })
      .catch(() => setChartError(true))
      .finally(() => setChartLoading(false));
  }, [symbol, intervalIndex]);

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const compactPrice = (v: number) => {
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
    if (v < 1) return `$${v.toFixed(4)}`;
    return `$${v.toFixed(2)}`;
  };

  const formatTime = (t: number) => {
    const d = new Date(t);
    if (INTERVALS[intervalIndex].value === '1h') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isPositive = (live?.changePct ?? 0) >= 0;
  const chartUp = chartData.length > 1 ? chartData[chartData.length - 1].close >= chartData[0].close : true;
  const chartColor = chartUp ? '#10b981' : '#ef4444';

  const ChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as ChartPoint;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{new Date(point.time).toLocaleString()}</p>
          <p className="text-white font-bold">{formatPrice(point.close)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Coin Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-slate-400 uppercase text-sm">{symbol} / USDT</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {wsConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-bold text-slate-300">{wsConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Live Price */}
        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-2xl p-6 mb-6">
          <p className={`text-4xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {live ? formatPrice(live.price) : 'Loading...'}
          </p>
          {live && (
            <div className="flex items-center gap-2 mt-2">
              {isPositive ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
              <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                {isPositive ? '+' : ''}{live.changePct.toFixed(2)}% (24h)
              </span>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-bold">Price Chart</h2>
            <div className="flex gap-2">
              {INTERVALS.map((int, i) => (
                <button
                  key={int.label}
                  onClick={() => setIntervalIndex(i)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                    i === intervalIndex ? 'bg-orange-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>

          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : chartError ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Chart not available for this coin on Binance
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tickFormatter={formatTime} stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={50} />
                  <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={compactPrice} tickLine={false} axisLine={false} width={65} domain={['auto', 'auto']} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Live Stats */}
        {live && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> 24h High</p>
              <p className="text-xl font-bold text-green-400">{formatPrice(live.high)}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-400" /> 24h Low</p>
              <p className="text-xl font-bold text-red-400">{formatPrice(live.low)}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400" /> 24h Volume</p>
              <p className="text-xl font-bold">{formatNumber(live.volume)}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
