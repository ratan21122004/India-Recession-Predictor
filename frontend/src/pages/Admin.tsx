import React, { useState } from 'react'

type AdminTab = 'dashboard' | 'users' | 'documents' | 'data' | 'model' | 'audit' | 'settings'

const adminSidebarItems: { tab: AdminTab; label: string }[] = [
  { tab: 'dashboard', label: 'Dashboard' },
  { tab: 'users', label: 'Users' },
  { tab: 'documents', label: 'Documents' },
  { tab: 'data', label: 'Data' },
  { tab: 'model', label: 'Model' },
  { tab: 'audit', label: 'Audit Log' },
  { tab: 'settings', label: 'Settings' },
]

function AdminSidebar({ active, setTab }: { active: AdminTab; setTab: (t: AdminTab) => void }) {
  return (
    <aside className="w-52 flex-shrink-0 min-h-screen border-r pt-4"
      style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
      <div className="px-4 mb-6">
        <p className="font-mono-data text-xs uppercase tracking-widest mb-1" style={{ color: '#3E5A82' }}>Admin</p>
        <p className="text-sm font-medium" style={{ color: '#E2E8F4' }}>Control Panel</p>
      </div>
      <nav className="space-y-0.5 px-2">
        {adminSidebarItems.map(item => (
          <button
            key={item.tab}
            onClick={() => setTab(item.tab)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: active === item.tab ? 'rgba(239,68,68,0.1)' : 'transparent',
              color: active === item.tab ? '#EF4444' : '#7A93B8',
            }}
            onMouseEnter={e => { if (active !== item.tab) (e.currentTarget as HTMLElement).style.color = '#E2E8F4' }}
            onMouseLeave={e => { if (active !== item.tab) (e.currentTarget as HTMLElement).style.color = '#7A93B8' }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function AdminDashboardTab() {
  const statBoxes = [
    { label: 'Pending Approvals', value: '7', sub: '3 users, 4 documents', color: '#F59E0B' },
    { label: 'Last Retrain Date', value: 'Jul 28, 2026', sub: 'Model v2.4.1', color: '#3B82F6' },
    { label: 'Current Model Version', value: 'v2.4.1', sub: 'AUC-ROC 0.974', color: '#14B8A6' },
    { label: 'Platform Health', value: '99.8%', sub: 'Uptime last 30 days', color: '#22C55E' },
  ]
  const activity = [
    { time: '08:42 IST', user: 'priya@rbi.org.in', action: 'Document uploaded', detail: 'Yield Curve Analysis 2026' },
    { time: '07:15 IST', user: 'system', action: 'Monthly model run', detail: 'August 2026 probability computed' },
    { time: '06:30 IST', user: 'admin@irrm.in', action: 'User approved', detail: 'rahul.sharma@iimb.ac.in' },
    { time: 'Yesterday', user: 'system', action: 'Alert triggered', detail: 'P(Recession) crossed 30% threshold' },
    { time: 'Yesterday', user: 'vijay@niti.gov.in', action: 'Scenario saved', detail: 'Stress scenario: Oil shock 2026' },
    { time: '2 days ago', user: 'admin@irrm.in', action: 'Data approved', detail: 'monthly_india_2010_2026.csv' },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Admin Dashboard</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statBoxes.map(s => (
          <div key={s.label} className="p-5 rounded-xl border" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
            <p className="text-xs mb-2" style={{ color: '#7A93B8' }}>{s.label}</p>
            <p className="font-mono-data text-xl font-semibold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#3E5A82' }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <h3 className="font-semibold text-sm mb-3" style={{ color: '#E2E8F4' }}>Recent Activity</h3>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
        {activity.map((a, i) => (
          <div key={i} className="grid items-center px-5 py-3 border-b text-xs"
            style={{ gridTemplateColumns: '100px 180px 180px 1fr', backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F', borderColor: '#1B3058' }}>
            <span className="font-mono-data" style={{ color: '#3E5A82' }}>{a.time}</span>
            <span style={{ color: '#7A93B8' }}>{a.user}</span>
            <span style={{ color: '#E2E8F4' }}>{a.action}</span>
            <span style={{ color: '#7A93B8' }}>{a.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Users() {
  const users = [
    { name: 'Dr. Priya Raghavan', email: 'priya@rbi.org.in', institution: 'Reserve Bank of India', status: 'Approved' },
    { name: 'Rahul Sharma', email: 'rahul.sharma@iimb.ac.in', institution: 'IIM Bangalore', status: 'Pending' },
    { name: 'Dr. Ananya Krishnan', email: 'ananya@igidr.ac.in', institution: 'IGIDR Mumbai', status: 'Approved' },
    { name: 'Vijay Nair', email: 'vijay@niti.gov.in', institution: 'NITI Aayog', status: 'Approved' },
    { name: 'Sunita Mehta', email: 'sunita@imf.org', institution: 'IMF (India Desk)', status: 'Pending' },
    { name: 'Dr. Arjun Patel', email: 'arjun@worldbank.org', institution: 'World Bank', status: 'Pending' },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Users</h2>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
        <div className="grid text-xs font-semibold uppercase tracking-widest px-5 py-3 border-b"
          style={{ gridTemplateColumns: '1fr 1fr 1fr 100px 160px', backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#3E5A82' }}>
          <span>Name</span><span>Email</span><span>Institution</span><span>Status</span><span>Actions</span>
        </div>
        {users.map((u, i) => (
          <div key={i} className="grid items-center px-5 py-3.5 border-b text-xs"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 100px 160px', backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F', borderColor: '#1B3058' }}>
            <span className="font-medium" style={{ color: '#E2E8F4' }}>{u.name}</span>
            <span style={{ color: '#7A93B8' }}>{u.email}</span>
            <span style={{ color: '#7A93B8' }}>{u.institution}</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold inline-block"
              style={{
                backgroundColor: u.status === 'Approved' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                color: u.status === 'Approved' ? '#22C55E' : '#F59E0B',
              }}>
              {u.status}
            </span>
            <div className="flex gap-2">
              {u.status === 'Pending' && (
                <>
                  <button className="px-2 py-1 rounded text-xs font-semibold transition-all"
                    style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
                    Approve
                  </button>
                  <button className="px-2 py-1 rounded text-xs font-semibold transition-all"
                    style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                    Reject
                  </button>
                </>
              )}
              {u.status === 'Approved' && (
                <button className="px-2 py-1 rounded text-xs font-semibold"
                  style={{ backgroundColor: '#162B52', color: '#7A93B8' }}>
                  Suspend
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminDocuments() {
  const docs = [
    { title: 'Yield Curve Analysis 2026', uploader: 'priya@rbi.org.in', peerStatus: 'Under Review', action: 'Approve' },
    { title: 'India PMI Decomposition Study', uploader: 'rahul.sharma@iimb.ac.in', peerStatus: 'Peer Approved', action: 'Approve' },
    { title: 'Credit Cycles and NPA Dynamics', uploader: 'ananya@igidr.ac.in', peerStatus: 'Peer Approved', action: 'Published' },
    { title: 'Monsoon Shocks and GDP', uploader: 'vijay@niti.gov.in', peerStatus: 'Pending Review', action: 'Approve' },
    { title: 'Global Commodity Pass-through', uploader: 'sunita@imf.org', peerStatus: 'Under Review', action: 'Approve' },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Documents</h2>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
        <div className="grid text-xs font-semibold uppercase tracking-widest px-5 py-3 border-b"
          style={{ gridTemplateColumns: '1fr 1fr 1fr 120px', backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#3E5A82' }}>
          <span>Title</span><span>Uploader</span><span>Peer Review</span><span>Action</span>
        </div>
        {docs.map((d, i) => (
          <div key={i} className="grid items-center px-5 py-3.5 border-b text-xs"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 120px', backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F', borderColor: '#1B3058' }}>
            <span className="font-medium pr-4 truncate" style={{ color: '#E2E8F4' }}>{d.title}</span>
            <span style={{ color: '#7A93B8' }}>{d.uploader}</span>
            <span style={{ color: d.peerStatus === 'Peer Approved' ? '#22C55E' : '#7A93B8' }}>{d.peerStatus}</span>
            {d.action === 'Published' ? (
              <span className="text-xs" style={{ color: '#3E5A82' }}>Published</span>
            ) : (
              <button className="px-3 py-1 rounded text-xs font-semibold transition-all"
                style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                Approve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function DataTab() {
  const rows = [
    { file: 'monthly_india_1991_2000.csv', range: 'Jan 1991 – Dec 2000', uploader: 'admin@irrm.in', strategy: 'Linear Interpolation', status: 'Approved' },
    { file: 'monthly_india_2001_2010.csv', range: 'Jan 2001 – Dec 2010', uploader: 'admin@irrm.in', strategy: 'Forward Fill', status: 'Approved' },
    { file: 'monthly_india_2011_2020.csv', range: 'Jan 2011 – Dec 2020', uploader: 'ananya@igidr.ac.in', strategy: 'None', status: 'Approved' },
    { file: 'high_freq_q2_2026.csv', range: 'Apr 2026 – Jun 2026', uploader: 'priya@rbi.org.in', strategy: 'Seasonal Adj.', status: 'Pending' },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Data</h2>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
        <div className="grid text-xs font-semibold uppercase tracking-widest px-5 py-3 border-b"
          style={{ gridTemplateColumns: '1fr 160px 140px 160px 90px', backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#3E5A82' }}>
          <span>Filename</span><span>Date Range</span><span>Uploader</span><span>Gap Strategy</span><span>Status</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid items-center px-5 py-3.5 border-b text-xs"
            style={{ gridTemplateColumns: '1fr 160px 140px 160px 90px', backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F', borderColor: '#1B3058' }}>
            <span className="font-mono-data" style={{ color: '#E2E8F4' }}>{r.file}</span>
            <span className="font-mono-data" style={{ color: '#7A93B8' }}>{r.range}</span>
            <span style={{ color: '#7A93B8' }}>{r.uploader}</span>
            <span style={{ color: '#7A93B8' }}>{r.strategy}</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold inline-block"
              style={{
                backgroundColor: r.status === 'Approved' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                color: r.status === 'Approved' ? '#22C55E' : '#F59E0B',
              }}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelTab() {
  const versions = [
    { version: 'v2.4.1', date: 'Jul 28, 2026', months: 302, aucRoc: 0.974, active: true },
    { version: 'v2.3.0', date: 'Mar 12, 2026', months: 296, aucRoc: 0.971, active: false },
    { version: 'v2.2.2', date: 'Nov 05, 2025', months: 290, aucRoc: 0.968, active: false },
    { version: 'v2.1.0', date: 'Jun 20, 2025', months: 284, aucRoc: 0.962, active: false },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Model</h2>
      <div className="p-5 rounded-xl border mb-6" style={{ backgroundColor: '#0F2040', borderColor: '#1B3058' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs mb-1" style={{ color: '#7A93B8' }}>Active Model</p>
            <p className="font-display text-xl font-semibold mb-3" style={{ color: '#E2E8F4' }}>
              IRRM Ensemble v2.4.1
            </p>
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span style={{ color: '#7A93B8' }}>Training months: </span>
                <span className="font-mono-data" style={{ color: '#3B82F6' }}>302</span>
              </div>
              <div>
                <span style={{ color: '#7A93B8' }}>AUC-ROC: </span>
                <span className="font-mono-data" style={{ color: '#22C55E' }}>0.974</span>
              </div>
              <div>
                <span style={{ color: '#7A93B8' }}>Precision: </span>
                <span className="font-mono-data" style={{ color: '#14B8A6' }}>0.91</span>
              </div>
              <div>
                <span style={{ color: '#7A93B8' }}>Recall: </span>
                <span className="font-mono-data" style={{ color: '#A78BFA' }}>0.88</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all"
            style={{ borderColor: '#F59E0B', color: '#F59E0B', backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(245,158,11,0.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
            Rollback
          </button>
        </div>
      </div>
      <h3 className="font-semibold text-sm mb-3" style={{ color: '#E2E8F4' }}>Version History</h3>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
        <div className="grid text-xs font-semibold uppercase tracking-widest px-5 py-3 border-b"
          style={{ gridTemplateColumns: '100px 120px 130px 90px 80px', backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#3E5A82' }}>
          <span>Version</span><span>Date</span><span>Months</span><span>AUC-ROC</span><span>Status</span>
        </div>
        {versions.map((v, i) => (
          <div key={v.version} className="grid items-center px-5 py-3.5 border-b text-xs"
            style={{ gridTemplateColumns: '100px 120px 130px 90px 80px', backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F', borderColor: '#1B3058' }}>
            <span className="font-mono-data font-semibold" style={{ color: v.active ? '#3B82F6' : '#E2E8F4' }}>{v.version}</span>
            <span className="font-mono-data" style={{ color: '#7A93B8' }}>{v.date}</span>
            <span className="font-mono-data" style={{ color: '#7A93B8' }}>{v.months}</span>
            <span className="font-mono-data" style={{ color: '#22C55E' }}>{v.aucRoc}</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold inline-block"
              style={{ backgroundColor: v.active ? 'rgba(59,130,246,0.12)' : '#162B52', color: v.active ? '#3B82F6' : '#3E5A82' }}>
              {v.active ? 'Active' : 'Archived'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditLog() {
  const rows = [
    { ts: '2026-08-05 08:42:11', user: 'priya@rbi.org.in', action: 'DOCUMENT_UPLOAD', detail: 'doc_id: 1182, title: Yield Curve Analysis 2026' },
    { ts: '2026-08-05 07:15:00', user: 'system', action: 'MODEL_RUN', detail: 'month: 2026-08, result: P=0.32, status: WATCH' },
    { ts: '2026-08-05 06:30:45', user: 'admin@irrm.in', action: 'USER_APPROVE', detail: 'user_id: 441, email: rahul.sharma@iimb.ac.in' },
    { ts: '2026-08-04 23:00:01', user: 'system', action: 'ALERT_TRIGGER', detail: 'threshold: 30%, current: 32%, emails: 14 sent' },
    { ts: '2026-08-04 16:22:30', user: 'vijay@niti.gov.in', action: 'SCENARIO_SAVE', detail: 'scenario_id: 88, name: Oil Shock 2026' },
    { ts: '2026-08-04 09:11:05', user: 'admin@irrm.in', action: 'DATA_APPROVE', detail: 'file: high_freq_q2_2026.csv, rows: 91' },
    { ts: '2026-08-03 14:05:19', user: 'ananya@igidr.ac.in', action: 'API_KEYGEN', detail: 'key rotated, old_key_hash: a3f9d...' },
    { ts: '2026-08-03 11:44:02', user: 'admin@irrm.in', action: 'SETTINGS_UPDATE', detail: 'rate_limit changed: 500→1000' },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Audit Log</h2>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1B3058' }}>
        <div className="grid text-xs font-semibold uppercase tracking-widest px-5 py-3 border-b"
          style={{ gridTemplateColumns: '170px 160px 160px 1fr', backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#3E5A82' }}>
          <span>Timestamp</span><span>User</span><span>Action</span><span>Details</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid items-center px-5 py-3 border-b text-xs"
            style={{ gridTemplateColumns: '170px 160px 160px 1fr', backgroundColor: i % 2 === 0 ? '#0C1A2E' : '#07101F', borderColor: '#1B3058' }}>
            <span className="font-mono-data" style={{ color: '#3E5A82' }}>{r.ts}</span>
            <span style={{ color: '#7A93B8' }}>{r.user}</span>
            <span className="font-mono-data font-semibold text-xs" style={{ color: '#3B82F6' }}>{r.action}</span>
            <span className="font-mono-data text-xs" style={{ color: '#7A93B8' }}>{r.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Settings() {
  const [settings, setSettings] = useState({
    alertSender: 'alerts@irrm.in',
    rateLimit: '1000',
    apiEnabled: true,
    publicDocs: true,
    autoRetrain: false,
    maintenanceMode: false,
  })

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: '#E2E8F4' }}>Settings</h2>
      <div className="space-y-4 max-w-lg">
        {[
          { label: 'Alert Email Sender', key: 'alertSender', type: 'text' },
          { label: 'API Rate Limit (calls/day)', key: 'rateLimit', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>{f.label}</label>
            <input
              type={f.type}
              value={settings[f.key as keyof typeof settings] as string}
              onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm font-mono-data outline-none"
              style={{ backgroundColor: '#07101F', borderColor: '#1B3058', color: '#E2E8F4' }}
            />
          </div>
        ))}
        <div className="pt-4 space-y-3">
          {[
            { label: 'Enable API access', key: 'apiEnabled' },
            { label: 'Public document access', key: 'publicDocs' },
            { label: 'Auto-retrain on new data', key: 'autoRetrain' },
            { label: 'Maintenance mode', key: 'maintenanceMode' },
          ].map(toggle => (
            <div key={toggle.key} className="flex items-center justify-between py-3 border-t" style={{ borderColor: '#1B3058' }}>
              <span className="text-sm" style={{ color: '#E2E8F4' }}>{toggle.label}</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, [toggle.key]: !prev[toggle.key as keyof typeof prev] }))}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ backgroundColor: settings[toggle.key as keyof typeof settings] ? '#3B82F6' : '#162B52' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                  style={{
                    backgroundColor: '#fff',
                    left: settings[toggle.key as keyof typeof settings] ? 'calc(100% - 18px)' : '2px',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-4 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: '#3B82F6', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('dashboard')

  const content: Record<AdminTab, React.ReactElement> = {
    dashboard: <AdminDashboardTab />,
    users: <Users />,
    documents: <AdminDocuments />,
    data: <DataTab />,
    model: <ModelTab />,
    audit: <AuditLog />,
    settings: <Settings />,
  }

  return (
    <div className="min-h-screen pt-14 flex" style={{ backgroundColor: '#07101F' }}>
      <AdminSidebar active={tab} setTab={setTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        {content[tab]}
      </main>
    </div>
  )
}
