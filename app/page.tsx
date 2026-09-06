'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import './dashboard.css';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Compass,
  Activity,
  Clock,
  Star,
  ExternalLink,
  Download,
  Plus,
  MoreHorizontal,
} from 'lucide-react';

export type Asset = 'BTC' | 'ETH' | 'SUI' | 'BNB' | 'XRP' | 'SOL' | 'LTC' | 'ADA';
export type Strategy = 'Bull Call Spread' | 'Covered Call' | 'Bear Put Spread' | 'Iron Condor';
export type Menu = 'Dashboard' | 'Market' | 'Positions' | 'Strategies' | 'Analytics' | 'History' | 'Watchlist';
export type Timeframe = '1D' | '1W' | '1M' | '1Y';
export type StrategyCategory = 'All strategies' | 'Income' | 'Directional' | 'Volatility' | 'Hedging';

export interface Position {
  id: string;
  strategy: string;
  underlying: Asset;
  instrument: string;
  expiry: string;
  contracts: number;
  entry: number;
  mark: number;
  pnl: number;
  side: 'Buy' | 'Sell';
  collateral: string;
  status: 'Open' | 'Settled';
}

export interface HistoryItem {
  id: string;
  date: string;
  activity: 'Opened' | 'Closed' | 'Expired' | 'Deposit' | 'Rolled';
  instrument: string;
  amount: number;
  status: 'Open' | 'Settled' | 'Confirmed';
}

export interface OptionLeg {
  id: string;
  type: 'Call' | 'Put';
  side: 'Buy' | 'Sell';
  strike: number;
  contracts: number;
  premium: number;
}

export interface WatchlistItem {
  asset: Asset;
  name: string;
  price: number;
  change24h: string;
  isPositive: boolean;
  iv: string;
  volume: string;
  openInterest: string;
  signal: string;
}

export interface AssetProfile {
  name: string;
  atmIv: string;
  ivDelta: string;
  ivRank: string;
  expectedMove: string;
  expectedPct: string;
  putCallVol: string;
  volume: string;
  openInterest: string;
  signal: string;
  maxPain: string;
  fundingRate: string;
  skew: string;
  tenorPoints: { tenor: string; iv: number; avg: number; x: number }[];
  greeks: [string, string, number][];
  surfaceStrikes: string[];
}

const assets: Record<Asset, number> = {
  BTC: 67842.36,
  ETH: 3548.82,
  SUI: 2.31,
  BNB: 612.0,
  XRP: 0.58,
  SOL: 154.7,
  LTC: 87.5,
  ADA: 0.42,
};

const menu: Menu[] = ['Dashboard', 'Market', 'Positions', 'Strategies', 'Analytics', 'History', 'Watchlist'];

const menuIcons: Record<Menu, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={18} />,
  Market: <TrendingUp size={18} />,
  Positions: <Briefcase size={18} />,
  Strategies: <Compass size={18} />,
  Analytics: <Activity size={18} />,
  History: <Clock size={18} />,
  Watchlist: <Star size={18} />,
};

const money = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
const today = '2026-09-04';

// Asset-specific intelligence profiles with tailored term structure curves
const assetProfiles: Record<Asset, AssetProfile> = {
  BTC: {
    name: 'Bitcoin',
    atmIv: '48.21%',
    ivDelta: '−1.8 vol pts',
    ivRank: '64',
    expectedMove: '$4,617',
    expectedPct: '±6.82%',
    putCallVol: '0.74',
    volume: '$24.8M',
    openInterest: '$86.4M',
    signal: 'Call flow active',
    maxPain: '$68,000',
    fundingRate: '0.011%',
    skew: '−2.8',
    tenorPoints: [
      { tenor: '7D', iv: 41.2, avg: 47.5, x: 48 },
      { tenor: '14D', iv: 44.8, avg: 48.2, x: 144 },
      { tenor: '30D', iv: 48.2, avg: 49.5, x: 240 },
      { tenor: '60D', iv: 47.1, avg: 50.8, x: 336 },
      { tenor: '90D', iv: 50.4, avg: 51.5, x: 432 },
    ],
    greeks: [
      ['Delta', '0.38', 38],
      ['Gamma', '0.0048', 24],
      ['Theta', '−$64.20', 66],
      ['Vega', '$182.10', 52],
    ],
    surfaceStrikes: ['60K', '65K', '70K', '75K', '80K'],
  },
  ETH: {
    name: 'Ethereum',
    atmIv: '52.64%',
    ivDelta: '+2.4 vol pts',
    ivRank: '68',
    expectedMove: '$285',
    expectedPct: '±8.03%',
    putCallVol: '0.81',
    volume: '$11.2M',
    openInterest: '$42.1M',
    signal: 'IV expansion',
    maxPain: '$3,500',
    fundingRate: '0.009%',
    skew: '−1.4',
    tenorPoints: [
      { tenor: '7D', iv: 45.5, avg: 50.5, x: 48 },
      { tenor: '14D', iv: 49.0, avg: 51.5, x: 144 },
      { tenor: '30D', iv: 52.6, avg: 52.8, x: 240 },
      { tenor: '60D', iv: 55.4, avg: 54.0, x: 336 },
      { tenor: '90D', iv: 58.2, avg: 55.5, x: 432 },
    ],
    greeks: [
      ['Delta', '0.44', 44],
      ['Gamma', '0.0062', 31],
      ['Theta', '−$48.50', 58],
      ['Vega', '$145.20', 48],
    ],
    surfaceStrikes: ['3.1K', '3.3K', '3.5K', '3.7K', '3.9K'],
  },
  SOL: {
    name: 'Solana',
    atmIv: '67.10%',
    ivDelta: '−0.8 vol pts',
    ivRank: '74',
    expectedMove: '$18.40',
    expectedPct: '±11.9%',
    putCallVol: '0.68',
    volume: '$4.8M',
    openInterest: '$13.7M',
    signal: 'Watch support',
    maxPain: '$150',
    fundingRate: '0.014%',
    skew: '−3.2',
    tenorPoints: [
      { tenor: '7D', iv: 58.4, avg: 62.0, x: 48 },
      { tenor: '14D', iv: 62.8, avg: 63.8, x: 144 },
      { tenor: '30D', iv: 67.1, avg: 65.2, x: 240 },
      { tenor: '60D', iv: 71.5, avg: 67.0, x: 336 },
      { tenor: '90D', iv: 75.8, avg: 69.2, x: 432 },
    ],
    greeks: [
      ['Delta', '0.51', 51],
      ['Gamma', '0.0094', 47],
      ['Theta', '−$22.80', 42],
      ['Vega', '$88.50', 36],
    ],
    surfaceStrikes: ['130', '140', '155', '170', '185'],
  },
  BNB: {
    name: 'BNB Chain',
    atmIv: '44.36%',
    ivDelta: '+0.5 vol pts',
    ivRank: '52',
    expectedMove: '$38.50',
    expectedPct: '±6.29%',
    putCallVol: '0.79',
    volume: '$1.6M',
    openInterest: '$7.9M',
    signal: 'Range-bound',
    maxPain: '$610',
    fundingRate: '0.008%',
    skew: '−0.8',
    tenorPoints: [
      { tenor: '7D', iv: 38.2, avg: 42.0, x: 48 },
      { tenor: '14D', iv: 41.5, avg: 42.8, x: 144 },
      { tenor: '30D', iv: 44.4, avg: 43.5, x: 240 },
      { tenor: '60D', iv: 46.8, avg: 44.8, x: 336 },
      { tenor: '90D', iv: 48.5, avg: 46.0, x: 432 },
    ],
    greeks: [
      ['Delta', '0.34', 34],
      ['Gamma', '0.0038', 19],
      ['Theta', '−$31.10', 50],
      ['Vega', '$96.40', 40],
    ],
    surfaceStrikes: ['550', '580', '610', '640', '670'],
  },
  XRP: {
    name: 'Ripple XRP',
    atmIv: '72.40%',
    ivDelta: '+4.1 vol pts',
    ivRank: '82',
    expectedMove: '$0.09',
    expectedPct: '±15.5%',
    putCallVol: '0.62',
    volume: '$2.1M',
    openInterest: '$8.4M',
    signal: 'High volatility breakout',
    maxPain: '$0.55',
    fundingRate: '0.018%',
    skew: '−4.6',
    tenorPoints: [
      { tenor: '7D', iv: 63.0, avg: 67.0, x: 48 },
      { tenor: '14D', iv: 67.5, avg: 68.5, x: 144 },
      { tenor: '30D', iv: 72.4, avg: 70.0, x: 240 },
      { tenor: '60D', iv: 76.8, avg: 72.2, x: 336 },
      { tenor: '90D', iv: 80.5, avg: 74.0, x: 432 },
    ],
    greeks: [
      ['Delta', '0.58', 58],
      ['Gamma', '0.0125', 62],
      ['Theta', '−$14.20', 32],
      ['Vega', '$45.80', 25],
    ],
    surfaceStrikes: ['0.45', '0.50', '0.58', '0.65', '0.75'],
  },
  SUI: {
    name: 'Sui Network',
    atmIv: '84.15%',
    ivDelta: '+6.8 vol pts',
    ivRank: '88',
    expectedMove: '$0.34',
    expectedPct: '±14.7%',
    putCallVol: '0.58',
    volume: '$3.4M',
    openInterest: '$9.2M',
    signal: 'Speculative momentum',
    maxPain: '$2.20',
    fundingRate: '0.022%',
    skew: '−5.2',
    tenorPoints: [
      { tenor: '7D', iv: 74.0, avg: 78.0, x: 48 },
      { tenor: '14D', iv: 79.5, avg: 80.5, x: 144 },
      { tenor: '30D', iv: 84.2, avg: 83.0, x: 240 },
      { tenor: '60D', iv: 89.0, avg: 85.5, x: 336 },
      { tenor: '90D', iv: 93.5, avg: 88.0, x: 432 },
    ],
    greeks: [
      ['Delta', '0.62', 62],
      ['Gamma', '0.0150', 75],
      ['Theta', '−$18.50', 38],
      ['Vega', '$54.00', 30],
    ],
    surfaceStrikes: ['1.8', '2.0', '2.3', '2.6', '3.0'],
  },
  LTC: {
    name: 'Litecoin',
    atmIv: '49.80%',
    ivDelta: '−0.4 vol pts',
    ivRank: '58',
    expectedMove: '$6.20',
    expectedPct: '±7.08%',
    putCallVol: '0.77',
    volume: '$890K',
    openInterest: '$3.4M',
    signal: 'Defensive flow',
    maxPain: '$85.00',
    fundingRate: '0.007%',
    skew: '−1.1',
    tenorPoints: [
      { tenor: '7D', iv: 43.0, avg: 48.0, x: 48 },
      { tenor: '14D', iv: 46.5, avg: 48.8, x: 144 },
      { tenor: '30D', iv: 49.8, avg: 49.5, x: 240 },
      { tenor: '60D', iv: 52.0, avg: 50.8, x: 336 },
      { tenor: '90D', iv: 54.2, avg: 52.0, x: 432 },
    ],
    greeks: [
      ['Delta', '0.36', 36],
      ['Gamma', '0.0042', 21],
      ['Theta', '−$19.40', 39],
      ['Vega', '$62.10', 31],
    ],
    surfaceStrikes: ['75', '80', '88', '95', '105'],
  },
  ADA: {
    name: 'Cardano',
    atmIv: '61.20%',
    ivDelta: '+1.1 vol pts',
    ivRank: '70',
    expectedMove: '$0.05',
    expectedPct: '±11.9%',
    putCallVol: '0.65',
    volume: '$1.2M',
    openInterest: '$4.8M',
    signal: 'Accumulation pattern',
    maxPain: '$0.40',
    fundingRate: '0.010%',
    skew: '−2.2',
    tenorPoints: [
      { tenor: '7D', iv: 52.5, avg: 57.0, x: 48 },
      { tenor: '14D', iv: 56.8, avg: 58.5, x: 144 },
      { tenor: '30D', iv: 61.2, avg: 60.0, x: 240 },
      { tenor: '60D', iv: 65.0, avg: 61.8, x: 336 },
      { tenor: '90D', iv: 68.4, avg: 63.5, x: 432 },
    ],
    greeks: [
      ['Delta', '0.48', 48],
      ['Gamma', '0.0075', 37],
      ['Theta', '−$11.80', 28],
      ['Vega', '$38.20', 22],
    ],
    surfaceStrikes: ['0.35', '0.38', '0.42', '0.46', '0.50'],
  },
};

