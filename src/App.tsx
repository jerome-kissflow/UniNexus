import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './shell'
import { StoreProvider } from './state/store'
import { Launcher } from './views/Launcher'
import { StudentApp } from './views/StudentApp'
import { Admissions } from './views/Admissions'
import { Scholarship } from './views/Scholarship'
import { ControlTower } from './views/ControlTower'
import { Finance } from './views/Finance'
import { Onboarding } from './views/Onboarding'
import { Systems } from './views/Systems'
import { Grants } from './views/Grants'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Launcher />} />
            <Route path="/student" element={<StudentApp />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/scholarship" element={<Scholarship />} />
            <Route path="/tower" element={<ControlTower />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/systems" element={<Systems />} />
            <Route path="/grants" element={<Grants />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </HashRouter>
    </StoreProvider>
  )
}
