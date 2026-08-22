type Page = string
interface RegisterProps { navigate: (page: Page) => void }

export default function Register({ navigate }: RegisterProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#07101F' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#162B52' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2} className="w-5 h-5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: '#E2E8F4' }}>
            Create Researcher Account
          </h1>
          <p className="text-xs" style={{ color: '#7A93B8' }}>
            Access is reviewed by the editorial team within 48 hours
          </p>
        </div>

        <div className="rounded-xl border p-6" style={{ backgroundColor: '#0C1A2E', borderColor: '#1B3058' }}>
          <div className="space-y-4">
            {[
              { label: 'Full Name', type: 'text', placeholder: 'Dr. Priya Raghavan' },
              { label: 'Email Address', type: 'email', placeholder: 'priya@rbi.org.in' },
              { label: 'Institution', type: 'text', placeholder: 'Reserve Bank of India' },
              { label: 'Research Area', type: 'text', placeholder: 'Monetary Policy & Business Cycles' },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                  style={{ backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#E2E8F4' }}
                  onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'}
                  onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A93B8' }}>
                Research Bio
              </label>
              <textarea
                rows={4}
                placeholder="Brief description of your research interests and how you intend to use the platform..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-colors"
                style={{ backgroundColor: '#0F2040', borderColor: '#1B3058', color: '#E2E8F4' }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B3058'}
              />
            </div>
          </div>

          <button
            className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#3B82F6', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#3B82F6'}
          >
            Register
          </button>

          <p className="mt-4 text-xs text-center" style={{ color: '#7A93B8' }}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="underline"
              style={{ color: '#3B82F6' }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
