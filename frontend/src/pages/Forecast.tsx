import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

type Scenario = 'Baseline' | 'Stress' | 'Recovery'

const scenarios: Record<Scenario, {
  color: string
  fillColor: string
  data: { month: string; prob: number; lower: number; upper: number }[]
  assumptions: string[]
  conclusion: string
}> = {
  Baseline: {
    color: '#3B82F6',
    fillColor: 'rgba(59,130,246,0.15)',
    data: [
      { month: 'Aug 2026', prob: 32, lower: 24, upper: 41 },
      { month: 'Sep 2026', prob: 34, lower: 25, upper: 44 },
      { month: 'Oct 2026', prob: 33, lower: 23, upper: 45 },
      { month: 'Nov 2026', prob: 31, lower: 21, upper: 43 },
      { month: 'Dec 2026', prob: 29, lower: 19, upper: 41 },
      { month: 'Jan 2027', prob: 27, lower: 17, upper: 39 },
      { month: 'Feb 2027', prob: 26, lower: 16, upper: 38 },
      { month: 'Mar 2027', prob: 24, lower: 14, upper: 36 },
    ],
    assumptions: [
      'RBI holds repo rate at 6.25% through Q4 2026',
      'Global commodity prices remain range-bound',
      'Monsoon 2026 ends near normal (-4% LPA)',
      'Export growth recovers modestly to +3% YoY',
      'Fiscal deficit maintained near 5.1% of GDP',
      'Credit growth stabilizes at 10–12% annually',
    ],
    conclusion: 'Under baseline conditions, recession probability remains in the Watch zone (30–35%) through H2 2026, gradually declining as credit normalizes and the yield curve steepens. No recession is the central case, but uncertainty bands remain wide given global headwinds.',
  },
  Stress: {
    color: '#EF4444',
    fillColor: 'rgba(239,68,68,0.15)',
    data: [
      { month: 'Aug 2026', prob: 32, lower: 24, upper: 41 },
      { month: 'Sep 2026', prob: 44, lower: 33, upper: 57 },
      { month: 'Oct 2026', prob: 58, lower: 45, upper: 71 },
      { month: 'Nov 2026', prob: 67, lower: 54, upper: 80 },
      { month: 'Dec 2026', prob: 72, lower: 60, upper: 84 },
      { month: 'Jan 2027', prob: 74, lower: 62, upper: 86 },
      { month: 'Feb 2027', prob: 71, lower: 59, upper: 83 },
      { month: 'Mar 2027', prob: 68, lower: 56, upper: 80 },
    ],
    assumptions: [
      'US Federal Reserve resumes rate hikes (+75 bps)',
      'Brent crude spikes above $120/barrel',
      'Capital outflow from emerging markets intensifies',
      'INR depreciates past ₹90/USD',
      'India export contraction of -15% or worse',
      'Government forced into fiscal contraction measures',
    ],
    conclusion: 'Under a stress scenario combining external shocks — oil spike, EM capital flight, and a hawkish Fed — India\'s recession probability crosses the Alert threshold (60%) by October 2026. This represents a tail risk, not the central case, but policymakers should prepare contingency measures now.',
  },
  Recovery: {
    color: '#22C55E',
    fillColor: 'rgba(34,197,94,0.15)',
    data: [
      { month: 'Aug 2026', prob: 32, lower: 24, upper: 41 },
      { month: 'Sep 2026', prob: 26, lower: 17, upper: 36 },
      { month: 'Oct 2026', prob: 21, lower: 13, upper: 31 },
      { month: 'Nov 2026', prob: 17, lower: 10, upper: 26 },
      { month: 'Dec 2026', prob: 15, lower: 8, upper: 24 },
      { month: 'Jan 2027', prob: 13, lower: 7, upper: 22 },
      { month: 'Feb 2027', prob: 12, lower: 6, upper: 20 },
      { month: 'Mar 2027', prob: 11, lower: 5, upper: 19 },
    ],
    assumptions: [
      'RBI pivots to rate cuts (50–75 bps total)',
      'Government announces ₹2.5 lakh cr infrastructure push',
      'Global semiconductor supply chains normalize',
      'Strong monsoon boosts rural consumption',
      'FDI inflows resume to $80Bn annual pace',
      'PMI rebounds above 55 by November 2026',
    ],
    conclusion: 'A recovery scenario is plausible if domestic policy stimulus materializes alongside global tailwinds. Recession probability falls rapidly below the Watch threshold by October 2026, reaching near-normal levels by early 2027. This requires coordinated monetary and fiscal action.',
  },
}

