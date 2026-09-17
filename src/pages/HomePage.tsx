import { ArrowRight, CloudOff, Play, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { categoryMeta, getProgram } from '../data/programs'
import { getCurrentDay, useAppStore } from '../store/useAppStore'
import type { Category } from '../types'
import { ProgressBar } from '../components/ui'
import { useEffect, useState } from 'react'

export function HomePage() {
  const { selectedPrograms, completedDays, activeWorkoutSession } = useAppStore()
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    window.addEventListener('online', sync); window.addEventListener('offline', sync)
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync) }
  }, [])
  const currentProgramId = activeWorkoutSession?.programId ?? Object.values(selectedPrograms)[0]
  const currentProgram = currentProgramId ? getProgram(currentProgramId) : undefined
  const currentDay = currentProgram ? getCurrentDay(currentProgram.id, completedDays) : 1
  const continueHref = activeWorkoutSession ? `/workout/${activeWorkoutSession.programId}/${activeWorkoutSession.day}` : currentProgram ? `/program/${currentProgram.id}/day/${currentDay}` : '/category/body'
  return <div className="px-5 pt-5">
    <div className="flex items-end justify-between"><div><p className="text-sm font-bold text-muted">MAKE TODAY COUNT</p><h1 className="mt-1 text-4xl font-black tracking-[-.05em]">30 Day<br />Challenge</h1></div>{offline && <span className="mb-1 flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-muted"><CloudOff size={13} />Offline</span>}</div>
    {currentProgram && <Link to={continueHref} className="mt-7 block overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-xl">
      <div className="flex items-start justify-between"><span className="rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-ink">{activeWorkoutSession ? 'IN PROGRESS' : 'UP NEXT'}</span>{activeWorkoutSession ? <RotateCcw className="text-accent" /> : <Play className="text-accent" fill="currentColor" />}</div>
      <p className="mt-8 text-sm font-bold text-white/55">{activeWorkoutSession ? `Exercise ${activeWorkoutSession.exerciseIndex + 1}` : 'Continue Workout'}</p>
      <h2 className="mt-1 text-2xl font-black">Day {activeWorkoutSession?.day ?? currentDay} · {categoryMeta[currentProgram.category].title}</h2>
      <p className="mt-1 text-sm text-white/55 capitalize">{currentProgram.difficulty} · Plan {currentProgram.variant}</p>
      <div className="mt-5 flex min-h-12 items-center justify-between rounded-2xl bg-accent px-5 font-extrabold text-ink"><span>{activeWorkoutSession ? 'RESUME' : 'CONTINUE'}</span><ArrowRight size={19} /></div>
    </Link>}
    <div className="mb-4 mt-8 flex items-center justify-between"><h2 className="text-xl font-black">Choose your focus</h2><span className="text-sm font-semibold text-muted">3 programs</span></div>
    <div className="grid gap-4">{(Object.keys(categoryMeta) as Category[]).map((category, index) => {
      const meta = categoryMeta[category]
      const selected = selectedPrograms[category]
      const complete = selected ? (completedDays[selected]?.length ?? 0) : 0
      return <motion.div key={category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }}><Link to={`/category/${category}`} className={`block overflow-hidden rounded-[24px] bg-gradient-to-br ${meta.gradient} p-5 text-gray-950`}>
        <div className="flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] opacity-60">{meta.eyebrow}</p><h3 className="mt-1 text-2xl font-black">{meta.title}</h3></div><span className="text-3xl opacity-50">{meta.icon}</span></div>
        <div className="mt-8 flex items-end justify-between"><div className="min-w-0 flex-1"><p className="mb-2 text-sm font-bold">{selected ? `${complete} / 30 days` : 'Choose a plan'}</p><ProgressBar value={complete / 30 * 100} /></div><ArrowRight className="ml-5" /> </div>
      </Link></motion.div>
    })}</div>
  </div>
}
