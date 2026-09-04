'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PayoffProps {
  strikePrice: number;
  premium: number;
}

const dollar = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** A simple, clearly labelled short-call illustration used in presentation mode. */
export function PayoffChart({ strikePrice, premium }: PayoffProps) {
  const safeStrike = Number.isFinite(strikePrice) && strikePrice > 0 ? strikePrice : 3000;
  const safePremium = Math.max(0, premium);
  const data = Array.from({ length: 13 }, (_, index) => {
    const price = Math.round((safeStrike * (0.84 + index * 0.027)) / 25) * 25;
    return { price, pnl: Number((safePremium - Math.max(0, price - safeStrike)).toFixed(2)) };
  });
  const minPnl = Math.min(...data.map((point) => point.pnl));

  return (
    <div className="rounded-2xl border border-emerald-900/15 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Illustrative payoff at expiry</p>
          <p className="mt-1 text-xs text-slate-500">Short-call example · premium received: {dollar.format(safePremium)}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Demo only</span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 6, left: 8 }}>
            <CartesianGrid stroke="#dbe9e5" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="price" type="number" domain={[data[0].price, data[data.length - 1].price]} tickCount={5} tickFormatter={(value) => dollar.format(value)} stroke="#70817c" fontSize={11} tickLine={false} axisLine={{ stroke: '#b8cbc5' }} />
            <YAxis domain={[Math.min(minPnl, 0), Math.max(safePremium, 1)]} tickFormatter={(value) => dollar.format(value)} stroke="#70817c" fontSize={11} tickLine={false} axisLine={{ stroke: '#b8cbc5' }} width={56} />
            <Tooltip formatter={(value) => [dollar.format(Number(value)), 'P/L']} labelFormatter={(value) => `ETH price: ${dollar.format(Number(value))}`} contentStyle={{ background: '#ffffff', border: '1px solid #b8d9d0', borderRadius: 10, color: '#153d34' }} />
            <ReferenceLine y={0} stroke="#d55050" strokeDasharray="4 4" />
            <ReferenceLine x={safeStrike} stroke="#087d69" strokeDasharray="4 4" label={{ value: `Strike ${dollar.format(safeStrike)}`, position: 'insideTopRight', fill: '#087d69', fontSize: 11 }} />
            <Line type="linear" dataKey="pnl" stroke="#0b9c83" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: '#087d69' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Above the strike, upside is capped in this illustrative short-call scenario. A live order preview is the source of truth before any trade.</p>
    </div>
  );
}
