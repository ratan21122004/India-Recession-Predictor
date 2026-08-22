type Page = string
interface LoginProps { navigate: (page: Page) => void }

export default function Login({ navigate }: LoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#07101F' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#162B52' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2} className="w-5 h-5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: '#E2E8F4' }}>
            Login
          </h1>
          <p className="text-xs" style={{ color: '#7A93B8' }}>India Recession Risk Monitor</p>
        </div>

        <div className="rounded-xl border p-6" style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="researcher@institution.edu"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                style={{ backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#E2E8F4' }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                style={{ backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#E2E8F4' }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#3E5A82' }}>
                Two-Factor Code <span style={{ color: '#243E6B' }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="000000"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono-data"
                style={{ backgroundColor: '#07101F', borderColor: '#1B3058', color: '#3E5A82' }}
              />
            </div>
          </div>

          <button
            className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#3B82F6', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
            onClick={() => navigate('researcher')}
          >
            Login
          </button>

          <p className="mt-4 text-xs text-center" style={{ color: '#7A93B8' }}>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigate('register')}
              className="underline transition-colors"
              style={{ color: '#3B82F6' }}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
