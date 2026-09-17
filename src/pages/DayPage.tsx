import { ArrowLeft, CheckCircle2, Clock3, Dumbbell, Play } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui'
import { exercises } from '../data/exercises'
import { categoryMeta, difficultyMeta, getProgram } from '../data/programs'
import { getCurrentDay, useAppStore } from '../store/useAppStore'

export function DayPage() {
  const { programId, day: dayParam } = useParams()
  const navigate = useNavigate()
  const program = getProgram(programId ?? '')
  const dayNumber = Number(dayParam)
  const completedDays = useAppStore(state => state.completedDays)
  const setActiveSession = useAppStore(state => state.setActiveSession)
  if (!program || !Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 30) return <Navigate to="/" replace />
  const day = program.days[dayNumber - 1]
  const currentDay = getCurrentDay(program.id, completedDays)
  if (dayNumber > currentDay && !(completedDays[program.id] ?? []).includes(dayNumber)) return <Navigate to={`/program/${program.id}`} replace />
  const isReplay = (completedDays[program.id] ?? []).includes(dayNumber)
  const start = () => {
    setActiveSession({ programId: program.id, day: dayNumber, exerciseIndex: 0, completedExerciseIds: [], state: 'exercise-preview', workoutStartedAt: Date.now(), totalPausedTime: 0 })
    navigate(`/workout/${program.id}/${dayNumber}`)
  }
  return <div className="min-h-[calc(100dvh-64px)] px-5 pt-3">
    <Link to={`/program/${program.id}`} className="grid size-12 place-items-center rounded-full bg-card" aria-label="Назад к программе"><ArrowLeft /></Link>
    <div className="mt-7"><div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[.14em] text-muted">{categoryMeta[program.category].title} · {difficultyMeta[program.difficulty].title}</div><div className="mt-2 flex items-end justify-between"><h1 className="text-5xl font-black tracking-[-.06em]">День {dayNumber}</h1>{isReplay && <span className="mb-1 flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-gray-950"><CheckCircle2 size={14} />Выполнено</span>}</div><p className="mt-2 text-lg font-semibold text-muted">{day.title ?? 'Сегодняшняя тренировка'}</p></div>
    <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-card p-4"><Clock3 size={20} className="text-muted" /><strong className="mt-3 block text-xl">~{day.estimatedDuration} мин</strong><span className="text-sm text-muted">Примерно</span></div><div className="rounded-2xl bg-card p-4"><Dumbbell size={20} className="text-muted" /><strong className="mt-3 block text-xl">{day.exercises.length}</strong><span className="text-sm text-muted">Упражнений</span></div></div>
    <h2 className="mb-3 mt-8 text-xl font-black">План тренировки</h2>
    <div className="grid gap-2">{day.exercises.map((item, index) => { const exercise = exercises[item.exerciseId]; return <div key={`${item.exerciseId}-${index}`} className="flex min-h-[70px] items-center gap-4 rounded-2xl bg-card px-3 py-2"><img src={exercise.images[0]} loading="lazy" alt="" className="size-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-extrabold">{exercise.name}</p><p className="text-sm font-semibold text-muted">{item.reps ? `${item.reps} повт.` : `${item.duration} сек.`}</p></div><span className="mr-2 text-xs font-bold text-muted">{String(index + 1).padStart(2, '0')}</span></div> })}</div>
    <div className="sticky bottom-[86px] mt-6 rounded-[24px] bg-surface/90 pb-2 pt-3 backdrop-blur"><Button className="flex w-full items-center justify-center gap-2" onClick={start}><Play size={18} fill="currentColor" />{isReplay ? 'ПОВТОРИТЬ ТРЕНИРОВКУ' : 'НАЧАТЬ ТРЕНИРОВКУ'}</Button></div>
  </div>
}