export default function Forecast() {
  const [tab, setTab] = useState<Scenario>('Baseline')
  const s = scenarios[tab]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 rounded border text-xs"
          style={{ backgroundColor: '#0C1A2E', borderColor: '#243E6B' }}>
          <p className="font-mono-data mb-1" style={{ color: '#7A93B8' }}>{label}</p>
          <p className="font-mono-data font-semibold" style={{ color: s.color }}>
            P = {payload[0].value}%
          </p>
          <p className="font-mono-data text-xs" style={{ color: '#3E5A82' }}>
            CI: {payload[1]?.value}% – {payload[2]?.value}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen pt-14 px-8 py-8" style={{ backgroundColor: '#07101F' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="font-mono-data text-xs tracking-widest uppercase mb-2" style={{ color: '#3B82F6' }}>
            Probabilistic Outlook
          </p>
          <h1 className="font-display text-4xl font-semibold" style={{ color: '#E2E8F4' }}>
            2026 Forecast
          </h1>
          <p className="text-sm mt-2" style={{ color: '#7A93B8' }}>
            Aug 2026 – Mar 2027 projection with 80% confidence bands
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {(['Baseline', 'Stress', 'Recovery'] as Scenario[]).map(t => {
            const colors: Record<Scenario, string> = { Baseline: '#3B82F6', Stress: '#EF4444', Recovery: '#22C55E' }
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: tab === t ? colors[t] : '#0C1A2E',
                  color: tab === t ? '#fff' : '#7A93B8',
                  border: `1px solid ${tab === t ? colors[t] : '#1B3058'}`,
                }}
              >
                {t}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Chart */}
          <div className="col-span-3 rounded-xl border p-5" style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
            <p className="text-xs font-semibold mb-4" style={{ color: '#7A93B8' }}>
              {tab} Scenario — P(Recession) Projection
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={s.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B3058" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#7A93B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1B3058' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: '#7A93B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1B3058' }}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={30} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.5} />
                <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.5} />
                <Area type="monotone" dataKey="prob" stroke={s.color} fill={s.fillColor} strokeWidth={2} dot={{ r: 4, fill: s.color, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="lower" stroke="transparent" fill="transparent" />
                <Area type="monotone" dataKey="upper" stroke="transparent" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Assumptions */}
          <div className="col-span-2 rounded-xl border p-5" style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#3E5A82' }}>
              Scenario Assumptions
            </p>
            <ul className="space-y-2.5 mb-6">
              {s.assumptions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="font-mono-data mt-0.5 flex-shrink-0" style={{ color: s.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#7A93B8' }}>{a}</span>
                </li>
              ))}
            </ul>
            <div className="p-4 rounded-lg border-l-2" style={{ backgroundColor: '#0F2040', borderLeftColor: s.color }}>
              <p className="text-xs leading-relaxed" style={{ color: '#7A93B8' }}>
                {s.conclusion}
              </p>
            </div>

            {/* Current reading */}
            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#1B3058' }}>
              <span className="text-xs" style={{ color: '#7A93B8' }}>End-of-period projection</span>
              <span className="font-mono-data font-semibold text-sm" style={{ color: s.color }}>
                {s.data[s.data.length - 1].prob}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
