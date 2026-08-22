import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Episodes from './pages/Episodes'
import Documents from './pages/Documents'
import Forecast from './pages/Forecast'
import Login from './pages/Login'
import Register from './pages/Register'
import ResearcherPortal from './pages/ResearcherPortal'
import Admin from './pages/Admin'
import ApiDocs from './pages/ApiDocs'

type Page = 'home' | 'episodes' | 'documents' | 'forecast' | 'login' | 'register' | 'researcher' | 'admin' | 'api-docs'

const noNavPages: Page[] = ['login', 'register']

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const navigate = (p: string) => setPage(p as Page)

  const showNav = !noNavPages.includes(page)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#07101F', color: '#E2E8F4', fontFamily: "'Inter', sans-serif" }}>
      {showNav && <Navbar currentPage={page} navigate={navigate} />}

      {page === 'home' && <Home navigate={navigate} />}
      {page === 'episodes' && <Episodes />}
      {page === 'documents' && <Documents />}
      {page === 'forecast' && <Forecast />}
      {page === 'login' && <Login navigate={navigate} />}
      {page === 'register' && <Register navigate={navigate} />}
      {page === 'researcher' && <ResearcherPortal />}
      {page === 'admin' && <Admin />}
      {page === 'api-docs' && <ApiDocs />}
    </div>
  )
}
