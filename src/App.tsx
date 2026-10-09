import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Archive } from './pages/Archive'
import { Daily } from './pages/Daily'
import { Home } from './pages/Home'
import { Practice } from './pages/Practice'
import { PracticeFlight } from './pages/PracticeFlight'
import { StarChart } from './pages/StarChart'
import { Unlock } from './pages/Unlock'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="daily" element={<Daily />} />
          <Route path="practice" element={<Practice />} />
          <Route path="practice/:topic" element={<PracticeFlight />} />
          <Route path="archive/:n" element={<Archive />} />
          <Route path="unlock" element={<Unlock />} />
          <Route path="star-chart" element={<StarChart />} />
          <Route path="logbook" element={<Navigate to="/star-chart" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
