import React, { useState } from 'react'

type Tab = 'overview' | 'upload-doc' | 'upload-data' | 'scenario' | 'api' | 'alerts'

const sidebarItems: { tab: Tab; label: string; icon: string }[] = [
  { tab: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { tab: 'upload-doc', label: 'Upload Document', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { tab: 'upload-data', label: 'Upload Data', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
  { tab: 'scenario', label: 'Scenario Builder', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { tab: 'api', label: 'API Access', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { tab: 'alerts', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
]

const indicatorSliders = [
  { name: 'Credit Growth (YoY %)', min: -10, max: 20, value: 4.2 },
  { name: 'IIP Manufacturing', min: -40, max: 20, value: -1.8 },
  { name: 'PMI Composite', min: 30, max: 65, value: 48.3 },
  { name: 'Yield Curve (bps)', min: -150, max: 200, value: -31 },
  { name: 'CPI Inflation (%)', min: 2, max: 12, value: 6.7 },
  { name: 'WPI Inflation (%)', min: -3, max: 14, value: 3.1 },
  { name: 'Forex Reserves ($Bn)', min: 200, max: 700, value: 412.8 },
  { name: 'Current Account (% GDP)', min: -6, max: 2, value: -2.1 },
  { name: 'Fiscal Deficit (% GDP)', min: -10, max: -2, value: -5.9 },
  { name: 'Unemployment Rate (%)', min: 3, max: 25, value: 8.2 },
  { name: 'Sensex YoY Change (%)', min: -60, max: 80, value: -12.4 },
  { name: 'Bank NPA Ratio (%)', min: 1, max: 15, value: 7.1 },
  { name: 'Export Growth (YoY %)', min: -40, max: 30, value: -6.8 },
]

const presetEpisodes = ['EP-1\n1991', 'EP-2\n1997', 'EP-3\n2000', 'EP-4\n2008', 'EP-5\n2012', 'EP-6\n2020']

const csvPreview = [
  { date: '2011-01', iip: 8.6, pmi: 57.9, credit: 18.2, cpi: 8.8 },
  { date: '2011-02', iip: 6.2, pmi: 57.0, credit: 17.6, cpi: 9.0 },
  { date: '2011-03', iip: 7.3, pmi: 57.6, credit: 21.5, cpi: 9.0 },
  { date: '2011-04', iip: 5.6, pmi: 58.0, credit: 20.9, cpi: 8.7 },
  { date: '2011-05', iip: 5.6, pmi: 57.5, credit: 20.7, cpi: 9.1 },
]

const existingAlerts = [
  { id: 1, threshold: 50, email: 'priya@rbi.org.in' },
  { id: 2, threshold: 70, email: 'priya.raghavan@gmail.com' },
  { id: 3, threshold: 30, email: 'rbi-alerts@rbi.org.in' },
]

function Sidebar({ active, setTab }: { active: Tab; setTab: (t: Tab) => void }) {
  return (
    <aside className="w-56 flex-shrink-0 min-h-screen border-r pt-4"
      style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
      <div className="px-4 mb-6">
        <p className="font-mono-data text-xs uppercase tracking-widest" style={{ color: '#3E5A82' }}>
          Researcher Portal
        </p>
        <p className="text-sm font-medium mt-1" style={{ color: '#E2E8F4' }}>Dr. Priya Raghavan</p>
        <p className="text-xs" style={{ color: '#7A93B8' }}>RBI, Mumbai</p>
      </div>
      <nav className="space-y-0.5 px-2">
        {sidebarItems.map(item => (
          <button
            key={item.tab}
            onClick={() => setTab(item.tab)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left"
            style={{
              backgroundColor: active === item.tab ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: active === item.tab ? '#3B82F6' : '#7A93B8',
            }}
            onMouseEnter={e => { if (active !== item.tab) (e.currentTarget as HTMLElement).style.color = '#E2E8F4' }}
            onMouseLeave={e => { if (active !== item.tab) (e.currentTarget as HTMLElement).style.color = '#7A93B8' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function Overview() {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: '#E2E8F4' }}>
        Welcome back, Dr. Raghavan
      </h2>
      <p className="text-sm mb-6" style={{ color: '#7A93B8' }}>
        Your contributions help improve the recession prediction model.
      </p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Documents Uploaded', value: '12', color: '#3B82F6' },
          { label: 'Data Months Contributed', value: '48', color: '#14B8A6' },
          { label: 'Reviews Completed', value: '7', color: '#A78BFA' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-xl border" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
            <p className="font-mono-data text-3xl font-semibold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#7A93B8' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="p-5 rounded-xl border" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3E5A82' }}>
          Impact Score
        </p>
        <div className="flex items-end gap-4">
          <p className="font-display text-5xl font-semibold" style={{ color: '#3B82F6' }}>82</p>
          <div className="mb-2">
            <p className="text-xs mb-1" style={{ color: '#7A93B8' }}>Top 14% of contributors</p>
            <div className="w-48 h-2 rounded-full" style={{ backgroundColor: '#162B52' }}>
              <div className="h-2 rounded-full" style={{ width: '82%', backgroundColor: '#3B82F6' }} />
            </div>
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: '#7A93B8' }}>
          Impact is calculated based on peer review scores, download count, and model improvement contributions.
        </p>
      </div>
    </div>
  )
}

function UploadDocument() {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Upload Document</h2>
      <div
        className="border-2 border-dashed rounded-xl p-10 text-center mb-6 transition-colors cursor-pointer"
        style={{ borderColor: '#1B3058' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 mx-auto mb-3" style={{ color: '#3E5A82' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm font-medium mb-1" style={{ color: '#E2E8F4' }}>Drop PDF or DOCX here</p>
        <p className="text-xs" style={{ color: '#7A93B8' }}>or click to browse — max 25 MB</p>
      </div>
      <div className="space-y-4">
        {[
          { label: 'Document Title', placeholder: 'Yield Curve Dynamics in Emerging Markets' },
          { label: 'Publication Date', placeholder: '2024-11-01', type: 'date' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>{f.label}</label>
            <input
              type={f.type ?? 'text'}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: '#07101F', borderColor: '#1B3058', color: '#E2E8F4' }}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>Document Type</label>
          <select className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#07101F', borderColor: '#1B3058', color: '#E2E8F4' }}>
            {['Research Paper', 'Working Paper', 'Policy Brief', 'Forecast Report', 'Dataset Note'].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="w-4 h-4 rounded border flex items-center justify-center" style={{ borderColor: '#1B3058', backgroundColor: '#0F2040' }}>
          </div>
          <span className="text-xs" style={{ color: '#7A93B8' }}>
            Embargo until publication date (restrict public access)
          </span>
        </label>
      </div>
      <button
        className="mt-6 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={{ backgroundColor: '#3B82F6', color: '#fff' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
      >
        Upload Document
      </button>
    </div>
  )
}

function UploadData() {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Upload Data</h2>
      <div
        className="border-2 border-dashed rounded-xl p-10 text-center mb-6 cursor-pointer transition-colors"
        style={{ borderColor: '#1B3058' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 mx-auto mb-3" style={{ color: '#3E5A82' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
        </svg>
        <p className="text-sm font-medium mb-1" style={{ color: '#E2E8F4' }}>Drop CSV here</p>
        <p className="text-xs" style={{ color: '#7A93B8' }}>Monthly indicators — date column required in YYYY-MM format</p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-xs" style={{ color: '#F59E0B' }}>
          Some values before 2011 may need confirmation — the system detected gaps in IIP and PMI columns prior to January 2011.
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
        <div className="grid text-xs font-semibold uppercase tracking-widest px-4 py-2.5 border-b"
          style={{ gridTemplateColumns: '120px 1fr 1fr 1fr 1fr', backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#3E5A82' }}>
          <span>Date</span><span>IIP Mfg</span><span>PMI</span><span>Credit Gr.</span><span>CPI</span>
        </div>
        {csvPreview.map((row, i) => (
          <div key={i} className="grid items-center px-4 py-2.5 border-b text-xs font-mono-data"
            style={{ gridTemplateColumns: '120px 1fr 1fr 1fr 1fr', backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F', borderColor: '#1B3058', color: '#E2E8F4' }}>
            <span style={{ color: '#7A93B8' }}>{row.date}</span>
            <span>{row.iip}</span>
            <span>{row.pmi}</span>
            <span>{row.credit}</span>
            <span>{row.cpi}</span>
          </div>
        ))}
      </div>

      <button
        className="mt-6 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={{ backgroundColor: '#3B82F6', color: '#fff' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
      >
        Submit Data
      </button>
    </div>
  )
}

function ScenarioBuilder() {
  const [sliders, setSliders] = useState(indicatorSliders.map(s => s.value))
  const predicted = Math.round(25 + sliders.reduce((acc, v, i) => {
    const s = indicatorSliders[i]
    const norm = (v - s.min) / (s.max - s.min)
    return acc + (i % 3 === 0 ? (1 - norm) * 8 : norm * 3)
  }, 0))

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Scenario Builder</h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
        {indicatorSliders.map((ind, i) => (
          <div key={ind.name}>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: '#7A93B8' }}>{ind.name}</span>
              <span className="font-mono-data font-semibold" style={{ color: '#3B82F6' }}>{sliders[i].toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={ind.min}
              max={ind.max}
              step={0.1}
              value={sliders[i]}
              onChange={e => {
                const next = [...sliders]
                next[i] = parseFloat(e.target.value)
                setSliders(next)
              }}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#3B82F6', backgroundColor: '#162B52' }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <p className="text-xs mr-2" style={{ color: '#7A93B8' }}>Load preset:</p>
        {presetEpisodes.map((ep, i) => (
          <button
            key={i}
            className="px-3 py-1.5 rounded text-xs font-mono-data transition-all border"
            style={{ backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#7A93B8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'; (e.currentTarget as HTMLElement).style.color = '#3B82F6' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'; (e.currentTarget as HTMLElement).style.color = '#7A93B8' }}
          >
            {ep.replace('\n', ' ')}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 p-5 rounded-xl border" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
        <div className="flex-1">
          <p className="text-xs mb-1" style={{ color: '#7A93B8' }}>Predicted P(Recession)</p>
          <p className="font-mono-data text-4xl font-semibold" style={{ color: predicted >= 60 ? '#EF4444' : predicted >= 30 ? '#F59E0B' : '#22C55E' }}>
            {Math.min(97, Math.max(5, predicted))}%
          </p>
        </div>
        <button
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: '#3B82F6', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
        >
          Save Scenario
        </button>
      </div>
    </div>
  )
}

function ApiAccess() {
  const [copied, setCopied] = useState(false)
  const key = 'irrm_sk_live_9x2kPqR7mNvL3wYcJ8hTdFgA5bZoU1eX'
  const handleCopy = () => {
    navigator.clipboard.writeText(key).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>API Access</h2>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: '#7A93B8' }}>Your API Key</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-lg border font-mono-data text-xs overflow-hidden"
              style={{ backgroundColor: '#07101F', borderColor: '#1B3058', color: '#7A93B8' }}>
              {key}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border"
              style={{ backgroundColor: copied ? 'rgba(34,197,94,0.12)' : '#0F2040', borderColor: copied ? '#22C55E' : '#1B3058', color: copied ? '#22C55E' : '#7A93B8' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all"
          style={{ borderColor: '#EF4444', color: '#EF4444', backgroundColor: 'transparent' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
        >
          Regenerate Key
        </button>
        <div className="p-5 rounded-xl border" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3E5A82' }}>Usage Today</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 rounded-full mb-2" style={{ backgroundColor: '#162B52' }}>
                <div className="h-2 rounded-full" style={{ width: '12%', backgroundColor: '#3B82F6' }} />
              </div>
              <p className="font-mono-data text-sm" style={{ color: '#E2E8F4' }}>
                120 <span style={{ color: '#7A93B8' }}>/ 1,000 calls</span>
              </p>
            </div>
            <p className="font-mono-data text-xs" style={{ color: '#7A93B8' }}>Resets at midnight IST</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Alerts() {
  const [threshold, setThreshold] = useState('')
  const [email, setEmail] = useState('')
  const [alerts, setAlerts] = useState(existingAlerts)

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Alerts</h2>
      <div className="p-5 rounded-xl border mb-6" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#3E5A82' }}>
          Add New Alert
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>
              Threshold (%)
            </label>
            <input
              type="number"
              placeholder="60"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm font-mono-data outline-none"
              style={{ backgroundColor: '#07101F', borderColor: '#1B3058', color: '#E2E8F4' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@institution.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: '#07101F', borderColor: '#1B3058', color: '#E2E8F4' }}
            />
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#3B82F6', color: '#fff' }}
            onClick={() => {
              if (threshold && email) {
                setAlerts(prev => [...prev, { id: Date.now(), threshold: parseInt(threshold), email }])
                setThreshold('')
                setEmail('')
              }
            }}
          >
            Add Alert
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-center justify-between px-4 py-3 rounded-lg border"
            style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
            <div className="flex items-center gap-4">
              <span className="font-mono-data text-sm font-semibold" style={{ color: '#F59E0B' }}>
                P ≥ {alert.threshold}%
              </span>
              <span className="text-xs" style={{ color: '#7A93B8' }}>{alert.email}</span>
            </div>
            <button
              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#3E5A82' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#EF4444'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#3E5A82'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResearcherPortal() {
  const [tab, setTab] = useState<Tab>('overview')

  const content: Record<Tab, React.ReactElement> = {
    overview: <Overview />,
    'upload-doc': <UploadDocument />,
    'upload-data': <UploadData />,
    scenario: <ScenarioBuilder />,
    api: <ApiAccess />,
    alerts: <Alerts />,
  }

  return (
    <div className="min-h-screen pt-14 flex" style={{ backgroundColor: '#07101F' }}>
      <Sidebar active={tab} setTab={setTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        {content[tab]}
      </main>
    </div>
  )
}
