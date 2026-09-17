import { ArrowLeft, Check, ChevronRight, LockKeyhole, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { categoryMeta, difficultyMeta, getProgram } from '../data/programs'
import { getCurrentDay, useAppStore } from '../store/useAppStore'

export function ProgramPage() {
  const { programId } = useParams()
  const program = getProgram(programId ?? '')
  const completedDays = useAppStore(state => state.completedDays)
  const selectProgram = useAppStore(state => state.selectProgram)
  const currentRef = useRef<HTMLAnchorElement>(null)
  const currentDay = program ? getCurrentDay(program.id, completedDays) : 1
  useEffect(() => {
    if (!program) return
    selectProgram(program.category, program.id)
    const timer = window.setTimeout(() => currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
    return () => window.clearTimeout(timer)
  }, [program, selectProgram])
  if (!program) return <Navigate to="/" replace />
  const completed = completedDays[program.id] ?? []
  return <div className="px-5 pt-3">
    <Link to={`/category/${program.category}`} className="grid size-12 place-items-center rounded-full bg-card" aria-label="Back"><ArrowLeft /></Link>
    <p className="mt-7 text-sm font-extrabold uppercase tracking-[.16em] text-muted">{difficultyMeta[program.difficulty].title} · Plan {program.variant}</p>
    <h1 className="mt-1 text-4xl font-black tracking-[-.05em]">{categoryMeta[program.category].title}</h1>
    <div className="mt-5 flex items-center justify-between rounded-2xl bg-ink p-4 text-white"><div><span className="text-2xl font-black">{completed.length}</span><span className="text-white/55"> / 30 complete</span></div><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{Math.round(completed.length / 30 * 100)}%</span></div>
    <div className="relative mt-7 pb-4 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-line">{program.days.map(day => {
      const isCompleted = completed.includes(day.day)
      const isCurrent = day.day === currentDay && completed.length < 30
      const locked = day.day > currentDay && !isCompleted
      const content = <><span className={`relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-2 font-black ${isCompleted ? 'border-accent bg-accent text-gray-950' : isCurrent ? 'border-ink bg-ink text-accent' : 'border-line bg-surface text-muted'}`}>{isCompleted ? <Check size={18} /> : locked ? <LockKeyhole size={16} /> : day.day}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-extrabold">Day {day.day}{day.type === 'recovery' && <span className="rounded-full bg-surface px-2 py-1 text-[10px] text-muted">RECOVERY</span>}</span><span className="mt-0.5 block text-sm text-muted">{day.exercises.length} exercises · ~{day.estimatedDuration} min</span></span>{!locked && <ChevronRight size={20} />}</>
      return locked ? <div key={day.day} className="flex min-h-[82px] items-center gap-4 opacity-55" aria-label={`Day ${day.day}, locked`}>{content}</div> : <Link ref={isCurrent ? currentRef : undefined} key={day.day} to={`/program/${program.id}/day/${day.day}`} className={`flex min-h-[82px] items-center gap-4 rounded-2xl ${isCurrent ? 'my-2 bg-card px-3 shadow-sm ring-1 ring-line' : ''}`}>{content}</Link>
    })}</div>
    {completed.length === 30 && <div className="mb-5 rounded-[24px] bg-accent p-5 text-gray-950"><Sparkles /><h2 className="mt-3 text-2xl font-black">Challenge complete!</h2><p className="mt-1 opacity-70">Every day is still available whenever you want to repeat it.</p></div>}
  </div>
}
