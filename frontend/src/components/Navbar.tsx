type Page = string

interface NavbarProps {
  currentPage: Page
  navigate: (page: Page) => void
}

const navLinks = [
  { label: 'Dashboard', page: 'home' },
  { label: 'Timeline', page: 'home' },
  { label: 'Episodes', page: 'episodes' },
  { label: 'Documents', page: 'documents' },
  { label: 'Forecast', page: 'forecast' },
  { label: 'Research', page: 'researcher' },
]

export default function Navbar({ currentPage, navigate }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 border-b"
      style={{ backgroundColor: '#07101F', borderColor: '#1B3058' }}>
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 mr-10 flex-shrink-0"
      >
        <div className="w-7 h-7 rounded flex items-center justify-center"
          style={{ backgroundColor: '#3B82F6' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span className="font-display text-sm font-semibold tracking-tight"
          style={{ color: '#E2E8F4' }}>
          IRRM<span style={{ color: '#3B82F6' }}>.</span>
        </span>
      </button>

      <div className="flex items-center gap-1 flex-1">
        {navLinks.map(link => (
          <button
            key={link.label}
            onClick={() => navigate(link.page)}
            className="px-3 py-1.5 text-xs font-medium rounded transition-all duration-150"
            style={{
              color: currentPage === link.page ? '#3B82F6' : '#7A93B8',
              backgroundColor: currentPage === link.page ? 'rgba(59,130,246,0.08)' : 'transparent',
            }}
            onMouseEnter={e => {
              if (currentPage !== link.page) {
                (e.currentTarget as HTMLElement).style.color = '#E2E8F4'
              }
            }}
            onMouseLeave={e => {
              if (currentPage !== link.page) {
                (e.currentTarget as HTMLElement).style.color = '#7A93B8'
              }
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('api-docs')}
          className="px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ color: '#7A93B8' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#E2E8F4'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7A93B8'}
        >
          API
        </button>
        <button
          onClick={() => navigate('login')}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-all"
          style={{ color: '#7A93B8', borderColor: '#1B3058' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#E2E8F4'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#243E6B'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#7A93B8'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#1B3058'
          }}
        >
          Login
        </button>
        <button
          onClick={() => navigate('register')}
          className="px-3 py-1.5 text-xs font-semibold rounded transition-all"
          style={{ backgroundColor: '#3B82F6', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
        >
          Register
        </button>
      </div>
    </nav>
  )
}
