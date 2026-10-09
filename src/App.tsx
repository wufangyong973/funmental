import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Archive } from './pages/Archive'
import { Daily } from './pages/Daily'
import { Home } from './pages/Home'
import { Logbook } from './pages/Logbook'
import { Practice } from './pages/Practice'
import { PracticeDive } from './pages/PracticeDive'
import { Unlock } from './pages/Unlock'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="daily" element={<Daily />} />
          <Route path="practice" element={<Practice />} />
          <Route path="practice/:topic" element={<PracticeDive />} />
          <Route path="archive/:n" element={<Archive />} />
          <Route path="unlock" element={<Unlock />} />
          <Route path="logbook" element={<Logbook />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
