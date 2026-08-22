import { useState } from 'react'

const documents = [
  { title: 'Yield Curve Inversion as a Recession Predictor in Emerging Markets', type: 'Research Paper', date: '2024-11-15', sentiment: 0.72, status: 'Published' },
  { title: 'India GDP Nowcasting Using High-Frequency Indicators', type: 'Working Paper', date: '2024-09-03', sentiment: 0.58, status: 'Under Review' },
  { title: 'Credit Growth and Systemic Risk: Lessons from 2008', type: 'Policy Brief', date: '2024-07-21', sentiment: 0.41, status: 'Published' },
  { title: 'PMI as a Leading Indicator: Evidence from Indian Manufacturing', type: 'Research Paper', date: '2024-06-14', sentiment: 0.63, status: 'Published' },
  { title: 'Q1 2026 India Economic Outlook: Risks and Scenarios', type: 'Forecast Report', date: '2024-05-30', sentiment: 0.49, status: 'Published' },
  { title: 'Unemployment Dynamics During Indian Recessions', type: 'Working Paper', date: '2024-04-12', sentiment: 0.33, status: 'Under Review' },
  { title: 'Foreign Exchange Reserves and Macroeconomic Stability', type: 'Policy Brief', date: '2024-03-08', sentiment: 0.67, status: 'Published' },
  { title: 'The COVID-19 Recession in India: A Post-Mortem Analysis', type: 'Research Paper', date: '2024-02-18', sentiment: 0.28, status: 'Published' },
  { title: 'Inflation-Growth Trade-offs in RBI Policy 2022–2024', type: 'Working Paper', date: '2024-01-25', sentiment: 0.55, status: 'Rejected' },
  { title: 'Sectoral Heterogeneity in Business Cycle Downturns', type: 'Research Paper', date: '2023-12-10', sentiment: 0.61, status: 'Published' },
  { title: 'Fiscal Multipliers During Contractionary Episodes', type: 'Policy Brief', date: '2023-11-03', sentiment: 0.44, status: 'Under Review' },
  { title: 'External Sector Vulnerabilities: A Panel Analysis', type: 'Working Paper', date: '2023-10-17', sentiment: 0.52, status: 'Published' },
]

const statusColors: Record<string, { bg: string; color: string }> = {
  Published: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E' },
  'Under Review': { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  Rejected: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
}

const sentimentColor = (v: number) => {
  if (v >= 0.6) return '#22C55E'
  if (v >= 0.4) return '#F59E0B'
  return '#EF4444'
}

export default function Documents() {
  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')

  const types = ['All', 'Research Paper', 'Working Paper', 'Policy Brief', 'Forecast Report']

  const filtered = documents.filter(d => {
    const matchType = typeFilter === 'All' || d.type === typeFilter
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="min-h-screen pt-14 px-8 py-8" style={{ backgroundColor: '#07101F' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="font-mono-data text-xs tracking-widest uppercase mb-2" style={{ color: '#3B82F6' }}>
            Research Repository
          </p>
          <h1 className="font-display text-4xl font-semibold" style={{ color: '#E2E8F4' }}>Documents</h1>
          <p className="text-sm mt-2" style={{ color: '#7A93B8' }}>
            {documents.length} documents in the research repository
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-xs font-mono-data outline-none"
            style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#E2E8F4' }}
          >
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="flex-1 max-w-sm relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: '#3E5A82' }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#E2E8F4' }}
            />
          </div>
          <p className="text-xs ml-auto" style={{ color: '#7A93B8' }}>
            {filtered.length} results
          </p>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
          <div className="grid text-xs font-semibold uppercase tracking-widest px-5 py-3 border-b"
            style={{ gridTemplateColumns: '1fr 140px 110px 120px 100px', backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#3E5A82' }}>
            <span>Title</span>
            <span>Type</span>
            <span>Date</span>
            <span>Sentiment</span>
            <span>Status</span>
          </div>
          {filtered.map((doc, i) => (
            <div
              key={i}
              className="grid items-center px-5 py-3.5 border-b text-xs transition-colors"
              style={{
                gridTemplateColumns: '1fr 140px 110px 120px 100px',
                backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F',
                borderColor: '#1B3058',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#162B52'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = i % 2 === 0 ? '#0C1A2E' : '#07101F'}
            >
              <span className="pr-4 font-medium truncate" style={{ color: '#E2E8F4' }}>
                {doc.title}
              </span>
              <span style={{ color: '#7A93B8' }}>{doc.type}</span>
              <span className="font-mono-data" style={{ color: '#7A93B8' }}>{doc.date}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 max-w-16 h-1 rounded-full" style={{ backgroundColor: '#162B52' }}>
                  <div className="h-1 rounded-full" style={{ width: `${doc.sentiment * 100}%`, backgroundColor: sentimentColor(doc.sentiment) }} />
                </div>
                <span className="font-mono-data" style={{ color: sentimentColor(doc.sentiment) }}>
                  {doc.sentiment.toFixed(2)}
                </span>
              </div>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                style={{ backgroundColor: statusColors[doc.status].bg, color: statusColors[doc.status].color }}
              >
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
