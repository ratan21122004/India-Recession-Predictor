import { useState } from 'react'

const episodes = [
  {
    id: 1,
    label: 'EP-1',
    dateRange: 'Jun 1991 – Mar 1992',
    cause: 'Balance of Payments Crisis',
    tag: 'External',
    tagColor: '#14B8A6',
    peak: 82.1,
    duration: '10 months',
    gdpDrop: '-1.1%',
  },
  {
    id: 2,
    label: 'EP-2',
    dateRange: 'Sep 1997 – Jun 1998',
    cause: 'Asian Financial Contagion',
    tag: 'External',
    tagColor: '#14B8A6',
    peak: 74.6,
    duration: '10 months',
    gdpDrop: '-0.3%',
  },
  {
    id: 3,
    label: 'EP-3',
    dateRange: 'Aug 2000 – May 2001',
    cause: 'Dot-com Bust & Drought',
    tag: 'Mixed',
    tagColor: '#A78BFA',
    peak: 68.9,
    duration: '10 months',
    gdpDrop: '-0.6%',
  },
  {
    id: 4,
    label: 'EP-4',
    dateRange: 'Sep 2008 – Jun 2009',
    cause: 'Global Financial Crisis',
    tag: 'External',
    tagColor: '#14B8A6',
    peak: 91.3,
    duration: '10 months',
    gdpDrop: '-2.4%',
  },
  {
    id: 5,
    label: 'EP-5',
    dateRange: 'Apr 2012 – Feb 2013',
    cause: 'Fiscal Deficit & Policy Drift',
    tag: 'Domestic',
    tagColor: '#F59E0B',
    peak: 61.2,
    duration: '11 months',
    gdpDrop: '-1.8%',
  },
  {
    id: 6,
    label: 'EP-6',
    dateRange: 'Feb 2020 – Oct 2020',
    cause: 'COVID-19 Pandemic Shock',
    tag: 'Exogenous',
    tagColor: '#EF4444',
    peak: 96.8,
    duration: '9 months',
    gdpDrop: '-6.6%',
  },
]

const comparisonIndicators = [
  'Duration (months)',
  'Peak P(Recession)',
  'GDP Growth Drop',
  'Credit Contraction',
  'IIP Min Value',
  'PMI Trough',
  'Yield Curve Min',
  'Forex Reserve Change',
  'Sensex Drawdown',
  'Unemployment Peak',
  'CPI during episode',
  'Export contraction',
  'Policy rate response',
]

export default function Episodes() {
  const [ep1, setEp1] = useState('EP-4')
  const [ep2, setEp2] = useState('EP-6')

  const e1 = episodes.find(e => e.label === ep1)!
  const e2 = episodes.find(e => e.label === ep2)!

  const compData: Record<string, [string, string]> = {
    'Duration (months)': [e1.duration, e2.duration],
    'Peak P(Recession)': [`${e1.peak}%`, `${e2.peak}%`],
    'GDP Growth Drop': [e1.gdpDrop, e2.gdpDrop],
    'Credit Contraction': ['-3.2%', '-5.8%'],
    'IIP Min Value': ['-7.1', '-38.4'],
    'PMI Trough': ['43.2', '27.4'],
    'Yield Curve Min': ['-0.68%', '-0.41%'],
    'Forex Reserve Change': ['-$18.2Bn', '+$12.1Bn'],
    'Sensex Drawdown': ['-57.1%', '-38.2%'],
    'Unemployment Peak': ['9.1%', '23.5%'],
    'CPI during episode': ['9.2%', '6.8%'],
    'Export contraction': ['-21.4%', '-36.7%'],
    'Policy rate response': ['-425 bps', '-115 bps'],
  }

  return (
    <div className="min-h-screen pt-14 px-8 py-8" style={{ backgroundColor: '#07101F' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="font-mono-data text-xs tracking-widest uppercase mb-2" style={{ color: '#3B82F6' }}>
            Historical Analysis
          </p>
          <h1 className="font-display text-4xl font-semibold" style={{ color: '#E2E8F4' }}>
            Recession Episodes
          </h1>
          <p className="text-sm mt-2" style={{ color: '#7A93B8' }}>
            Six identified contraction episodes in the Indian economy since 1991.
          </p>
        </div>

        {/* Episode Grid */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {episodes.map(ep => (
            <div
              key={ep.id}
              className="p-5 rounded-xl border transition-all duration-200"
              style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#243E6B'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono-data text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: '#162B52', color: '#7A93B8' }}>
                  {ep.label}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${ep.tagColor}18`, color: ep.tagColor }}
                >
                  {ep.tag}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-1 leading-snug" style={{ color: '#E2E8F4' }}>
                {ep.cause}
              </h3>
              <p className="font-mono-data text-xs mb-3" style={{ color: '#7A93B8' }}>
                {ep.dateRange}
              </p>
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#1B3058' }}>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#7A93B8' }}>Peak P(Rec.)</p>
                  <p className="font-mono-data font-semibold" style={{ color: '#EF4444' }}>
                    {ep.peak}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs mb-0.5" style={{ color: '#7A93B8' }}>GDP Impact</p>
                  <p className="font-mono-data font-semibold" style={{ color: '#F59E0B' }}>
                    {ep.gdpDrop}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full" style={{ backgroundColor: '#162B52' }}>
                <div
                  className="h-1 rounded-full"
                  style={{ width: `${ep.peak}%`, backgroundColor: '#EF4444', opacity: 0.7 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className="border-t pt-8" style={{ borderColor: '#1B3058' }}>
          <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>
            Episode Comparison
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <select
              value={ep1}
              onChange={e => setEp1(e.target.value)}
              className="px-3 py-2 rounded-lg border text-xs font-mono-data outline-none"
              style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#E2E8F4' }}
            >
              {episodes.map(e => (
                <option key={e.label} value={e.label}>{e.label} — {e.cause}</option>
              ))}
            </select>
            <span className="text-sm font-display italic" style={{ color: '#3E5A82' }}>vs.</span>
            <select
              value={ep2}
              onChange={e => setEp2(e.target.value)}
              className="px-3 py-2 rounded-lg border text-xs font-mono-data outline-none"
              style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#E2E8F4' }}
            >
              {episodes.map(e => (
                <option key={e.label} value={e.label}>{e.label} — {e.cause}</option>
              ))}
            </select>
            <button
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ backgroundColor: '#3B82F6', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
            >
              Compare
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
            <div className="grid grid-cols-3 px-5 py-3 border-b text-xs font-semibold uppercase tracking-widest" style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#3E5A82' }}>
              <span>Indicator</span>
              <span>{e1.cause}</span>
              <span>{e2.cause}</span>
            </div>
            {comparisonIndicators.map((ind, i) => (
              <div
                key={ind}
                className="grid grid-cols-3 px-5 py-3 border-b text-xs"
                style={{
                  backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F',
                  borderColor: '#1B3058',
                }}
              >
                <span style={{ color: '#7A93B8' }}>{ind}</span>
                <span className="font-mono-data font-medium" style={{ color: '#E2E8F4' }}>
                  {compData[ind]?.[0] ?? '—'}
                </span>
                <span className="font-mono-data font-medium" style={{ color: '#E2E8F4' }}>
                  {compData[ind]?.[1] ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