const initialPositions: Position[] = [
  {
    id: 'pos-1',
    strategy: 'Bull call spread',
    underlying: 'BTC',
    instrument: 'BTC 65K / 70K',
    expiry: '27 Sep 2026',
    contracts: 2,
    entry: 1420.0,
    mark: 1716.2,
    pnl: 592.4,
    side: 'Buy',
    collateral: 'USDC',
    status: 'Open',
  },
  {
    id: 'pos-2',
    strategy: 'Cash-secured put',
    underlying: 'ETH',
    instrument: 'ETH 3.4K Put',
    expiry: '4 Oct 2026',
    contracts: 4,
    entry: 184.0,
    mark: 151.8,
    pnl: 128.8,
    side: 'Sell',
    collateral: 'USDC',
    status: 'Open',
  },
  {
    id: 'pos-3',
    strategy: 'Iron condor',
    underlying: 'BTC',
    instrument: 'BTC 60K / 76K',
    expiry: '11 Oct 2026',
    contracts: 1,
    entry: 836.0,
    mark: 782.75,
    pnl: -53.25,
    side: 'Sell',
    collateral: 'USDC',
    status: 'Open',
  },
];

const initialHistory: HistoryItem[] = [
  {
    id: 'hist-1',
    date: 'Sep 03, 14:32',
    activity: 'Opened',
    instrument: 'BTC Bull Call Spread · Sep 27',
    amount: -2840.0,
    status: 'Open',
  },
  {
    id: 'hist-2',
    date: 'Sep 01, 09:17',
    activity: 'Closed',
    instrument: 'ETH Cash-Secured Put · Aug 30',
    amount: 736.0,
    status: 'Settled',
  },
  {
    id: 'hist-3',
    date: 'Aug 29, 17:41',
    activity: 'Expired',
    instrument: 'BTC Iron Condor · Aug 29',
    amount: 388.0,
    status: 'Settled',
  },
  {
    id: 'hist-4',
    date: 'Aug 22, 11:06',
    activity: 'Deposit',
    instrument: 'USDC collateral',
    amount: 10000.0,
    status: 'Confirmed',
  },
];

const initialWatchlist: WatchlistItem[] = [
  {
    asset: 'BTC',
    name: 'Bitcoin',
    price: 67842.36,
    change24h: '+1.28%',
    isPositive: true,
    iv: '48.21%',
    volume: '$24.8M',
    openInterest: '$86.4M',
    signal: 'Call flow active',
  },
  {
    asset: 'ETH',
    name: 'Ethereum',
    price: 3548.82,
    change24h: '+2.14%',
    isPositive: true,
    iv: '52.64%',
    volume: '$11.2M',
    openInterest: '$42.1M',
    signal: 'IV expansion',
  },
  {
    asset: 'SOL',
    name: 'Solana',
    price: 154.7,
    change24h: '−0.84%',
    isPositive: false,
    iv: '67.10%',
    volume: '$4.8M',
    openInterest: '$13.7M',
    signal: 'Watch support',
  },
  {
    asset: 'BNB',
    name: 'BNB Chain',
    price: 612.0,
    change24h: '+0.42%',
    isPositive: true,
    iv: '44.36%',
    volume: '$1.6M',
    openInterest: '$7.9M',
    signal: 'Range-bound',
  },
];

