import { CalendarDays, CheckCircle2, Clock3, Flame, Trophy } from 'lucide-react'
import { categoryMeta, difficultyMeta, programs } from '../data/programs'
import { formatTime } from '../hooks/useTimestampTimer'
import { useAppStore } from '../store/useAppStore'
import type { Category } from '../types'
import { ProgressBar } from '../components/ui'

const dayStart = (timestamp: number) => { const date = new Date(timestamp); date.setHours(0, 0, 0, 0); return date.getTime() }

export function ProgressPage() {
  const { workoutHistory, completedDays, selectedPrograms } = useAppStore()
  const totalTime = workoutHistory.reduce((sum, item) => sum + item.duration, 0)
  const totalExercises = workoutHistory.reduce((sum, item) => sum + item.exerciseCount, 0)
  const activeDates = new Set(workoutHistory.map(item => dayStart(item.completedAt)))
  let streak = 0
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0)
  if (!activeDates.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1)
  while (activeDates.has(cursor.getTime())) { streak += 1; cursor.setDate(cursor.getDate() - 1) }
  const week = Array.from({ length: 7 }, (_, index) => { const date = new Date(); const mondayOffset = (date.getDay() + 6) % 7; date.setDate(date.getDate() - mondayOffset + index); date.setHours(0, 0, 0, 0); return date })
  return <div className="px-5 pt-5">
    <p className="text-sm font-extrabold uppercase tracking-[.16em] text-muted">Твой путь</p><h1 className="mt-1 text-4xl font-black tracking-[-.05em]">Прогресс</h1>
    <div className="mt-7 grid grid-cols-2 gap-3"><Stat icon={Flame} value={streak} label="Текущая серия" accent /><Stat icon={CheckCircle2} value={workoutHistory.length} label="Тренировок" /><Stat icon={Clock3} value={totalTime >= 3600 ? `${Math.round(totalTime / 360) / 10} ч` : `${Math.round(totalTime / 60)} мин`} label="Общее время" /><Stat icon={Trophy} value={totalExercises} label="Упражнений" /></div>
    <section className="mt-7 rounded-[26px] bg-card p-5"><div className="flex items-center gap-2"><CalendarDays size={20} /><h2 className="text-xl font-black">Эта неделя</h2></div><div className="mt-5 grid grid-cols-7 gap-2">{week.map(date => { const done = activeDates.has(date.getTime()); const today = dayStart(Date.now()) === date.getTime(); return <div key={date.toISOString()} className="text-center"><span className="text-xs font-bold text-muted">{date.toLocaleDateString('ru-RU', { weekday: 'narrow' })}</span><span className={`mx-auto mt-2 grid aspect-square max-w-10 place-items-center rounded-full text-sm font-black ${done ? 'bg-accent text-gray-950' : today ? 'ring-2 ring-ink' : 'bg-surface text-muted'}`}>{done ? '✓' : date.getDate()}</span></div>})}</div></section>
    <h2 className="mb-4 mt-8 text-xl font-black">Программы</h2><div className="grid gap-3">{(Object.keys(categoryMeta) as Category[]).map(category => { const id = selectedPrograms[category]; const count = id ? completedDays[id]?.length ?? 0 : 0; const activeProgram = id ? programs.find(item => item.id === id) : undefined; return <div key={category} className="rounded-2xl bg-card p-4"><div className="flex items-center justify-between"><div><h3 className="font-black">{categoryMeta[category].title}</h3><p className="mt-0.5 text-sm text-muted">{activeProgram ? `${difficultyMeta[activeProgram.difficulty].title} · План ${activeProgram.variant}` : 'План не выбран'}</p></div><b>{count}/30</b></div><ProgressBar value={count / 30 * 100} className="mt-4" /></div>})}</div>
    {workoutHistory.length > 0 && <section className="mt-7"><h2 className="mb-3 text-xl font-black">Последние тренировки</h2>{workoutHistory.slice(-4).reverse().map(item => { const program = programs.find(p => p.id === item.programId)!; return <div key={item.id} className="mb-2 flex items-center justify-between rounded-2xl bg-card p-4"><div><b>{categoryMeta[program.category].title} · День {item.day}</b><p className="text-sm text-muted">{new Date(item.completedAt).toLocaleDateString('ru-RU')}</p></div><span className="font-mono text-sm font-bold">{formatTime(item.duration)}</span></div>})}</section>}
  </div>
}

function Stat({ icon: Icon, value, label, accent = false }: { icon: typeof Flame; value: number | string; label: string; accent?: boolean }) {
  return <div className={`rounded-[22px] p-4 ${accent ? 'bg-accent text-gray-950' : 'bg-card'}`}><Icon size={20} /><b className="mt-5 block text-3xl font-black tracking-tight">{value}</b><span className={`text-sm font-semibold ${accent ? 'text-gray-950/60' : 'text-muted'}`}>{label}</span></div>
}
