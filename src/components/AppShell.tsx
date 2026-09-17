import { Dumbbell, Home, Settings, TrendingUp } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/progress', label: 'Прогресс', icon: TrendingUp },
  { to: '/settings', label: 'Настройки', icon: Settings }
]

export function AppShell() {
  const location = useLocation()
  const workoutMode = location.pathname.startsWith('/workout/')
  return <div className="min-h-dvh bg-page text-ink">
    <div className="mx-auto min-h-dvh max-w-app bg-surface shadow-app">
      {!workoutMode && <header className="flex h-16 items-center justify-between px-5 pt-safe"><div className="flex items-center gap-2 font-extrabold"><span className="grid size-8 place-items-center rounded-xl bg-ink text-accent"><Dumbbell size={18} /></span>30 ДНЕЙ</div><span className="rounded-full border border-line px-3 py-1 text-xs font-bold text-muted">ТРЕНИРОВКИ</span></header>}
      <main className={workoutMode ? '' : 'pb-28'}><Outlet /></main>
      {!workoutMode && <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-app border-t border-line bg-surface/95 pb-safe backdrop-blur-xl" aria-label="Основная навигация">
        <div className="grid h-[74px] grid-cols-3 px-3">{nav.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold ${isActive ? 'text-ink' : 'text-muted'}`}><item.icon size={21} strokeWidth={2.2} /><span>{item.label}</span></NavLink>)}</div>
      </nav>}
    </div>
  </div>
}
