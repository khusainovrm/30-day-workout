import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { PwaPrompts } from './components/PwaPrompts'
import { CategoryPage } from './pages/CategoryPage'
import { DayPage } from './pages/DayPage'
import { HomePage } from './pages/HomePage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProgramPage } from './pages/ProgramPage'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { useAppStore } from './store/useAppStore'

function ThemeController() {
  const theme = useAppStore(state => state.settings.theme)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches))
    apply(); media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
  return null
}

function OnboardingGuard() {
  const onboarded = useAppStore(state => state.hasOnboarded)
  const selectedPrograms = useAppStore(state => state.selectedPrograms)
  const location = useLocation()
  if (!onboarded && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  if (onboarded && location.pathname === '/onboarding') {
    const selectedProgram = Object.values(selectedPrograms)[0]
    return <Navigate to={selectedProgram ? `/program/${selectedProgram}/day/1` : '/'} replace />
  }
  return <Routes>
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route element={<AppShell />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/program/:programId" element={<ProgramPage />} />
      <Route path="/program/:programId/day/:day" element={<DayPage />} />
      <Route path="/workout/:programId/:day" element={<WorkoutPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
}

export default function App() {
  return <BrowserRouter><ThemeController /><OnboardingGuard /><PwaPrompts /></BrowserRouter>
}
