import { useState } from 'react'

const endpoints = [
  {
    method: 'GET',
    path: '/v1/probability/current',
    description: 'Returns the latest computed recession probability for the current month, including status classification and confidence interval.',
    response: `{
  "month": "2026-08",
  "probability": 0.32,
  "status": "WATCH",
  "confidence_interval": {
    "lower": 0.24,
    "upper": 0.41
  },
  "last_updated": "2026-08-05T00:15:00Z"
}`,
  },
  {
    method: 'GET',
    path: '/v1/probability/history',
    description: 'Returns historical monthly recession probabilities. Accepts optional query parameters: start_date, end_date (YYYY-MM format).',
    response: `{
  "data": [
    { "month": "2026-06", "probability": 0.29, "status": "NORMAL" },
    { "month": "2026-07", "probability": 0.31, "status": "WATCH" },
    { "month": "2026-08", "probability": 0.32, "status": "WATCH" }
  ],
  "total": 302
}`,
  },
  {
    method: 'GET',
    path: '/v1/episodes',
    description: 'Returns a list of all identified recession episodes with metadata including date range, cause, peak probability, and GDP impact.',
    response: `{
  "episodes": [
    {
      "id": "EP-6",
      "start": "2020-02",
      "end": "2020-10",
      "cause": "COVID-19 Pandemic Shock",
      "tag": "Exogenous",
      "peak_probability": 0.968,
      "gdp_impact": -0.066
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/v1/indicators/latest',
    description: 'Returns the latest available values for all 13 tracked macroeconomic indicators, with month and source attribution.',
    response: `{
  "month": "2026-07",
  "indicators": {
    "credit_growth_yoy": 4.2,
    "iip_manufacturing": -1.8,
    "pmi_composite": 48.3,
    "yield_curve_bps": -31,
    "cpi_inflation": 6.7,
    "wpi_inflation": 3.1,
    "forex_reserves_usd_bn": 412.8,
    "current_account_pct_gdp": -2.1,
    "fiscal_deficit_pct_gdp": -5.9,
    "unemployment_rate": 8.2,
    "sensex_yoy": -12.4,
    "bank_npa_ratio": 7.1,
    "export_growth_yoy": -6.8
  }
}`,
  },
  {
    method: 'POST',
    path: '/v1/scenario/compute',
    description: 'Computes a recession probability for a custom scenario. Pass a JSON body with indicator values. Returns predicted probability and agent scores.',
    response: `{
  "predicted_probability": 0.45,
  "status": "WATCH",
  "agent_scores": {
    "credit_agent": 0.61,
    "industry_agent": 0.72,
    "inflation_agent": 0.38,
    "external_agent": 0.55,
    "fiscal_agent": 0.29
  }
}`,
  },
  {
    method: 'GET',
    path: '/v1/documents',
    description: 'Lists publicly available research documents. Accepts filter parameters: type, status, limit, offset.',
    response: `{
  "documents": [
    {
      "id": 1182,
      "title": "Yield Curve Dynamics in Emerging Markets",
      "type": "Research Paper",
      "date": "2024-11-15",
      "sentiment_score": 0.72,
      "status": "Published"
    }
  ],
  "total": 12
}`,
  },
  {
    method: 'GET',
    path: '/v1/forecast/2026',
    description: 'Returns all three forecast scenarios (Baseline, Stress, Recovery) for the 2026–2027 projection period.',
    response: `{
  "scenarios": {
    "baseline": {
      "end_probability": 0.24,
      "months": [
        { "month": "2026-09", "prob": 0.34, "lower": 0.25, "upper": 0.44 }
      ]
    },
    "stress": { "end_probability": 0.68 },
    "recovery": { "end_probability": 0.11 }
  }
}`,
  },
]

const methodColors: Record<string, { bg: string; color: string }> = {
  GET: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E' },
  POST: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
}

export default function ApiDocs() {
  const [active, setActive] = useState(0)
  const ep = endpoints[active]

  return (
    <div className="min-h-screen pt-14 flex" style={{ backgroundColor: '#07101F' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 min-h-screen border-r pt-6"
        style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
        <div className="px-5 mb-5">
          <p className="font-mono-data text-xs uppercase tracking-widest mb-1" style={{ color: '#3E5A82' }}>API Reference</p>
          <p className="text-sm font-medium" style={{ color: '#E2E8F4' }}>v1.0 — REST</p>
          <div className="mt-3 px-2 py-1.5 rounded text-xs font-mono-data" style={{ backgroundColor: '#162B52', color: '#7A93B8' }}>
            Base: api.irrm.in/v1
          </div>
        </div>
        <nav className="px-2 space-y-0.5">
          {endpoints.map((ep, i) => (
            <button
              key={ep.path}
              onClick={() => setActive(i)}
              className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
              style={{ backgroundColor: active === i ? 'rgba(59,130,246,0.08)' : 'transparent' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono-data font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ ...methodColors[ep.method], fontSize: '10px' }}
                >
                  {ep.method}
                </span>
                <span className="text-xs font-mono-data truncate" style={{ color: active === i ? '#E2E8F4' : '#7A93B8' }}>
                  {ep.path.replace('/v1', '')}
                </span>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-2.5 py-1 rounded text-xs font-mono-data font-semibold"
              style={{ ...methodColors[ep.method] }}
            >
              {ep.method}
            </span>
            <code
              className="px-3 py-1.5 rounded-lg text-sm font-mono-data border"
              style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#E2E8F4' }}
            >
              {ep.path}
            </code>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: '#7A93B8' }}>
            {ep.description}
          </p>

          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3E5A82' }}>
              Example Response
            </p>
            <span className="text-xs font-mono-data px-2 py-0.5 rounded" style={{ backgroundColor: '#162B52', color: '#7A93B8' }}>
              200 OK
            </span>
          </div>
          <pre
            className="px-5 py-4 rounded-xl border text-xs font-mono-data leading-relaxed overflow-x-auto"
            style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058', color: '#94A3B8' }}
          >
            <code>{ep.response}</code>
          </pre>

          <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3E5A82' }}>Authentication</p>
            <p className="text-xs mb-2" style={{ color: '#7A93B8' }}>Pass your API key in the Authorization header:</p>
            <code
              className="block px-3 py-2 rounded font-mono-data text-xs"
              style={{ backgroundColor: '#07101F', color: '#7A93B8' }}
            >
              Authorization: Bearer irrm_sk_live_...
            </code>
          </div>
        </div>
      </main>
    </div>
  )
}
