import { useState } from 'react'

type Page = string

interface LoginProps {
  navigate: (page: Page) => void
}

export default function Login({ navigate }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = () => {
    const validEmail = 'professor@demo.com'
    const validPassword = 'India@123'

    if (email === validEmail && password === validPassword) {
      setError('')
      navigate('researcher')
    } else {
      setError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.16), transparent 35%), linear-gradient(135deg, #020817 0%, #07152B 50%, #020817 100%)',
      }}
    >
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-10 items-center">

        {/* LEFT SIDE */}
        <div className="hidden lg:block px-8">

          {/* Brand */}
          <div className="flex items-center gap-4 mb-16">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9, #2563EB)',
                boxShadow: '0 0 35px rgba(14,165,233,0.25)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                className="w-7 h-7"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>

            <div>
              <h2
                className="font-display text-xl font-bold tracking-wide"
                style={{ color: '#F1F5F9' }}
              >
                INDIA RECESSION
                <br />
                RISK MONITOR
              </h2>

              <p
                className="text-xs mt-1 tracking-wider"
                style={{ color: '#38BDF8' }}
              >
                AI-POWERED ECONOMIC INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="relative">
            <h1
              className="font-display text-5xl font-bold leading-tight"
              style={{ color: '#F8FAFC' }}
            >
              Anticipate.
              <br />
              Analyze.
              <br />
              <span
                style={{
                  background:
                    'linear-gradient(90deg, #38BDF8, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Stay Ahead.
              </span>
            </h1>

            <p
              className="mt-6 max-w-lg text-base leading-7"
              style={{ color: '#94A3B8' }}
            >
              Advanced AI models and macroeconomic data to detect
              early signs of economic recession and empower informed
              decisions.
            </p>

            {/* Decorative Data Chart */}
            <div className="mt-10 relative h-40 overflow-hidden rounded-2xl border"
              style={{
                background: 'rgba(8,25,48,0.55)',
                borderColor: '#12345C',
              }}
            >
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(#1E5A91 1px, transparent 1px), linear-gradient(90deg, #1E5A91 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              <svg
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                <polyline
                  points="0,145 55,138 105,142 155,115 205,125 260,92 315,108 365,70 420,82 470,45 525,60 600,25"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="3"
                />

                <polyline
                  points="0,160 55,155 105,158 155,145 205,150 260,130 315,138 365,115 420,122 470,100 525,110 600,80"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  opacity="0.7"
                />
              </svg>

              <div className="absolute bottom-3 left-4 text-xs"
                style={{ color: '#64748B' }}>
                MACROECONOMIC RISK SIGNAL
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-4 gap-5 mt-10">

            <Feature
              icon="↗"
              title="Early Warning"
              text="Recession detection"
            />

            <Feature
              icon="▥"
              title="Macro Indicators"
              text="Economic signals"
            />

            <Feature
              icon="◉"
              title="ML Forecasting"
              text="Risk prediction"
            />

            <Feature
              icon="✓"
              title="Secure"
              text="Protected data"
            />

          </div>

        </div>

        {/* RIGHT SIDE — LOGIN */}
        <div className="flex justify-center lg:justify-end">

          <div
            className="w-full max-w-md rounded-3xl border p-8 md:p-10"
            style={{
              background:
                'linear-gradient(145deg, rgba(15,32,58,0.96), rgba(5,18,36,0.96))',
              borderColor: '#1E4A78',
              boxShadow:
                '0 25px 80px rgba(0,0,0,0.45), 0 0 50px rgba(14,165,233,0.06)',
            }}
          >

            {/* Logo */}
            <div className="text-center mb-8">

              <div
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{
                  background:
                    'radial-gradient(circle, #123C70, #071A33)',
                  border: '1px solid #1688D8',
                  boxShadow:
                    '0 0 35px rgba(14,165,233,0.25)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  className="w-9 h-9"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>

              <h2
                className="font-display text-3xl font-bold"
                style={{ color: '#F8FAFC' }}
              >
                Welcome Back
              </h2>

              <p
                className="text-sm mt-2"
                style={{ color: '#94A3B8' }}
              >
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* EMAIL */}
            <div className="mb-5">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#E2E8F0' }}
              >
                ✉ Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="professor@demo.com"
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all"
                style={{
                  backgroundColor: '#061326',
                  borderColor: '#23476E',
                  color: '#E2E8F0',
                }}
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-5">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#E2E8F0' }}
              >
                🔒 Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border outline-none text-sm"
                  style={{
                    backgroundColor: '#061326',
                    borderColor: '#23476E',
                    color: '#E2E8F0',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#38BDF8' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* TWO FACTOR */}
            <div className="mb-5">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#94A3B8' }}
              >
                🛡 Two-Factor Code
                <span className="ml-1 text-xs">
                  (optional)
                </span>
              </label>

              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm font-mono"
                style={{
                  backgroundColor: '#061326',
                  borderColor: '#183756',
                  color: '#64748B',
                }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: '#FCA5A5',
                }}
              >
                ❌ {error}
              </div>
            )}

            {/* LOGIN */}
            <button
              onClick={handleLogin}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background:
                  'linear-gradient(90deg, #0EA5E9, #2563EB)',
                color: '#fff',
                boxShadow:
                  '0 10px 30px rgba(37,99,235,0.25)',
              }}
            >
              ↪ Login
            </button>

            {/* OR */}
            <div className="flex items-center gap-4 my-6">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: '#1E3A5A' }}
              />

              <span
                className="text-xs"
                style={{ color: '#64748B' }}
              >
                OR
              </span>

              <div
                className="flex-1 h-px"
                style={{ backgroundColor: '#1E3A5A' }}
              />
            </div>

            {/* REGISTER */}
            <button
              onClick={() => navigate('register')}
              className="w-full py-3 rounded-xl text-sm font-semibold border transition-all"
              style={{
                borderColor: '#1688D8',
                color: '#38BDF8',
                backgroundColor: 'rgba(14,165,233,0.03)',
              }}
            >
              ＋ Create New Account
            </button>

            {/* SECURITY */}
            <div
              className="flex items-center justify-center gap-2 mt-7 text-xs"
              style={{ color: '#64748B' }}
            >
              <span style={{ color: '#38BDF8' }}>🛡</span>
              Your data is encrypted and protected
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}


/* Feature Component */

function Feature({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {
  return (
    <div className="text-center">
      <div
        className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl"
        style={{
          backgroundColor: '#08213D',
          border: '1px solid #1266A3',
          color: '#38BDF8',
        }}
      >
        {icon}
      </div>

      <div
        className="text-xs font-semibold"
        style={{ color: '#E2E8F0' }}
      >
        {title}
      </div>

      <div
        className="text-[10px] mt-1"
        style={{ color: '#64748B' }}
      >
        {text}
      </div>
    </div>
  )
}