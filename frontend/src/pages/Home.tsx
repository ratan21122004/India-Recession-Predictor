import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts'

type Page = string

interface HomeProps {
  navigate: (page: Page) => void
}

// Generate 26 years of monthly P(Recession) data
function generateChartData() {
  const data: { date: string; prob: number; year: number; month: number }[] = []
  const recessionPeriods = [
    { start: [1991, 6], end: [1992, 3] },
    { start: [1997, 9], end: [1998, 6] },
    { start: [2000, 8], end: [2001, 5] },
    { start: [2008, 9], end: [2009, 6] },
    { start: [2012, 4], end: [2013, 2] },
    { start: [2020, 2], end: [2020, 10] },
  ]

  for (let year = 2000; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === 2026 && month > 7) break
      let baseProb = 12 + Math.sin((year + month / 12) * 2) * 4 + Math.random() * 6
      const inRecession = recessionPeriods.some(r => {
        const start = r.start[0] * 12 + r.start[1]
        const end = r.end[0] * 12 + r.end[1]
        const cur = year * 12 + month
        return cur >= start - 6 && cur <= end + 3
      })
      if (inRecession) baseProb = Math.min(95, baseProb + 40 + Math.random() * 25)
      data.push({
        date: `${year}-${String(month).padStart(2, '0')}`,
        prob: Math.round(Math.max(5, Math.min(97, baseProb)) * 10) / 10,
        year,
        month,
      })
    }
  }
  return data
}

const allData = generateChartData()

const recessionShades = [
  { x1: '2000-08', x2: '2001-05', label: 'Dot-com' },
  { x1: '2008-09', x2: '2009-06', label: 'GFC' },
  { x1: '2012-04', x2: '2013-02', label: 'Fiscal' },
  { x1: '2020-02', x2: '2020-10', label: 'COVID' },
]

const statCards = [
  { value: '44', label: 'Recession Months', icon: '📉', color: '#EF4444' },
  { value: '6', label: 'Episodes Tracked', icon: '📋', color: '#3B82F6' },
  { value: '302', label: 'Months Trained', icon: '🧠', color: '#14B8A6' },
  { value: '0.97', label: 'AUC-ROC Score', icon: '⚡', color: '#F59E0B' },
]

interface MonthDetailPanelProps {
  onClose: () => void
}