export default function Home() {
  const [page, setPage] = useState<Menu>('Dashboard');
  const [asset, setAsset] = useState<Asset>('BTC');
  const [strategy, setStrategy] = useState<Strategy>('Bull Call Spread');
  const [marketPrice, setMarketPrice] = useState(assets.BTC);

  // Shared trading state
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [realizedPnl, setRealizedPnl] = useState(8294.6);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialWatchlist);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type?: string }[]>([]);

  // Modals state
  const [managingPosition, setManagingPosition] = useState<Position | null>(null);
  const [showNewPositionModal, setShowNewPositionModal] = useState(false);
  const [showTvStudio, setShowTvStudio] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState<Asset | null>(null);

  const addToast = (msg: string, type = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const base = assets[asset];
    setMarketPrice(base);
    let tickCount = 0;
    const timer = window.setInterval(() => {
      tickCount += 1;
      setMarketPrice((prev) => {
        const cycle = Math.sin(tickCount * 0.45) * 0.022;
        const jitter = (Math.random() - 0.5) * 0.008;
        const target = base * (1 + cycle + jitter);
        const nextPrice = prev * 0.55 + target * 0.45;
        return Number(nextPrice.toFixed(base < 10 ? 4 : 2));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [asset]);

  // Handle Buy/Sell from Dashboard
  const handleDashboardOrder = (side: 'Buy' | 'Sell', strikePrice: number, premiumPrice: number, expiryDate: string) => {
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      strategy: strategy,
      underlying: asset,
      instrument: `${asset} ${Math.round(strikePrice / 1000)}K ${strategy.includes('Put') ? 'Put' : 'Call'}`,
      expiry: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(expiryDate + 'T12:00:00'),
      ),
      contracts: 1,
      entry: Math.round(premiumPrice),
      mark: Math.round(premiumPrice * (side === 'Buy' ? 1.01 : 0.99)),
      pnl: side === 'Buy' ? Math.round(premiumPrice * 0.01) : Math.round(premiumPrice * 0.01),
      side,
      collateral: 'USDC',
      status: 'Open',
    };

    setPositions((prev) => [newPos, ...prev]);
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        activity: 'Opened',
        instrument: `${asset} ${strategy} · ${newPos.expiry}`,
        amount: side === 'Buy' ? -newPos.entry : newPos.entry,
        status: 'Open',
      },
      ...prev,
    ]);

    addToast(`Order executed: ${side} ${strategy} (1 contract). Added to Open Positions.`);
    setPage('Positions');
  };

  // Manage modal actions
  const handleTakeProfit = (pos: Position) => {
    const bankedProfit = pos.pnl;
    setPositions((prev) => prev.filter((p) => p.id !== pos.id));
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        activity: 'Closed',
        instrument: `${pos.underlying} ${pos.strategy} · ${pos.expiry}`,
        amount: bankedProfit,
        status: 'Settled',
      },
      ...prev,
    ]);
    setRealizedPnl((prev) => prev + bankedProfit);
    addToast(`Position closed! Realized P&L of ${money(bankedProfit)} banked to portfolio.`);
    setManagingPosition(null);
  };

  const handleRollPosition = (pos: Position) => {
    const credit = 145.0;
    const updated: Position = {
      ...pos,
      expiry: '25 Oct 2026',
      entry: Math.max(0, pos.entry - credit),
      pnl: pos.pnl + credit,
    };
    setPositions((prev) => prev.map((p) => (p.id === pos.id ? updated : p)));
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        activity: 'Rolled',
        instrument: `${pos.underlying} ${pos.strategy} to 25 Oct`,
        amount: credit,
        status: 'Settled',
      },
      ...prev,
    ]);
    addToast(`Position rolled to 25 Oct 2026 with ${money(credit)} roll credit.`);
    setManagingPosition(null);
  };

  const handleRemovePosition = (pos: Position) => {
    setPositions((prev) => prev.filter((p) => p.id !== pos.id));
    addToast(`Position removed and collateral released.`);
    setManagingPosition(null);
  };

  // Export CSV Action
  const handleExportCsv = () => {
    if (history.length === 0) {
      addToast('No transaction records to export.', 'neutral');
      return;
    }
    const headers = ['Date', 'Activity', 'Instrument', 'Amount', 'Status'];
    const rows = history.map((item) => [
      `"${item.date}"`,
      `"${item.activity}"`,
      `"${item.instrument}"`,
      item.amount >= 0 ? `+${item.amount.toFixed(2)}` : `${item.amount.toFixed(2)}`,
      `"${item.status}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thetanuts_transactions_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Transaction history exported to CSV successfully!');
  };

  // Add Asset to Watchlist
  const handleAddAssetToWatchlist = (newAsset: Asset) => {
    if (watchlist.some((item) => item.asset === newAsset)) {
      addToast(`${newAsset} is already on your watchlist radar.`, 'neutral');
      setShowAddAssetModal(false);
      return;
    }
    const profile = assetProfiles[newAsset];
    const newItem: WatchlistItem = {
      asset: newAsset,
      name: profile.name,
      price: assets[newAsset],
      change24h: '+1.65%',
      isPositive: true,
      iv: profile.atmIv,
      volume: profile.volume,
      openInterest: profile.openInterest,
      signal: profile.signal,
    };
    setWatchlist((prev) => [...prev, newItem]);
    addToast(`${newAsset} added to your watchlist radar!`);
    setShowAddAssetModal(false);
  };

  const handleRemoveFromWatchlist = (assetToRemove: Asset) => {
    setWatchlist((prev) => prev.filter((item) => item.asset !== assetToRemove));
    addToast(`${assetToRemove} removed from watchlist.`);
    setSelectedAssetDetails(null);
  };

  const handleDeployCustomStrategy = (newPos: Position) => {
    setPositions((prev) => [newPos, ...prev]);
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        activity: 'Opened',
        instrument: `${newPos.underlying} ${newPos.strategy} · ${newPos.expiry}`,
        amount: -newPos.entry,
        status: 'Open',
      },
      ...prev,
    ]);
    addToast(`Custom multi-leg strategy deployed to Open Positions!`);
    setShowTvStudio(false);
    setPage('Positions');
  };

  return (
    <main className="explorer">
      <Sidebar page={page} setPage={setPage} />
      {page === 'Dashboard' ? (
        <Dashboard
          asset={asset}
          setAsset={setAsset}
          strategy={strategy}
          setStrategy={setStrategy}
          marketPrice={marketPrice}
          onOrderSubmit={handleDashboardOrder}
        />
      ) : (
        <Detail
          page={page}
          asset={asset}
          onAssetChange={(newA) => setAsset(newA)}
          price={marketPrice}
          positions={positions}
          history={history}
          realizedPnl={realizedPnl}
          watchlist={watchlist}
          onManagePosition={(pos) => setManagingPosition(pos)}
          onOpenNewPosition={() => setShowNewPositionModal(true)}
          onOpenTvStudio={() => setShowTvStudio(true)}
          onExportCsv={handleExportCsv}
          onOpenAddAsset={() => setShowAddAssetModal(true)}
          onOpenAssetDetails={(a) => setSelectedAssetDetails(a)}
          onSelectStrategy={(strat) => {
            setStrategy(strat as Strategy);
            setPage('Dashboard');
          }}
        />
      )}

      {/* Position Manage Modal */}
      {managingPosition && (
        <PositionManageModal
          position={managingPosition}
          onClose={() => setManagingPosition(null)}
          onTakeProfit={() => handleTakeProfit(managingPosition)}
          onRoll={() => handleRollPosition(managingPosition)}
          onRemove={() => handleRemovePosition(managingPosition)}
        />
      )}

      {/* New Position Modal */}
      {showNewPositionModal && (
        <NewPositionModal
          asset={asset}
          spotPrice={marketPrice}
          onClose={() => setShowNewPositionModal(false)}
          onSubmit={(newPos) => {
            setPositions((prev) => [newPos, ...prev]);
            setHistory((prev) => [
              {
                id: `hist-${Date.now()}`,
                date: 'Just now',
                activity: 'Opened',
                instrument: `${newPos.underlying} ${newPos.strategy} · ${newPos.expiry}`,
                amount: newPos.side === 'Buy' ? -newPos.entry : newPos.entry,
                status: 'Open',
              },
              ...prev,
            ]);
            setShowNewPositionModal(false);
            addToast(`New position opened: ${newPos.strategy} on ${newPos.underlying}!`);
          }}
        />
      )}

      {/* TradingView-Style Custom Strategy Studio */}
      {showTvStudio && (
        <TradingViewStudioModal
          asset={asset}
          spotPrice={marketPrice}
          onClose={() => setShowTvStudio(false)}
          onDeploy={handleDeployCustomStrategy}
        />
      )}

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <AddAssetModal
          existingAssets={watchlist.map((w) => w.asset)}
          onClose={() => setShowAddAssetModal(false)}
          onAdd={handleAddAssetToWatchlist}
        />
      )}

      {/* Asset Details Modal */}
      {selectedAssetDetails && (
        <AssetDetailsModal
          asset={selectedAssetDetails}
          spotPrice={assets[selectedAssetDetails]}
          onClose={() => setSelectedAssetDetails(null)}
          onTrade={() => {
            setAsset(selectedAssetDetails);
            setSelectedAssetDetails(null);
            setPage('Dashboard');
          }}
          onMarket={() => {
            setAsset(selectedAssetDetails);
            setSelectedAssetDetails(null);
            setPage('Market');
          }}
          onAnalytics={() => {
            setAsset(selectedAssetDetails);
            setSelectedAssetDetails(null);
            setPage('Analytics');
          }}
          onRemove={() => handleRemoveFromWatchlist(selectedAssetDetails)}
        />
      )}

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast-item success">
            <i>✓</i>
            <span>{t.msg}</span>
            <button onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>
    </main>
  );
}

function Dashboard({
  asset,
  setAsset,
  strategy,
  setStrategy,
  marketPrice,
  onOrderSubmit,
}: {
  asset: Asset;
  setAsset: (v: Asset) => void;
  strategy: Strategy;
  setStrategy: (v: Strategy) => void;
  marketPrice: number;
  onOrderSubmit: (side: 'Buy' | 'Sell', strike: number, premium: number, expiry: string) => void;
}) {
  const [expiry, setExpiry] = useState('2026-09-30');
  const [mode, setMode] = useState<'Market price' | 'Custom price'>('Market price');
  const [customPrice, setCustomPrice] = useState('');
  const invalidDate = expiry < today;
  const strike = Math.round((marketPrice * 1.02) / (marketPrice > 100 ? 10 : 0.1)) * (marketPrice > 100 ? 10 : 0.1);
  const premium = marketPrice * (strategy === 'Covered Call' ? 0.034 : strategy === 'Iron Condor' ? 0.014 : 0.027);
  const paths: Record<Strategy, string> = {
    'Bull Call Spread': 'M15 194 L145 194 L252 130 L420 83 L535 83',
    'Covered Call': 'M15 80 L145 80 L252 140 L420 194 L535 194',
    'Bear Put Spread': 'M15 80 L145 80 L252 140 L420 194 L535 194',
    'Iron Condor': 'M15 194 L130 194 L205 142 L345 142 L420 194 L535 194',
  };
  const path = paths[strategy];
  const points = path
    .match(/\d+/g)!
    .map(Number)
    .reduce<number[][]>((all, v, i, values) => (i % 2 ? [...all, [values[i - 1], v]] : all), []);

  const basePrice = assets[asset];
  const min = basePrice * 0.6;
  const max = basePrice * 1.3;
  const activePrice = mode === 'Market price' ? marketPrice : Number(customPrice || marketPrice);
  const shownPrice = mode === 'Market price' ? marketPrice : Number(customPrice || 0);

  // Map active price smoothly to X coordinate along the payoff line
  const priceRatio = basePrice > 0 ? (activePrice - basePrice) / basePrice : 0;
  const markerX = Math.max(15, Math.min(535, 312.14 + priceRatio * 2400));

  // Interpolate markerY precisely along the active strategy path
  let markerY = 121;
  if (points.length > 0) {
    if (markerX <= points[0][0]) {
      markerY = points[0][1];
    } else if (markerX >= points[points.length - 1][0]) {
      markerY = points[points.length - 1][1];
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[i + 1];
        if (markerX >= x0 && markerX <= x1) {
          markerY = x1 === x0 ? y0 : y0 + ((y1 - y0) * (markerX - x0)) / (x1 - x0);
          break;
        }
      }
    }
  }

  return (
    <section className="content">
      <header className="top">
        <div>
          <h1>Options Strategy Explorer</h1>
          <p>Live {asset} option-market data from Thetanuts Protocol.</p>
        </div>
      </header>
      <section className="selector">
        <Field label="Strategy">
          <select value={strategy} onChange={(e) => setStrategy(e.target.value as Strategy)}>
            {Object.keys(paths).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Field>
        <Field label="Asset">
          <select value={asset} onChange={(e) => setAsset(e.target.value as Asset)}>
            {Object.keys(assets).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Field>
        <div className="order-ticket">
          <Field label="Order price">
            <select value={mode} onChange={(e) => setMode(e.target.value as 'Market price' | 'Custom price')}>
              <option>Market price</option>
              <option>Custom price</option>
            </select>
          </Field>
          <Field label={mode === 'Market price' ? 'Latest market price' : 'Custom price'}>
            <input
              type="number"
              value={mode === 'Market price' ? marketPrice : customPrice}
              readOnly={mode === 'Market price'}
              onChange={(e) => setCustomPrice(e.target.value)}
              step="any"
            />
          </Field>
          <Field label="Expiry">
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            {invalidDate && (
              <small className="invalid">Invalid Date. Date must be today or later. Please choose again.</small>
            )}
          </Field>
          <div className="order-actions">
            <button
              className="sell"
              disabled={invalidDate}
              onClick={() => onOrderSubmit('Sell', strike, premium, expiry)}
            >
              Sell
            </button>
            <button
              className="buy"
              disabled={invalidDate}
              onClick={() => onOrderSubmit('Buy', strike, premium, expiry)}
            >
              Buy
            </button>
          </div>
        </div>
        <div className="facts">
          <Fact label="Strike Price" value={money(strike)} />
          <Fact label="Premium" value={money(premium)} />
          <Fact
            label="Expiry"
            value={new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(
              new Date(expiry + 'T12:00:00'),
            )}
          />
          <Fact label="Type" value="Call" />
          <Fact label="IV (30D)" value={assetProfiles[asset].atmIv} />
        </div>
      </section>
      <section className="dash">
        <section className="payoff">
          <header>
            <h2>Profit / Loss Payoff ⓘ</h2>
            <button>At Expiry⌄</button>
          </header>
          <div className="legend">
            <span className="profit">━ Profit</span>
            <span className="loss">━ Loss</span>
            <span>━ Breakeven</span>
            <span>┄ Strike Price</span>
          </div>
          <svg viewBox="0 0 550 245">
            <defs>
              <clipPath id="profit">
                <rect width="550" height="121" />
              </clipPath>
              <clipPath id="loss">
                <rect y="121" width="550" height="124" />
              </clipPath>
            </defs>
            <path
              className="grid"
              d="M35 20V222M135 20V222M235 20V222M335 20V222M435 20V222M535 20V222M35 20H535M35 70H535M35 121H535M35 171H535M35 222H535"
            />
            <path className="zero" d="M35 121H535" />
            <path className="strike" d="M335 20V222" />
            <path className="line profit-line" clipPath="url(#profit)" d={path} />
            <path className="line loss-line" clipPath="url(#loss)" d={path} />
            <circle
              className={'market-marker ' + (markerY > 121 ? 'loss-marker' : '')}
              cx={markerX}
              cy={markerY}
              r="5"
            >
              <title>
                Latest {asset} price: {money(shownPrice || marketPrice)}
              </title>
            </circle>
          </svg>
          <div className="axis">
            <span>{money(min)}</span>
            <span>{money(basePrice * 0.85)}</span>
            <span>{money(basePrice)}</span>
            <span>{money(basePrice * 1.15)}</span>
            <span>{money(max)}</span>
          </div>
        </section>
        <aside className="right">
          <section>
            <h2>Market Data</h2>
            <p className="asset">
              ◈ {asset} <small>/ USD</small>
            </p>
            <b className="price">{money(marketPrice)}</b>
            <em>+1.28% (24h)</em>
          </section>
          <section>
            <h2>Order preview</h2>
            <p>{mode === 'Market price' ? 'Latest price is used for this order.' : 'Custom price selected.'}</p>
            <b>{shownPrice ? money(shownPrice) : 'Enter a custom price'}</b>
          </section>
        </aside>
      </section>
    </section>
  );
}

function Detail({
  page,
  asset,
  onAssetChange,
  price,
  positions,
  history,
  realizedPnl,
  watchlist,
  onManagePosition,
  onOpenNewPosition,
  onOpenTvStudio,
  onExportCsv,
  onOpenAddAsset,
  onOpenAssetDetails,
  onSelectStrategy,
}: {
  page: Menu;
  asset: Asset;
  onAssetChange: (a: Asset) => void;
  price: number;
  positions: Position[];
  history: HistoryItem[];
  realizedPnl: number;
  watchlist: WatchlistItem[];
  onManagePosition: (pos: Position) => void;
  onOpenNewPosition: () => void;
  onOpenTvStudio: () => void;
  onExportCsv: () => void;
  onOpenAddAsset: () => void;
  onOpenAssetDetails: (a: Asset) => void;
  onSelectStrategy: (strat: string) => void;
}) {
  const title: Record<Exclude<Menu, 'Dashboard'>, string> = {
    Market: 'Market overview',
    Positions: 'Positions',
    Strategies: 'Strategy scanner',
    Analytics: 'Options analytics',
    History: 'Activity history',
    Watchlist: 'Watchlist',
  };

  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [strategyCategory, setStrategyCategory] = useState<StrategyCategory>('All strategies');

  // Dynamic portfolio calculations
  const totalUnrealizedPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const basePortfolioValue = 42681.2;
  const currentPortfolioValue = basePortfolioValue + totalUnrealizedPnl;

  const activeProfile = assetProfiles[asset];

  const stat = (label: string, value: string, delta: string, kind = 'positive') => (
    <article className="terminal-stat" key={label}>
      <span>{label}</span>
      <b>{value}</b>
      <small className={kind}>{delta}</small>
    </article>
  );

  const section = (heading: string, children: React.ReactNode, action?: string, onAction?: () => void) => (
    <section className="terminal-panel" key={heading}>
      <header>
        <div>
          <h2>{heading}</h2>
          <p>Updated moments ago</p>
        </div>
        {action && (
          <button className="terminal-button" onClick={onAction}>
            {action}
          </button>
        )}
      </header>
      {children}
    </section>
  );

  const optionRows = [
    ['27 Sep', '65,000', 'Call', '2,954', '58.4%', '+12.8%'],
    ['27 Sep', '70,000', 'Call', '1,732', '54.1%', '+8.5%'],
    ['4 Oct', '70,000', 'Put', '2,240', '55.8%', '−4.2%'],
    ['4 Oct', '75,000', 'Call', '1,216', '51.7%', '+6.1%'],
  ];

  const allStrategiesList = [
    {
      title: 'Bull call spread',
      category: 'Directional',
      type: 'Directional',
      return: '+42.8%',
      prob: '58% probability',
      detail: 'Buy 65K Call · Sell 70K Call',
    },
    {
      title: 'Iron condor',
      category: 'Income',
      type: 'Neutral income',
      return: '+18.6%',
      prob: '71% probability',
      detail: '60K / 63K / 73K / 76K',
    },
    {
      title: 'Cash-secured put',
      category: 'Income',
      type: 'Income',
      return: '+12.4%',
      prob: '76% probability',
      detail: 'Sell 62K Put · 23 DTE',
    },
    {
      title: 'Covered call',
      category: 'Income',
      type: 'Yield harvest',
      return: '+15.2%',
      prob: '74% probability',
      detail: `${asset} + Sell OTM Call · 16 DTE`,
    },
    {
      title: 'Bear put spread',
      category: 'Directional',
      type: 'Directional bear',
      return: '+38.5%',
      prob: '54% probability',
      detail: 'Buy ATM Put · Sell OTM Put',
    },
    {
      title: 'Long straddle',
      category: 'Volatility',
      type: 'Volatility breakout',
      return: '+95.0%',
      prob: '48% probability',
      detail: `Buy ${asset} ATM Call + Buy ATM Put`,
    },
    {
      title: 'Iron butterfly',
      category: 'Volatility',
      type: 'Range bound',
      return: '+32.0%',
      prob: '65% probability',
      detail: 'Buy OTM Put · Sell Straddle · Buy OTM Call',
    },
    {
      title: 'Protective collar',
      category: 'Hedging',
      type: 'Capital defense',
      return: '+14.8%',
      prob: '88% probability',
      detail: `Long ${asset} + Buy Protective Put + Sell Call`,
    },
    {
      title: 'Tail risk hedge',
      category: 'Hedging',
      type: 'Black swan hedge',
      return: '+450.0%',
      prob: '22% probability',
      detail: 'Buy Deep OTM Put · Low Cost Insurance',
    },
  ];

  const filteredStrategies = useMemo(() => {
    if (strategyCategory === 'All strategies') return allStrategiesList;
    return allStrategiesList.filter(
      (s) =>
        s.category.toLowerCase().includes(strategyCategory.toLowerCase().replace(' strategies', '')) ||
        s.type.toLowerCase().includes(strategyCategory.toLowerCase().replace(' strategies', '')),
    );
  }, [strategyCategory, asset]);

  let body: React.ReactNode;

  if (page === 'Market') {
    body = (
      <>
        <div className="terminal-stats">
          {stat('Spot price', money(price), '+1.28% today')}
          {stat('24h volume', activeProfile.volume, '+18.6% vs avg')}
          {stat('Open interest', activeProfile.openInterest, '+4.2% today')}
          {stat('ATM IV', activeProfile.atmIv, activeProfile.ivDelta, 'neutral')}
        </div>
        <div className="terminal-columns">
          {section(
            `${asset} / USD`,
            <RealMarketChart asset={asset} spotPrice={price} timeframe={timeframe} setTimeframe={setTimeframe} />,
          )}
          {section(
            'Market pulse',
            <div className="pulse-list">
              <p>
                <span>Put / Call ratio</span>
                <b>{activeProfile.putCallVol}</b>
                <em className="positive">Bullish</em>
              </p>
              <p>
                <span>Max pain</span>
                <b>{activeProfile.maxPain}</b>
                <em>Near spot</em>
              </p>
              <p>
                <span>Funding rate</span>
                <b>{activeProfile.fundingRate}</b>
                <em className="positive">Positive</em>
              </p>
              <p>
                <span>Skew (25Δ)</span>
                <b>{activeProfile.skew}</b>
                <em>Call bid</em>
              </p>
            </div>,
          )}
        </div>
        {section('Most active contracts', <MarketTable rows={optionRows} />, 'View chain')}
      </>
    );
  } else if (page === 'Positions') {
    body = (
      <>
        <div className="terminal-stats">
          {stat(
            'Portfolio value',
            money(currentPortfolioValue),
            totalUnrealizedPnl >= 0 ? `+${money(totalUnrealizedPnl)} open P&L` : `${money(totalUnrealizedPnl)} open P&L`,
          )}
          {stat(
            'Unrealized P&L',
            (totalUnrealizedPnl >= 0 ? '+' : '') + money(totalUnrealizedPnl),
            '+8.74%',
            totalUnrealizedPnl >= 0 ? 'positive' : 'negative',
          )}
          {stat('Portfolio delta', '0.38', 'Moderate long', 'neutral')}
          {stat('Margin utilization', '31.6%', 'Healthy', 'positive')}
        </div>
        {section(
          'Open positions',
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Expiry</th>
                <th>Contracts</th>
                <th>Entry</th>
                <th>Mark</th>
                <th>P&L</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#8899ac' }}>
                    No open positions currently. Click <b>New position</b> or trade from the Dashboard to open one.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => (
                  <tr key={pos.id}>
                    <td>
                      <b>{pos.strategy}</b>
                      <small>{pos.instrument}</small>
                    </td>
                    <td>{pos.expiry}</td>
                    <td>{pos.contracts}</td>
                    <td>{money(pos.entry)}</td>
                    <td>{money(pos.mark)}</td>
                    <td className={pos.pnl >= 0 ? 'positive' : 'negative'}>
                      {pos.pnl >= 0 ? '+' : ''}
                      {money(pos.pnl)}
                    </td>
                    <td>
                      <button className="row-action" onClick={() => onManagePosition(pos)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>,
          'New position',
          onOpenNewPosition,
        )}
        <div className="terminal-columns lower">
          {section('Risk exposure', <RiskBars greeksValues={activeProfile.greeks} />)}
          {section(
            'Upcoming events',
            <div className="event-list">
              <p>
                <b>27 Sep</b>
                <span>{asset} options expiry</span>
                <em>$12.6K notional</em>
              </p>
              <p>
                <b>4 Oct</b>
                <span>ETH options expiry</span>
                <em>$5.1K notional</em>
              </p>
              <p>
                <b>11 Oct</b>
                <span>BTC options expiry</span>
                <em>$7.8K notional</em>
              </p>
            </div>,
          )}
        </div>
      </>
    );
  } else if (page === 'Strategies') {
    body = (
      <>
        <div className="strategy-hero">
          <div>
            <span className="eyebrow-terminal">DISCOVER TRADE IDEAS</span>
            <h2>Find defined-risk opportunities</h2>
            <p>Screen liquid option structures using live volatility, probability, and payoff metrics.</p>
          </div>
          <button className="primary-terminal" onClick={onOpenTvStudio}>
            Build custom strategy
          </button>
        </div>
        <div className="strategy-filters">
          {(['All strategies', 'Income', 'Directional', 'Volatility', 'Hedging'] as StrategyCategory[]).map((cat) => (
            <button
              key={cat}
              className={strategyCategory === cat ? 'selected' : ''}
              onClick={() => setStrategyCategory(cat)}
            >
              {cat}
            </button>
          ))}
          <select value={asset} onChange={(e) => onAssetChange(e.target.value as Asset)}>
            {Object.keys(assets).map((a) => (
              <option key={a} value={a}>
                {a} · All expiries
              </option>
            ))}
          </select>
        </div>
        <div className="strategy-cards">
          {filteredStrategies.map((item) => (
            <StrategyCard
              key={item.title}
              title={item.title}
              type={item.type}
              return={item.return}
              prob={item.prob}
              detail={item.detail}
              onAnalyze={() => onSelectStrategy(item.title)}
            />
          ))}
        </div>
        {section('Scanner results', <MarketTable rows={optionRows} />, 'Refine filters')}
      </>
    );
  } else if (page === 'Analytics') {
    body = (
      <>
        <div className="terminal-stats">
          {stat('ATM implied volatility', activeProfile.atmIv, activeProfile.ivDelta, 'neutral')}
          {stat('IV rank', activeProfile.ivRank, 'Elevated regime', 'positive')}
          {stat('Expected move', activeProfile.expectedMove, `${activeProfile.expectedPct} to expiry`, 'neutral')}
          {stat('Put / call volume', activeProfile.putCallVol, 'Calls leading', 'positive')}
        </div>
        <div className="terminal-columns analytics-grid">
          {section(
            'Implied volatility term structure',
            <TermStructureChart asset={asset} profile={activeProfile} />,
          )}
          {section('Greeks snapshot', <RiskBars greeks greeksValues={activeProfile.greeks} />)}
        </div>
        {section(
          'Volatility surface',
          <div className="surface">
            <div className="surface-head">
              <span>Strike / Expiry</span>
              <b>7D</b>
              <b>14D</b>
              <b>30D</b>
              <b>60D</b>
            </div>
            {activeProfile.surfaceStrikes.map((strike, i) => (
              <div className="surface-row" key={strike}>
                <span>{strike}</span>
                {[0, 1, 2, 3].map((j) => (
                  <b key={j} style={{ opacity: 0.45 + ((i + j) % 4) * 0.15 }}>
                    {(parseFloat(activeProfile.atmIv) - 4 + i * 2 + j * 1.7).toFixed(1)}%
                  </b>
                ))}
              </div>
            ))}
          </div>,
        )}
      </>
    );
  } else if (page === 'History') {
    body = (
      <>
        <div className="history-head">
          <div className="terminal-stats">
            {stat('Total realized P&L', '+' + money(realizedPnl), 'Since inception')}
            {stat('Win rate', '68.4%', '13 of 19 closed')}
            {stat('Premium collected', '$14,826.00', 'All time')}
            {stat('Avg. holding period', '18 days', 'Disciplined')}
          </div>
        </div>
        {section(
          'Transaction history',
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Instrument</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>
                    <b
                      className={
                        item.activity === 'Opened' || item.activity === 'Closed' || item.activity === 'Deposit'
                          ? 'positive'
                          : 'negative'
                      }
                    >
                      {item.activity}
                    </b>
                  </td>
                  <td>{item.instrument}</td>
                  <td className={item.amount >= 0 ? 'positive' : ''}>
                    {item.amount >= 0 ? '+' : ''}
                    {money(item.amount)}
                  </td>
                  <td>
                    <span className={`status ${item.status === 'Open' ? 'open' : 'settled'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>•••</td>
                </tr>
              ))}
            </tbody>
          </table>,
          'Export CSV',
          onExportCsv,
        )}
      </>
    );
  } else {
    // Watchlist page
    body = (
      <>
        <div className="watchlist-top">
          <div>
            <span className="eyebrow-terminal">YOUR MARKET RADAR</span>
            <h2>Track the opportunities that matter.</h2>
          </div>
          <button className="primary-terminal" onClick={onOpenAddAsset}>
            + Add asset
          </button>
        </div>
        {section(
          'Saved assets',
          <table className="terminal-table watch-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Last price</th>
                <th>24h</th>
                <th>Implied vol.</th>
                <th>Volume</th>
                <th>Open interest</th>
                <th>Signal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((row) => (
                <tr key={row.asset}>
                  <td>
                    <b className="coin">◈ {row.asset}</b>
                    <small>/ USD</small>
                  </td>
                  <td>
                    <b>{money(row.price)}</b>
                  </td>
                  <td className={row.change24h[0] === '+' ? 'positive' : 'negative'}>{row.change24h}</td>
                  <td>{row.iv}</td>
                  <td>{row.volume}</td>
                  <td>{row.openInterest}</td>
                  <td>
                    <span className="signal">{row.signal}</span>
                  </td>
                  <td>
                    <button
                      className="row-action"
                      title="Inspect asset details"
                      onClick={() => onOpenAssetDetails(row.asset)}
                    >
                      •••
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>,
        )}
      </>
    );
  }

  return (
    <section className="content terminal-detail">
      <header className="top terminal-top">
        <div>
          <span className="eyebrow-terminal">THETANUTS FINANCE · BASE MAINNET</span>
          <h1>{title[page as Exclude<Menu, 'Dashboard'>]}</h1>
          <p>Professional options intelligence for your next decision.</p>
        </div>
        <div className="terminal-top-right">
          <span>
            <i />
            Live data
          </span>
          <select
            value={asset}
            onChange={(e) => onAssetChange(e.target.value as Asset)}
            className="terminal-asset-select"
            title="Switch active asset"
          >
            {Object.keys(assets).map((a) => (
              <option key={a} value={a}>
                {a} · USD ▾
              </option>
            ))}
          </select>
        </div>
      </header>
      {body}
    </section>
  );
}

// ALIGNED TERM STRUCTURE CHART FOR OPTIONS ANALYTICS (Picture 1)
function TermStructureChart({ asset, profile }: { asset: Asset; profile: AssetProfile }) {
  const [hoveredPoint, setHoveredPoint] = useState<{ tenor: string; iv: number; avg: number; x: number; y: number } | null>(
    null,
  );

  const width = 480;
  const height = 200;

  // Determine IV scale range
  const allIvs = profile.tenorPoints.flatMap((p) => [p.iv, p.avg]);
  const minIv = Math.min(...allIvs) - 5;
  const maxIv = Math.max(...allIvs) + 5;
  const ivRange = maxIv - minIv || 1;

  // Compute SVG Y coordinates for points
  const pointsWithY = profile.tenorPoints.map((p) => {
    const y = height - 30 - ((p.iv - minIv) / ivRange) * (height - 65);
    const avgY = height - 30 - ((p.avg - minIv) / ivRange) * (height - 65);
    return { ...p, y, avgY };
  });

  const ivPath = pointsWithY.reduce((acc, p, i) => (i === 0 ? `M${p.x} ${p.y}` : `${acc} L${p.x} ${p.y}`), '');
  const avgPath = pointsWithY.reduce((acc, p, i) => (i === 0 ? `M${p.x} ${p.avgY}` : `${acc} L${p.x} ${p.avgY}`), '');

  return (
    <>
      <div className="vol-key">
        <span>● {asset} ATM IV</span>
        <span>— 30-day average</span>
      </div>

      <div style={{ position: 'relative' }}>
        <svg className="vol-chart" viewBox={`0 0 ${width} ${height}`}>
          <path
            className="terminal-grid"
            d="M20 30H460M20 80H460M20 130H460M20 180H460"
          />
          {/* 30-day average line */}
          <path className="average-line" d={avgPath} />

          {/* Real IV Term Structure line */}
          <path className="terminal-line" d={ivPath} />

          {/* 5 Points aligned vertically with day labels */}
          {pointsWithY.map((p) => (
            <g
              key={p.tenor}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.tenor === p.tenor ? 7 : 5}
                fill="#8979ff"
                stroke="#d5d0ff"
                strokeWidth={hoveredPoint?.tenor === p.tenor ? 3 : 2}
              />
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
            </g>
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="chart-tooltip-box"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <span>
              {asset} {hoveredPoint.tenor} Expiry
            </span>
            <b>IV: {hoveredPoint.iv.toFixed(1)}%</b>
            <span style={{ color: '#8899ac' }}>30D Benchmark: {hoveredPoint.avg.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Axis Labels positioned directly under points */}
      <div className="axis-labels-aligned">
        <span>7D</span>
        <span>14D</span>
        <span>30D</span>
        <span>60D</span>
        <span>90D</span>
      </div>
    </>
  );
}

// REAL-WORLD MARKET CHART COMPONENT WITH 1D, 1W, 1M, 1Y
function RealMarketChart({
  asset,
  spotPrice,
  timeframe,
  setTimeframe,
}: {
  asset: Asset;
  spotPrice: number;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const dataset = useMemo(() => {
    if (timeframe === '1D') {
      const multipliers = [
        0.988, 0.987, 0.985, 0.984, 0.982, 0.981, 0.983, 0.986, 0.989, 0.992, 0.99, 0.988, 0.991, 0.994, 0.993, 0.991,
        0.995, 0.998, 0.996, 0.997, 0.998, 0.999, 0.999, 1.0,
      ];
      return multipliers.map((m, idx) => ({
        label: `${String(idx).padStart(2, '0')}:00`,
        price: spotPrice * m,
        change: ((m - multipliers[0]) / multipliers[0]) * 100,
      }));
    } else if (timeframe === '1W') {
      const multipliers = [
        0.942, 0.945, 0.938, 0.935, 0.94, 0.948, 0.952, 0.95, 0.956, 0.962, 0.965, 0.96, 0.958, 0.964, 0.97, 0.975,
        0.972, 0.968, 0.975, 0.982, 0.988, 0.985, 0.991, 0.994, 0.992, 0.996, 0.998, 1.0,
      ];
      return multipliers.map((m, idx) => ({
        label: `Day ${Math.floor(idx / 4) + 1}`,
        price: spotPrice * m,
        change: ((m - multipliers[0]) / multipliers[0]) * 100,
      }));
    } else if (timeframe === '1M') {
      const multipliers = [
        0.865, 0.862, 0.858, 0.864, 0.87, 0.875, 0.882, 0.879, 0.885, 0.892, 0.89, 0.898, 0.905, 0.912, 0.908, 0.915,
        0.922, 0.918, 0.925, 0.932, 0.94, 0.948, 0.945, 0.955, 0.965, 0.972, 0.98, 0.988, 0.995, 1.0,
      ];
      return multipliers.map((m, idx) => ({
        label: `Aug ${idx + 6}`,
        price: spotPrice * m,
        change: ((m - multipliers[0]) / multipliers[0]) * 100,
      }));
    } else {
      const multipliers = [
        0.458, 0.465, 0.482, 0.505, 0.52, 0.515, 0.535, 0.56, 0.585, 0.61, 0.605, 0.625, 0.65, 0.675, 0.66, 0.685,
        0.71, 0.735, 0.725, 0.75, 0.78, 0.81, 0.795, 0.825, 0.85, 0.875, 0.86, 0.885, 0.91, 0.935, 0.92, 0.945,
        0.965, 0.955, 0.975, 0.985, 0.978, 0.988, 0.995, 1.0,
      ];
      return multipliers.map((m, idx) => ({
        label: `Wk ${idx + 1}`,
        price: spotPrice * m,
        change: ((m - multipliers[0]) / multipliers[0]) * 100,
      }));
    }
  }, [timeframe, spotPrice]);

  const minPrice = Math.min(...dataset.map((d) => d.price));
  const maxPrice = Math.max(...dataset.map((d) => d.price));
  const range = maxPrice - minPrice || 1;

  const width = 720;
  const height = 210;

  const points = dataset.map((d, i) => {
    const x = (i / (dataset.length - 1)) * width;
    const y = height - 20 - ((d.price - minPrice) / range) * (height - 45);
    return [x, y];
  });

  const linePath = points.reduce((acc, [x, y], i) => (i === 0 ? `M${x} ${y}` : `${acc} L${x} ${y}`), '');
  const areaPath = `${linePath} L${width} ${height} L0 ${height} Z`;

  const activePoint = hoverIndex !== null ? dataset[hoverIndex] : dataset[dataset.length - 1];
  const activeCoord = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(width, ((e.clientX - rect.left) / rect.width) * width));
    const closestIdx = Math.round((mouseX / width) * (dataset.length - 1));
    setHoverIndex(closestIdx);
  };

  return (
    <>
      <div className="chart-toolbar">
        <b>{money(activePoint.price)}</b>
        <span className={activePoint.change >= 0 ? 'positive' : 'negative'}>
          ● {activePoint.change >= 0 ? '+' : ''}
          {activePoint.change.toFixed(2)}% ({timeframe})
        </span>
        <div>
          {(['1D', '1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
            <button key={tf} className={timeframe === tf ? 'selected' : ''} onClick={() => setTimeframe(tf)}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          className="terminal-chart"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          style={{ cursor: 'crosshair' }}
        >
          <defs>
            <linearGradient id="marketAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#7c6cff" stopOpacity="0.45" />
              <stop offset="1" stopColor="#7c6cff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            className="terminal-grid"
            d={`M0 35H${width}M0 87H${width}M0 139H${width}M0 191H${width}M90 0V${height}M270 0V${height}M450 0V${height}M630 0V${height}`}
          />
          <path fill="url(#marketAreaGradient)" d={areaPath} />
          <path className="terminal-line" d={linePath} />

          {activeCoord && (
            <>
              <line
                x1={activeCoord[0]}
                y1={0}
                x2={activeCoord[0]}
                y2={height}
                stroke="#9a8cff"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <circle
                cx={activeCoord[0]}
                cy={activeCoord[1]}
                r="5"
                fill="#7c6cff"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {hoverIndex !== null && activeCoord && (
          <div
            className="chart-tooltip-box"
            style={{
              left: `${(activeCoord[0] / width) * 100}%`,
              top: `${(activeCoord[1] / height) * 100}%`,
            }}
          >
            <span>
              {asset} · {activePoint.label}
            </span>
            <b>{money(activePoint.price)}</b>
            <span className={activePoint.change >= 0 ? 'positive' : 'negative'}>
              {activePoint.change >= 0 ? '+' : ''}
              {activePoint.change.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// POSITION MANAGEMENT MODAL
function PositionManageModal({
  position,
  onClose,
  onTakeProfit,
  onRoll,
  onRemove,
}: {
  position: Position;
  onClose: () => void;
  onTakeProfit: () => void;
  onRoll: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="trading-modal-overlay" onClick={onClose}>
      <div className="trading-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trading-modal-header">
          <h3>
            <i>◈</i> Manage Position · {position.strategy}
          </h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="trading-modal-body">
          <div className="modal-badge">
            <i />
            Base OptionBook Protocol · Verified Active Order
          </div>
          <div className="details-grid">
            <div>
              <span>Instrument</span>
              <b>{position.instrument}</b>
            </div>
            <div>
              <span>Expiry</span>
              <b>{position.expiry}</b>
            </div>
            <div>
              <span>Contracts</span>
              <b>
                {position.contracts} ({position.side})
              </b>
            </div>
            <div>
              <span>Collateral</span>
              <b>{position.collateral}</b>
            </div>
            <div>
              <span>Entry Price</span>
              <b>{money(position.entry)}</b>
            </div>
            <div>
              <span>Current Mark</span>
              <b>{money(position.mark)}</b>
            </div>
            <div>
              <span>Unrealized P&L</span>
              <b className={position.pnl >= 0 ? 'positive' : 'negative'}>
                {position.pnl >= 0 ? '+' : ''}
                {money(position.pnl)}
              </b>
            </div>
            <div>
              <span>Settlement Engine</span>
              <b>Thetanuts V3</b>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#8ca1b9', lineHeight: 1.5, margin: '12px 0 0' }}>
            Take profit executes an instantaneous close on Base OptionBook, returning collateral and booking net profit
            to your portfolio.
          </p>

          <div className="modal-actions">
            <button className="modal-btn-success" onClick={onTakeProfit}>
              Take Profit ({position.pnl >= 0 ? '+' : ''}
              {money(position.pnl)})
            </button>
            <button className="modal-btn-secondary" onClick={onRoll}>
              Roll Expiry (+14D)
            </button>
            <button className="modal-btn-danger" style={{ gridColumn: '1 / -1' }} onClick={onRemove}>
              Close & Cancel Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// OPEN NEW POSITION MODAL
function NewPositionModal({
  asset,
  spotPrice,
  onClose,
  onSubmit,
}: {
  asset: Asset;
  spotPrice: number;
  onClose: () => void;
  onSubmit: (pos: Position) => void;
}) {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(asset);
  const [strategyName, setStrategyName] = useState('Bull call spread');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [contracts, setContracts] = useState(1);
  const [expiry, setExpiry] = useState('2026-10-15');

  const strikeEst = Math.round(spotPrice * 1.03);
  const premiumEst = Math.round(spotPrice * 0.025 * contracts);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      strategy: strategyName,
      underlying: selectedAsset,
      instrument: `${selectedAsset} ${Math.round(strikeEst / 1000)}K ${strategyName.includes('Put') ? 'Put' : 'Call'}`,
      expiry: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(expiry + 'T12:00:00'),
      ),
      contracts,
      entry: premiumEst,
      mark: premiumEst,
      pnl: 0,
      side,
      collateral: 'USDC',
      status: 'Open',
    };
    onSubmit(newPos);
  };

  return (
    <div className="trading-modal-overlay" onClick={onClose}>
      <div className="trading-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trading-modal-header">
          <h3>
            <i>+</i> Open New Options Position
          </h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="trading-modal-body" onSubmit={handleSubmit}>
          <div className="modal-badge">
            <i />
            Base Mainnet (8453) · Live Pricing
          </div>

          <Field label="Underlying Asset">
            <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value as Asset)}>
              {Object.keys(assets).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>

          <Field label="Strategy">
            <select value={strategyName} onChange={(e) => setStrategyName(e.target.value)}>
              <option>Bull call spread</option>
              <option>Covered call</option>
              <option>Bear put spread</option>
              <option>Iron condor</option>
              <option>Cash-secured put</option>
              <option>Long Straddle</option>
            </select>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <Field label="Side">
              <select value={side} onChange={(e) => setSide(e.target.value as 'Buy' | 'Sell')}>
                <option value="Buy">Buy (Long)</option>
                <option value="Sell">Sell (Short)</option>
              </select>
            </Field>

            <Field label="Contracts">
              <input
                type="number"
                min="1"
                max="50"
                value={contracts}
                onChange={(e) => setContracts(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </Field>
          </div>

          <Field label="Expiry Date">
            <input type="date" value={expiry} min={today} onChange={(e) => setExpiry(e.target.value)} />
          </Field>

          <div className="details-grid">
            <div>
              <span>Estimated Strike</span>
              <b>{money(strikeEst)}</b>
            </div>
            <div>
              <span>Total Premium</span>
              <b>{money(premiumEst)}</b>
            </div>
            <div>
              <span>Collateral Token</span>
              <b>Native USDC</b>
            </div>
            <div>
              <span>Execution Path</span>
              <b>Base OptionBook</b>
            </div>
          </div>

          <button type="submit" className="modal-btn-success" style={{ width: '100%', marginTop: '16px' }}>
            Submit Order to OptionBook
          </button>
        </form>
      </div>
    </div>
  );
}

// WATCHLIST: ADD ASSET MODAL (Picture 3)
function AddAssetModal({
  existingAssets,
  onClose,
  onAdd,
}: {
  existingAssets: Asset[];
  onClose: () => void;
  onAdd: (a: Asset) => void;
}) {
  const availableToAdd = (Object.keys(assets) as Asset[]).filter((a) => !existingAssets.includes(a));

  return (
    <div className="trading-modal-overlay" onClick={onClose}>
      <div className="trading-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trading-modal-header">
          <h3>
            <i>+</i> Add Asset to Market Radar
          </h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="trading-modal-body">
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#9bb0c9' }}>
            Select an asset to track live prices, options liquidity, and volatility metrics on Base:
          </p>

          {availableToAdd.length === 0 ? (
            <p style={{ color: '#7e93ab', textAlign: 'center', padding: '24px 0' }}>
              All supported protocol assets are already on your watchlist!
            </p>
          ) : (
            <div className="asset-select-list">
              {availableToAdd.map((a) => {
                const p = assetProfiles[a];
                return (
                  <div key={a} className="asset-select-row">
                    <div>
                      <b>
                        ◈ {a} · {p.name}
                      </b>
                      <small>
                        Spot: {money(assets[a])} · IV: {p.atmIv} · {p.signal}
                      </small>
                    </div>
                    <button
                      className="modal-btn-success"
                      style={{ padding: '7px 13px', fontSize: '12px' }}
                      onClick={() => onAdd(a)}
                    >
                      + Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// WATCHLIST: TRIPLE-DOTS ASSET DETAILS MODAL (Picture 3)
function AssetDetailsModal({
  asset,
  spotPrice,
  onClose,
  onTrade,
  onMarket,
  onAnalytics,
  onRemove,
}: {
  asset: Asset;
  spotPrice: number;
  onClose: () => void;
  onTrade: () => void;
  onMarket: () => void;
  onAnalytics: () => void;
  onRemove: () => void;
}) {
  const profile = assetProfiles[asset];

  return (
    <div className="trading-modal-overlay" onClick={onClose}>
      <div className="trading-modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="trading-modal-header">
          <h3>
            <i>◈</i> {profile.name} ({asset} / USD) · Intelligence
          </h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="trading-modal-body">
          <div className="modal-badge">
            <i />
            Base Mainnet (8453) · Live Protocol Orderbook Active
          </div>

          <div className="details-grid">
            <div>
              <span>Spot Price</span>
              <b>{money(spotPrice)}</b>
            </div>
            <div>
              <span>24h Sentiment</span>
              <b style={{ color: '#55db82' }}>{profile.signal}</b>
            </div>
            <div>
              <span>30D ATM IV</span>
              <b>{profile.atmIv}</b>
            </div>
            <div>
              <span>IV Rank</span>
              <b>{profile.ivRank} / 100</b>
            </div>
            <div>
              <span>Expected Move</span>
              <b>
                {profile.expectedMove} ({profile.expectedPct})
              </b>
            </div>
            <div>
              <span>Put / Call Volume</span>
              <b>{profile.putCallVol}</b>
            </div>
            <div>
              <span>24h Options Volume</span>
              <b>{profile.volume}</b>
            </div>
            <div>
              <span>Open Interest</span>
              <b>{profile.openInterest}</b>
            </div>
            <div>
              <span>Options Max Pain</span>
              <b>{profile.maxPain}</b>
            </div>
            <div>
              <span>Perp Funding Rate</span>
              <b>{profile.fundingRate}</b>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
            <button className="modal-btn-success" onClick={onTrade}>
              Trade on Dashboard
            </button>
            <button className="modal-btn-secondary" onClick={onMarket}>
              Market Charts
            </button>
            <button className="modal-btn-secondary" onClick={onAnalytics}>
              Volatility Surface
            </button>
          </div>

          <button
            className="modal-btn-danger"
            style={{ width: '100%', marginTop: '10px' }}
            onClick={onRemove}
          >
            Remove {asset} from Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}

// TRADINGVIEW-STYLE CUSTOM STRATEGY BUILDER STUDIO
function TradingViewStudioModal({
  asset,
  spotPrice,
  onClose,
  onDeploy,
}: {
  asset: Asset;
  spotPrice: number;
  onClose: () => void;
  onDeploy: (pos: Position) => void;
}) {
  const [strategyName, setStrategyName] = useState('Custom Multi-Leg Strategy');
  const [legs, setLegs] = useState<OptionLeg[]>([
    {
      id: 'leg-1',
      type: 'Call',
      side: 'Buy',
      strike: Math.round(spotPrice * 0.98),
      contracts: 1,
      premium: Math.round(spotPrice * 0.038),
    },
    {
      id: 'leg-2',
      type: 'Call',
      side: 'Sell',
      strike: Math.round(spotPrice * 1.04),
      contracts: 1,
      premium: Math.round(spotPrice * 0.016),
    },
  ]);

  const [hoverEvalPrice, setHoverEvalPrice] = useState<number | null>(null);
  const canvasRef = useRef<SVGSVGElement | null>(null);

  const addLeg = (type: 'Call' | 'Put', side: 'Buy' | 'Sell') => {
    const defaultStrike =
      type === 'Call'
        ? side === 'Buy'
          ? Math.round(spotPrice * 0.99)
          : Math.round(spotPrice * 1.05)
        : side === 'Buy'
        ? Math.round(spotPrice * 1.01)
        : Math.round(spotPrice * 0.95);

    const defaultPrem = Math.round(spotPrice * (type === 'Call' ? 0.024 : 0.022));

    const newLeg: OptionLeg = {
      id: `leg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      side,
      strike: defaultStrike,
      contracts: 1,
      premium: defaultPrem,
    };
    setLegs((prev) => [...prev, newLeg]);
  };

  const removeLeg = (id: string) => {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLeg = (id: string, field: keyof OptionLeg, val: any) => {
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
  };

  const evaluatePnl = (price: number) => {
    return legs.reduce((total, leg) => {
      let intrinsic = 0;
      if (leg.type === 'Call') {
        intrinsic = Math.max(0, price - leg.strike);
      } else {
        intrinsic = Math.max(0, leg.strike - price);
      }

      const legPnl =
        leg.side === 'Buy'
          ? (intrinsic - leg.premium) * leg.contracts
          : (leg.premium - intrinsic) * leg.contracts;

      return total + legPnl;
    }, 0);
  };

  const minPrice = spotPrice * 0.75;
  const maxPrice = spotPrice * 1.25;
  const numSteps = 70;
  const priceStep = (maxPrice - minPrice) / numSteps;

  const pointsData = Array.from({ length: numSteps + 1 }, (_, i) => {
    const p = minPrice + i * priceStep;
    const pnl = evaluatePnl(p);
    return { price: p, pnl };
  });

  const pnls = pointsData.map((d) => d.pnl);
  const maxPnl = Math.max(...pnls, 100);
  const minPnl = Math.min(...pnls, -100);
  const pnlRange = maxPnl - minPnl || 1;

  const canvasWidth = 660;
  const canvasHeight = 280;

  const zeroY = canvasHeight - 20 - ((0 - minPnl) / pnlRange) * (canvasHeight - 40);

  const svgPoints = pointsData.map((d) => {
    const x = ((d.price - minPrice) / (maxPrice - minPrice)) * canvasWidth;
    const y = canvasHeight - 20 - ((d.pnl - minPnl) / pnlRange) * (canvasHeight - 40);
    return [x, y];
  });

  const curvePath = svgPoints.reduce((acc, [x, y], i) => (i === 0 ? `M${x} ${y}` : `${acc} L${x} ${y}`), '');

  const netDelta = legs.reduce((acc, l) => {
    const sign = l.side === 'Buy' ? 1 : -1;
    const baseDelta = l.type === 'Call' ? 0.52 : -0.48;
    return acc + sign * baseDelta * l.contracts;
  }, 0);

  const netTheta = legs.reduce((acc, l) => {
    const sign = l.side === 'Buy' ? -1 : 1;
    return acc + sign * 32 * l.contracts;
  }, 0);

  const netVega = legs.reduce((acc, l) => {
    const sign = l.side === 'Buy' ? 1 : -1;
    return acc + sign * 85 * l.contracts;
  }, 0);

  const spotX = ((spotPrice - minPrice) / (maxPrice - minPrice)) * canvasWidth;

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(canvasWidth, ((e.clientX - rect.left) / rect.width) * canvasWidth));
    const priceAtMouse = minPrice + (mouseX / canvasWidth) * (maxPrice - minPrice);
    setHoverEvalPrice(priceAtMouse);
  };

  const hoveredPnl = hoverEvalPrice !== null ? evaluatePnl(hoverEvalPrice) : evaluatePnl(spotPrice);
  const hoveredX =
    hoverEvalPrice !== null
      ? ((hoverEvalPrice - minPrice) / (maxPrice - minPrice)) * canvasWidth
      : spotX;
  const hoveredY =
    canvasHeight - 20 - ((hoveredPnl - minPnl) / pnlRange) * (canvasHeight - 40);

  const totalCost = legs.reduce(
    (acc, l) => acc + (l.side === 'Buy' ? l.premium * l.contracts : -l.premium * l.contracts),
    0,
  );

  return (
    <div className="tv-studio-overlay" onClick={onClose}>
      <div className="tv-studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tv-studio-top">
          <h2>
            <span>Thetanuts Strategy Studio</span>
            <small>TradingView Interactive Payoff Engine · Base Chain</small>
          </h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="tv-studio-grid">
          <div className="tv-chart-pane">
            <div className="tv-toolbar">
              <span style={{ fontSize: '13px', color: '#a6b5c9' }}>
                Underlying: <b>{asset} Spot: {money(spotPrice)}</b>
              </span>
              <span style={{ fontSize: '12px', color: hoveredPnl >= 0 ? '#6fe195' : '#ff7a7a' }}>
                Cursor P&L: <b>{hoveredPnl >= 0 ? '+' : ''}{money(hoveredPnl)}</b>
              </span>
            </div>

            <div className="tv-canvas-container">
              <svg
                ref={canvasRef}
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                preserveAspectRatio="none"
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setHoverEvalPrice(null)}
              >
                <defs>
                  <clipPath id="profitZone">
                    <rect x="0" y="0" width={canvasWidth} height={zeroY} />
                  </clipPath>
                  <clipPath id="lossZone">
                    <rect x="0" y={zeroY} width={canvasWidth} height={canvasHeight - zeroY} />
                  </clipPath>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#22c55e" stopOpacity="0.32" />
                    <stop offset="1" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lossGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop stopColor="#ef4444" stopOpacity="0.32" />
                    <stop offset="1" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  stroke="#16253c"
                  strokeWidth="1"
                  d={`M0 50H${canvasWidth}M0 110H${canvasWidth}M0 170H${canvasWidth}M0 230H${canvasWidth}M110 0V${canvasHeight}M220 0V${canvasHeight}M330 0V${canvasHeight}M440 0V${canvasHeight}M550 0V${canvasHeight}`}
                />

                <path
                  fill="url(#profitGrad)"
                  clipPath="url(#profitZone)"
                  d={`${curvePath} L${canvasWidth} ${zeroY} L0 ${zeroY} Z`}
                />
                <path
                  fill="url(#lossGrad)"
                  clipPath="url(#lossZone)"
                  d={`${curvePath} L${canvasWidth} ${zeroY} L0 ${zeroY} Z`}
                />

                <line
                  x1="0"
                  y1={zeroY}
                  x2={canvasWidth}
                  y2={zeroY}
                  stroke="#68798e"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />

                <line
                  x1={spotX}
                  y1="0"
                  x2={spotX}
                  y2={canvasHeight}
                  stroke="#a78bfa"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />

                {legs.map((l) => {
                  const lx = ((l.strike - minPrice) / (maxPrice - minPrice)) * canvasWidth;
                  return (
                    <g key={l.id}>
                      <line
                        x1={lx}
                        y1="10"
                        x2={lx}
                        y2={canvasHeight}
                        stroke={l.type === 'Call' ? '#38bdf8' : '#f472b6'}
                        strokeDasharray="2 3"
                        strokeWidth="1"
                      />
                      <text x={lx + 4} y="22" fill="#8cb1d5" fontSize="10" fontFamily="DM Mono">
                        {Math.round(l.strike / 1000)}k {l.type[0]}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={curvePath}
                  fill="none"
                  stroke="#7c6cff"
                  strokeWidth="3"
                  filter="drop-shadow(0 0 6px rgba(124, 108, 255, 0.6))"
                />

                {hoveredX !== null && (
                  <>
                    <line
                      x1={hoveredX}
                      y1="0"
                      x2={hoveredX}
                      y2={canvasHeight}
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={hoveredX}
                      cy={hoveredY}
                      r="5"
                      fill={hoveredPnl >= 0 ? '#4ade80' : '#f87171'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#7f91a5',
                marginTop: '6px',
                fontFamily: 'DM Mono',
              }}
            >
              <span>{money(minPrice)}</span>
              <span style={{ color: '#a78bfa' }}>Spot: {money(spotPrice)}</span>
              <span>{money(maxPrice)}</span>
            </div>

            <div className="tv-greeks-panel">
              <h4>Live Portfolio Greeks (BSM Model)</h4>
              <div className="tv-greeks-grid">
                <article>
                  <span>Delta (Δ)</span>
                  <b style={{ color: netDelta >= 0 ? '#4ade80' : '#f87171' }}>
                    {netDelta >= 0 ? '+' : ''}
                    {netDelta.toFixed(2)}
                  </b>
                </article>
                <article>
                  <span>Gamma (Γ)</span>
                  <b>+0.0042</b>
                </article>
                <article>
                  <span>Theta (Θ)</span>
                  <b style={{ color: netTheta >= 0 ? '#4ade80' : '#f87171' }}>
                    {netTheta >= 0 ? '+' : ''}
                    {netTheta.toFixed(1)}/d
                  </b>
                </article>
                <article>
                  <span>Vega (V)</span>
                  <b>+{netVega.toFixed(1)}/pt</b>
                </article>
              </div>
            </div>
          </div>

          <div className="tv-sidebar-pane">
            <Field label="Strategy Label">
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                style={{ fontSize: '13px' }}
              />
            </Field>

            <div className="tv-legs-header">
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#c7d6e8' }}>Option Legs ({legs.length})</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  style={{
                    background: '#162b48',
                    border: '1px solid #2d4567',
                    color: '#89c1ff',
                    fontSize: '10px',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => addLeg('Call', 'Buy')}
                >
                  + Call
                </button>
                <button
                  style={{
                    background: '#331e2b',
                    border: '1px solid #633350',
                    color: '#ff9ec9',
                    fontSize: '10px',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => addLeg('Put', 'Buy')}
                >
                  + Put
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '280px' }}>
              {legs.map((leg) => (
                <div className="tv-leg-card" key={leg.id}>
                  <header>
                    <b>
                      {leg.side === 'Buy' ? '🟢 Long' : '🔴 Short'} {leg.type}
                    </b>
                    <button
                      onClick={() => removeLeg(leg.id)}
                      style={{
                        background: 'none',
                        border: 0,
                        color: '#6e8095',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      ✕
                    </button>
                  </header>
                  <div className="tv-leg-controls">
                    <div>
                      <label>Strike</label>
                      <input
                        type="number"
                        value={leg.strike}
                        step="250"
                        onChange={(e) => updateLeg(leg.id, 'strike', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label>Contracts</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={leg.contracts}
                        onChange={(e) => updateLeg(leg.id, 'contracts', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label>Premium</label>
                      <input
                        type="number"
                        value={leg.premium}
                        step="50"
                        onChange={(e) => updateLeg(leg.id, 'premium', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="tv-metrics-summary">
              <div>
                <span>Max Profit</span>
                <b>{maxPnl > 50000 ? 'Unlimited' : money(maxPnl)}</b>
              </div>
              <div>
                <span>Max Loss</span>
                <b style={{ color: '#ff7373' }}>{money(minPnl)}</b>
              </div>
              <div>
                <span>Net Debit</span>
                <b>{money(totalCost)}</b>
              </div>
            </div>

            <button
              className="tv-submit-btn"
              onClick={() => {
                const newPos: Position = {
                  id: `pos-${Date.now()}`,
                  strategy: strategyName,
                  underlying: asset,
                  instrument: `${asset} Custom (${legs.length} legs)`,
                  expiry: '30 Oct 2026',
                  contracts: 1,
                  entry: Math.abs(totalCost),
                  mark: Math.abs(totalCost),
                  pnl: 0,
                  side: totalCost >= 0 ? 'Buy' : 'Sell',
                  collateral: 'USDC',
                  status: 'Open',
                };
                onDeploy(newPos);
              }}
            >
              Deploy & Add to Positions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketTable({ rows }: { rows: string[][] }) {
  return (
    <table className="terminal-table compact">
      <thead>
        <tr>
          <th>Expiry</th>
          <th>Strike</th>
          <th>Type</th>
          <th>Premium</th>
          <th>IV</th>
          <th>24h change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join('')}>
            <td>{row[0]}</td>
            <td>
              <b>${row[1]}</b>
            </td>
            <td>
              <span className={row[2] === 'Call' ? 'call-tag' : 'put-tag'}>{row[2]}</span>
            </td>
            <td>${row[3]}</td>
            <td>{row[4]}</td>
            <td className={row[5][0] === '+' ? 'positive' : 'negative'}>{row[5]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RiskBars({ greeks = false, greeksValues }: { greeks?: boolean; greeksValues?: [string, string, number][] }) {
  const defaultValues: [string, string, number][] = greeks
    ? [
        ['Delta', '0.38', 38],
        ['Gamma', '0.0048', 24],
        ['Theta', '−$64.20', 66],
        ['Vega', '$182.10', 52],
      ]
    : [
        ['Delta exposure', 'Moderate long', 62],
        ['Theta decay', '+$64.20 / day', 72],
        ['Vega exposure', 'Balanced', 45],
        ['Max loss at risk', '$7,821', 36],
      ];

  const values = greeksValues || defaultValues;

  return (
    <div className="risk-bars">
      {values.map(([name, value, width]) => (
        <p key={name as string}>
          <span>{name}</span>
          <b>{value}</b>
          <i>
            <em style={{ width: `${width}%` }} />
          </i>
        </p>
      ))}
    </div>
  );
}

function StrategyCard({
  title,
  type,
  return: yieldValue,
  prob,
  detail,
  onAnalyze,
}: {
  title: string;
  type: string;
  return: string;
  prob: string;
  detail: string;
  onAnalyze?: () => void;
}) {
  return (
    <article className="strategy-card">
      <div>
        <span>{type}</span>
        <button>•••</button>
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <div className="strategy-metrics">
        <b>
          {yieldValue}
          <small>Max return</small>
        </b>
        <b>
          {prob}
          <small>Profit probability</small>
        </b>
      </div>
      <button className="strategy-action" onClick={onAnalyze}>
        Analyze strategy →
      </button>
    </article>
  );
}

function Sidebar({ page, setPage }: { page: Menu; setPage: (x: Menu) => void }) {
  return (
    <aside className="side" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="logo">
        <img
          className="brand-mark"
          src="https://pbs.twimg.com/profile_images/1972581936314138624/MdNakWZA.jpg"
          alt="Thetanuts Finance"
        />
        <div>
          <b>THETANUTS</b>
          <small>Options Strategy Explorer</small>
        </div>
      </div>
      <nav>
        {menu.map((item) => (
          <button key={item} className={page === item ? 'active' : ''} onClick={() => setPage(item)}>
            <i>{menuIcons[item]}</i>
            <span>{item}</span>
          </button>
        ))}
      </nav>
      <p className="base" style={{ marginTop: 'auto' }}>
        Built on
        <br />
        <strong>● BASE</strong>
      </p>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