function MonthDetailPanel({ onClose }: MonthDetailPanelProps) {
  const indicators = [
    { name: 'Credit Growth (YoY)', value: '+4.2%', highlight: false },
    { name: 'IIP Manufacturing', value: '-1.8%', highlight: true },
    { name: 'PMI Composite', value: '48.3', highlight: true },
    { name: 'Yield Curve (10Y–2Y)', value: '-0.31%', highlight: true },
    { name: 'CPI Inflation', value: '6.7%', highlight: false },
    { name: 'WPI Inflation', value: '3.1%', highlight: false },
    { name: 'Forex Reserves (USD Bn)', value: '412.8', highlight: false },
    { name: 'Current Account (% GDP)', value: '-2.1%', highlight: true },
    { name: 'Fiscal Deficit (% GDP)', value: '-5.9%', highlight: false },
    { name: 'Unemployment Rate', value: '8.2%', highlight: true },
    { name: 'Sensex YoY Change', value: '-12.4%', highlight: true },
    { name: 'Bank NPA Ratio', value: '7.1%', highlight: false },
    { name: 'Export Growth (YoY)', value: '-6.8%', highlight: true },
  ]
  const agents = [
    { name: 'Credit Agent', score: 0.71, color: '#EF4444' },
    { name: 'Industry Agent', score: 0.82, color: '#EF4444' },
    { name: 'Inflation Agent', score: 0.44, color: '#F59E0B' },
    { name: 'External Agent', score: 0.67, color: '#F59E0B' },
    { name: 'Fiscal Agent', score: 0.38, color: '#22C55E' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full max-w-sm h-full overflow-y-auto border-l"
        style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b" style={{ borderColor: '#1B3058' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono-data text-xs mb-1" style={{ color: '#7A93B8' }}>MONTH DETAIL</p>
              <h2 className="font-display text-2xl font-semibold" style={{ color: '#E2E8F4' }}>
                September 2008
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded transition-colors mt-1"
              style={{ color: '#7A93B8' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E2E8F4'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7A93B8'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-3xl font-semibold" style={{ color: '#EF4444' }}>
              P = 79.4%
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
              ALERT
            </span>
          </div>
        </div>

        <div className="p-5 border-b" style={{ borderColor: '#1B3058' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3E5A82' }}>
            Indicators
          </p>
          <div className="space-y-0.5">
            {indicators.map(ind => (
              <div
                key={ind.name}
                className="flex items-center justify-between px-2 py-1.5 rounded text-xs"
                style={{
                  backgroundColor: ind.highlight ? 'rgba(245,158,11,0.08)' : 'transparent',
                  borderLeft: ind.highlight ? '2px solid #F59E0B' : '2px solid transparent',
                }}
              >
                <span style={{ color: '#7A93B8' }}>{ind.name}</span>
                <span className="font-mono-data font-medium" style={{ color: ind.highlight ? '#F59E0B' : '#E2E8F4' }}>
                  {ind.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-b" style={{ borderColor: '#1B3058' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3E5A82' }}>
            Agent Scores
          </p>
          <div className="space-y-2.5">
            {agents.map(agent => (
              <div key={agent.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#7A93B8' }}>{agent.name}</span>
                  <span className="font-mono-data" style={{ color: agent.color }}>{agent.score.toFixed(2)}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: '#162B52' }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${agent.score * 100}%`, backgroundColor: agent.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3E5A82' }}>
            Plain-English Explanation
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#7A93B8' }}>
            September 2008 saw the collapse of Lehman Brothers trigger a severe global credit freeze. India's export growth contracted sharply, PMI fell below the expansion threshold, and the yield curve inverted for the first time since 2001. Industrial production declined across manufacturing sub-sectors. The model's credit and industry agents both signaled high distress, pushing the ensemble probability to 79.4% — well above the Alert threshold of 60%.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Home({ navigate }: HomeProps) {
  const [zoom, setZoom] = useState<'5Y' | '10Y' | 'All'>('All')
  const [showDetail, setShowDetail] = useState(false)

  const getFilteredData = () => {
    if (zoom === 'All') return allData
    const cutoff = zoom === '5Y' ? 2021 : 2016
    return allData.filter(d => d.year >= cutoff)
  }

  const chartData = getFilteredData()
  const currentProb = 32
  const status = currentProb < 30 ? 'NORMAL' : currentProb < 60 ? 'WATCH' : 'ALERT'
  const statusColor = status === 'NORMAL' ? '#22C55E' : status === 'WATCH' ? '#F59E0B' : '#EF4444'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 rounded border text-xs"
          style={{ backgroundColor: '#0C1A2E', borderColor: '#243E6B' }}>
          <p className="font-mono-data mb-1" style={{ color: '#7A93B8' }}>{label}</p>
          <p className="font-mono-data font-semibold" style={{ color: '#3B82F6' }}>
            P = {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen pt-14" style={{ backgroundColor: '#07101F' }}>
      {showDetail && <MonthDetailPanel onClose={() => setShowDetail(false)} />}

      {/* Hero */}
      <section className="px-8 pt-16 pb-12 border-b" style={{ borderColor: '#1B3058' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-12">
          <div className="flex-1">
            <p className="font-mono-data text-xs tracking-widest uppercase mb-4" style={{ color: '#3B82F6' }}>
              India Macroeconomic Intelligence
            </p>
            <h1 className="font-display text-5xl font-semibold leading-tight mb-4" style={{ color: '#E2E8F4' }}>
              India Recession<br />
              <span style={{ color: '#3B82F6' }}>Risk Monitor</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: '#7A93B8' }}>
              A multi-agent probabilistic framework tracking 13 macroeconomic indicators
              across 302 months of Indian economic history — updated monthly.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => navigate('episodes')}
                className="px-4 py-2 text-xs font-semibold rounded transition-all"
                style={{ backgroundColor: '#3B82F6', color: '#fff' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
              >
                View Episodes
              </button>
              <button
                onClick={() => navigate('forecast')}
                className="px-4 py-2 text-xs font-semibold rounded border transition-all"
                style={{ color: '#7A93B8', borderColor: '#1B3058' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E2E8F4'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7A93B8'}
              >
                2026 Forecast →
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="inline-block p-8 rounded-2xl border" style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
              <p className="font-mono-data text-xs uppercase tracking-widest mb-2" style={{ color: '#7A93B8' }}>
                Current Probability
              </p>
              <p className="font-mono-data text-6xl font-semibold mb-3" style={{ color: '#E2E8F4' }}>
                {currentProb}<span className="text-3xl" style={{ color: '#7A93B8' }}>%</span>
              </p>
              <p className="font-mono-data text-sm mb-4" style={{ color: '#7A93B8' }}>
                P(Recession | Aug 2026)
              </p>
              <span
                className="inline-block px-4 py-1 rounded-full text-xs font-mono-data font-semibold tracking-widest"
                style={{ backgroundColor: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}
              >
                ● {status}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="px-8 py-8 border-b" style={{ borderColor: '#1B3058' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-4">
          {statCards.map(card => (
            <div
              key={card.label}
              className="p-5 rounded-xl border"
              style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}
            >
              <p className="font-mono-data text-3xl font-semibold mb-1" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-xs" style={{ color: '#7A93B8' }}>{card.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chart */}
      <section className="px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold mb-1" style={{ color: '#E2E8F4' }}>
                Recession Probability — Historical Timeline
              </h2>
              <p className="text-xs" style={{ color: '#7A93B8' }}>
                Click any data point to inspect monthly indicators
              </p>
            </div>
            <div className="flex items-center gap-1">
              {(['5Y', '10Y', 'All'] as const).map(z => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  className="px-3 py-1 text-xs font-mono-data font-medium rounded transition-all"
                  style={{
                    backgroundColor: zoom === z ? '#3B82F6' : '#0C1A2E',
                    color: zoom === z ? '#fff' : '#7A93B8',
                    border: `1px solid ${zoom === z ? '#3B82F6' : '#1B3058'}`,
                  }}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}
          >
            <div className="flex items-center gap-6 mb-4 text-xs">
              <span className="flex items-center gap-1.5" style={{ color: '#7A93B8' }}>
                <span className="inline-block w-3 h-1 rounded" style={{ backgroundColor: '#3B82F6' }} />
                P(Recession)
              </span>
              <span className="flex items-center gap-1.5" style={{ color: '#7A93B8' }}>
                <span className="inline-block w-3 h-3 rounded-sm opacity-40" style={{ backgroundColor: '#EF4444' }} />
                Recession Episode
              </span>
              <span className="flex items-center gap-1.5" style={{ color: '#7A93B8' }}>
                <span className="inline-block w-3 h-px" style={{ borderTop: '1px dashed #F59E0B' }} />
                Watch Threshold (30%)
              </span>
              <span className="flex items-center gap-1.5" style={{ color: '#7A93B8' }}>
                <span className="inline-block w-3 h-px" style={{ borderTop: '1px dashed #EF4444' }} />
                Alert Threshold (60%)
              </span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                onClick={() => setShowDetail(true)}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1B3058" />
                <XAxis
                  dataKey="date"
                  tickFormatter={v => v.slice(0, 4)}
                  interval={Math.floor(chartData.length / 8)}
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
                {recessionShades.map(r => (
                  <ReferenceArea
                    key={r.x1}
                    x1={r.x1}
                    x2={r.x2}
                    fill="#EF4444"
                    fillOpacity={0.12}
                    ifOverflow="visible"
                  />
                ))}
                <ReferenceLine y={30} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.6} />
                <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.6} />
                <Line
                  type="monotone"
                  dataKey="prob"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}
