import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronRight, CirclePause, CirclePlay, Flag, Lightbulb, Play, Trophy, X } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, ProgressBar, Sheet } from '../components/ui'
import { exercises } from '../data/exercises'
import { getProgram } from '../data/programs'
import { formatTime, useTimestampTimer } from '../hooks/useTimestampTimer'
import { audioService } from '../services/audio'
import { haptics } from '../services/haptics'
import { wakeLockService } from '../services/wakeLock'
import { useAppStore } from '../store/useAppStore'
import type { WorkoutState } from '../types'

type Transition = 'START' | 'COUNTDOWN_DONE' | 'PAUSE' | 'RESUME' | 'COMPLETE' | 'REST_DONE' | 'START_NEXT'

function getNextState(current: WorkoutState, event: Transition, countdownEnabled: boolean, autoNext: boolean): WorkoutState {
  const machine: Partial<Record<WorkoutState, Partial<Record<Transition, WorkoutState>>>> = {
    'exercise-preview': { START: countdownEnabled ? 'countdown' : 'exercise-running' },
    countdown: { COUNTDOWN_DONE: 'exercise-running' },
    'exercise-running': { PAUSE: 'exercise-paused', COMPLETE: 'exercise-completed' },
    'exercise-paused': { RESUME: 'exercise-running', COMPLETE: 'exercise-completed' },
    'exercise-completed': { REST_DONE: autoNext ? (countdownEnabled ? 'countdown' : 'exercise-running') : 'next-exercise' },
    rest: { REST_DONE: autoNext ? (countdownEnabled ? 'countdown' : 'exercise-running') : 'next-exercise' },
    'next-exercise': { START_NEXT: countdownEnabled ? 'countdown' : 'exercise-running' }
  }
  return machine[current]?.[event] ?? current
}

export function WorkoutPage() {
  const { programId, day: dayParam } = useParams()
  const navigate = useNavigate()
  const program = getProgram(programId ?? '')
  const dayNumber = Number(dayParam)
  const active = useAppStore(state => state.activeWorkoutSession)
  const setActive = useAppStore(state => state.setActiveSession)
  const updateActive = useAppStore(state => state.updateActiveSession)
  const completeExerciseInStore = useAppStore(state => state.completeExercise)
  const completeWorkout = useAppStore(state => state.completeWorkout)
  const viewed = useAppStore(state => state.viewedExerciseTutorials)
  const markViewed = useAppStore(state => state.markTutorialViewed)
  const settings = useAppStore(state => state.settings)
  const [exitOpen, setExitOpen] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const committed = useRef(false)
  const completionDuration = useRef(0)
  const voiceMarks = useRef(new Set<string>())

  const session = active && active.programId === programId && active.day === dayNumber ? active : null
  const day = program?.days[dayNumber - 1]
  const workoutItem = session && day ? day.exercises[session.exerciseIndex] : undefined
  const exercise = workoutItem ? exercises[workoutItem.exerciseId] : undefined
  const elapsedMs = useTimestampTimer(session?.exerciseStartedAt, session?.pausedAt, session?.totalPausedTime)
  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const restElapsed = useTimestampTimer(session?.restStartedAt)
  const restRemaining = Math.max(0, (session?.restDuration ?? 0) - Math.floor(restElapsed / 1000))
  const timedRemaining = workoutItem?.duration ? Math.max(0, workoutItem.duration - elapsedSeconds) : 0

  useEffect(() => {
    if (!program || !day || session) return
    setActive({ programId: program.id, day: dayNumber, exerciseIndex: 0, completedExerciseIds: [], state: 'exercise-preview', workoutStartedAt: Date.now(), totalPausedTime: 0 })
  }, [program, day, dayNumber, session, setActive])

  useEffect(() => {
    void wakeLockService.acquire(settings.keepAwake)
    document.addEventListener('visibilitychange', wakeLockService.handleVisibility)
    return () => { document.removeEventListener('visibilitychange', wakeLockService.handleVisibility); void wakeLockService.release() }
  }, [settings.keepAwake])

  useEffect(() => {
    if (session?.state !== 'countdown') return
    setCountdown(3)
    audioService.play('beep', settings.sound); haptics.tap(settings.haptics)
    const started = Date.now()
    let previous = 3
    const id = window.setInterval(() => {
      const next = 3 - Math.floor((Date.now() - started) / 1000)
      setCountdown(Math.max(0, next))
      if (next > 0 && next !== previous) { audioService.play('beep', settings.sound); haptics.tap(settings.haptics) }
      previous = next
      if (next <= 0) {
        window.clearInterval(id)
        audioService.play('start', settings.sound); haptics.start(settings.haptics)
        updateActive({ state: 'exercise-running', exerciseStartedAt: Date.now(), pausedAt: undefined, totalPausedTime: 0 })
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [session?.state, session?.exerciseIndex, settings.haptics, settings.sound, updateActive])

  useEffect(() => {
    if (session?.state !== 'exercise-running' || !workoutItem?.duration || elapsedSeconds <= 0 || elapsedSeconds % 30 !== 0) return
    const mark = `${session.exerciseIndex}:${elapsedSeconds}`
    if (voiceMarks.current.has(mark)) return
    voiceMarks.current.add(mark)
    audioService.announce(elapsedSeconds, settings.voice)
  }, [elapsedSeconds, session?.exerciseIndex, session?.state, settings.voice, workoutItem?.duration])

  const advanceAfterExercise = useCallback(() => {
    if (!session || !day || !workoutItem) return
    const token = `${session.exerciseIndex}:${workoutItem.exerciseId}`
    const completedExerciseIds = Array.from(new Set([...session.completedExerciseIds, token]))
    completeExerciseInStore(`${session.programId}:${session.day}`, token)
    audioService.play('finish', settings.sound); haptics.complete(settings.haptics)
    if (session.exerciseIndex >= day.exercises.length - 1) {
      updateActive({ completedExerciseIds, state: 'workout-completed', pausedAt: undefined })
      return
    }
    const restDuration = workoutItem.restDuration ?? settings.restDuration
    updateActive({
      completedExerciseIds,
      exerciseIndex: session.exerciseIndex + 1,
      state: 'rest',
      restStartedAt: Date.now(),
      restDuration,
      exerciseStartedAt: undefined,
      pausedAt: undefined,
      totalPausedTime: 0
    })
  }, [completeExerciseInStore, day, session, settings.haptics, settings.restDuration, settings.sound, updateActive, workoutItem])

  useEffect(() => {
    if (session?.state === 'exercise-running' && workoutItem?.duration && timedRemaining <= 0 && elapsedMs > 500) advanceAfterExercise()
  }, [advanceAfterExercise, elapsedMs, session?.state, timedRemaining, workoutItem?.duration])

  useEffect(() => {
    if (session?.state !== 'rest') return
    if (restRemaining > 0 && restRemaining <= 3 && restElapsed % 1000 < 250) audioService.play('beep', settings.sound)
    if (restRemaining === 0 && restElapsed > 500) updateActive({ state: getNextState('rest', 'REST_DONE', settings.countdown, settings.autoNext), restStartedAt: undefined })
  }, [restRemaining, restElapsed, session?.state, settings.autoNext, settings.countdown, settings.sound, updateActive])

  useEffect(() => {
    if (session?.state !== 'workout-completed' || committed.current || !day || !program) return
    committed.current = true
    const duration = Math.max(1, Math.floor((Date.now() - session.workoutStartedAt) / 1000))
    completionDuration.current = duration
    completeWorkout({ id: `${program.id}-${dayNumber}-${Date.now()}`, programId: program.id, day: dayNumber, completedAt: Date.now(), duration, exerciseCount: day.exercises.length })
    audioService.play('complete', settings.sound); haptics.workout(settings.haptics)
  }, [session?.state, session?.workoutStartedAt, day, program, dayNumber, completeWorkout, settings.haptics, settings.sound])

  const start = () => {
    if (!session || !exercise) return
    void audioService.unlock(); markViewed(exercise.id)
    const next = getNextState('exercise-preview', 'START', settings.countdown, settings.autoNext)
    updateActive({ state: next, exerciseStartedAt: next === 'exercise-running' ? Date.now() : undefined, totalPausedTime: 0 })
  }
  const pause = () => session && updateActive({ state: getNextState('exercise-running', 'PAUSE', settings.countdown, settings.autoNext), pausedAt: Date.now() })
  const resume = () => session && updateActive({ state: getNextState('exercise-paused', 'RESUME', settings.countdown, settings.autoNext), totalPausedTime: session.totalPausedTime + (Date.now() - (session.pausedAt ?? Date.now())), pausedAt: undefined })
  const startNext = () => {
    const next = getNextState('next-exercise', 'START_NEXT', settings.countdown, settings.autoNext)
    updateActive({ state: next, exerciseStartedAt: next === 'exercise-running' ? Date.now() : undefined, totalPausedTime: 0 })
  }
  const exit = () => { setActive(null); navigate(`/program/${programId}/day/${dayNumber}`, { replace: true }) }

  if (!program || !day) return <Navigate to="/" replace />
  if (!session || !exercise || !workoutItem) {
    if (committed.current) return <Completion programId={program.id} day={dayNumber} duration={completionDuration.current} onDone={() => navigate(`/program/${program.id}`)} />
    return <div className="min-h-dvh bg-ink" />
  }
  if (session.state === 'workout-completed') return <Completion programId={program.id} day={dayNumber} duration={Math.floor((Date.now() - session.workoutStartedAt) / 1000)} onDone={() => navigate(`/program/${program.id}`)} />

  const progress = ((session.exerciseIndex + (session.state === 'rest' || session.state === 'next-exercise' ? 1 : 0)) / day.exercises.length) * 100
  const compactTutorial = viewed.includes(exercise.id)
  return <div className="flex min-h-dvh flex-col bg-surface pb-safe pt-safe">
    <header className="px-5 pt-4"><div className="flex items-center justify-between"><button onClick={() => setExitOpen(true)} className="grid size-12 place-items-center rounded-full bg-card" aria-label="Выйти из тренировки"><X /></button><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.12em] text-muted">День {dayNumber}</p><p className="font-black">Упражнение {session.exerciseIndex + 1} из {day.exercises.length}</p></div><span className="size-12" /></div><ProgressBar value={progress} className="mt-4" /></header>
    <main className="flex flex-1 flex-col px-5 pb-5">
      <AnimatePresence mode="wait">
        {session.state === 'exercise-preview' && <motion.section key="preview" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col pt-6">
          <div className="relative overflow-hidden rounded-[28px] bg-[#e9efcf]"><motion.img key={exercise.id} src={exercise.images[0]} alt={`Техника упражнения «${exercise.name}»`} className="aspect-[4/2.7] w-full object-cover" initial={{ opacity: .35 }} animate={{ opacity: 1 }} /></div>
          <div className="mt-5 flex items-start justify-between gap-3"><div><p className="text-sm font-extrabold uppercase tracking-[.12em] text-muted">Следующее упражнение</p><h1 className="mt-1 text-4xl font-black tracking-[-.05em]">{exercise.name}</h1></div><span className="shrink-0 rounded-2xl bg-card px-4 py-3 text-lg font-black">{workoutItem.reps ? `${workoutItem.reps} повт.` : `${workoutItem.duration} сек.`}</span></div>
          {!compactTutorial ? <div className="mt-6 rounded-2xl bg-card p-4"><h2 className="flex items-center gap-2 font-black"><Lightbulb size={18} />Как выполнять</h2><ol className="mt-3 grid gap-2 text-sm text-muted">{exercise.instructions.map((instruction, index) => <li key={instruction} className="flex gap-3"><b className="text-ink">{index + 1}.</b>{instruction}</li>)}</ol>{exercise.tips?.[0] && <p className="mt-4 border-t border-line pt-3 text-sm"><strong>Совет:</strong> <span className="text-muted">{exercise.tips[0]}</span></p>}</div> : <p className="mt-5 text-sm text-muted">Ты уже видел эту технику. Двигайся плавно и не задерживай дыхание.</p>}
          <div className="mt-auto pt-5"><Button onClick={start} className="flex w-full items-center justify-center gap-2"><Play size={19} fill="currentColor" />НАЧАТЬ</Button></div>
        </motion.section>}

        {session.state === 'countdown' && <motion.section key="countdown" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="grid flex-1 place-items-center text-center"><div><p className="text-sm font-extrabold uppercase tracking-[.18em] text-muted">Приготовься</p><motion.div key={countdown} initial={{ scale: .55, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 text-[9rem] font-black leading-none tracking-[-.09em]">{countdown || 'СТАРТ'}</motion.div><p className="mt-5 text-xl font-black">{exercise.name}</p></div></motion.section>}

        {(session.state === 'exercise-running' || session.state === 'exercise-paused') && <motion.section key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col pt-8 text-center"><p className="text-sm font-extrabold uppercase tracking-[.15em] text-muted">{session.state === 'exercise-paused' ? 'Пауза' : 'Продолжай'}</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{exercise.name}</h1><div className="grid flex-1 place-items-center"><div><p className="font-mono text-[5.4rem] font-black leading-none tracking-[-.08em] tabular-nums">{workoutItem.duration ? formatTime(timedRemaining) : formatTime(elapsedSeconds)}</p><p className="mt-5 text-lg font-bold text-muted">{workoutItem.reps ? `${workoutItem.reps} повторений` : 'Осталось времени'}</p></div></div><div className="flex items-center gap-3"><button onClick={session.state === 'exercise-paused' ? resume : pause} className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line bg-card" aria-label={session.state === 'exercise-paused' ? 'Продолжить' : 'Пауза'}>{session.state === 'exercise-paused' ? <CirclePlay /> : <CirclePause />}</button><Button onClick={() => workoutItem.duration ? setFinishOpen(true) : advanceAfterExercise()} className="flex flex-1 items-center justify-center gap-2">{workoutItem.duration ? <><Flag size={18} />ЗАВЕРШИТЬ РАНЬШЕ</> : <><Check size={20} />ГОТОВО</>}</Button></div></motion.section>}

        {session.state === 'rest' && <motion.section key="rest" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col pt-10 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-gray-950"><Check size={26} strokeWidth={3} /></span><h1 className="mt-4 text-4xl font-black tracking-[-.05em]">Отлично!</h1><div className="grid flex-1 place-items-center"><div><p className="text-sm font-extrabold uppercase tracking-[.15em] text-muted">Отдых</p><p className="mt-2 font-mono text-[5.4rem] font-black leading-none tracking-[-.08em] tabular-nums">{formatTime(restRemaining)}</p><div className="mx-auto mt-7 rounded-2xl bg-card px-5 py-3 text-left"><p className="text-xs font-bold uppercase text-muted">Дальше</p><p className="font-black">{exercise.name} · {workoutItem.reps ? `${workoutItem.reps} повт.` : `${workoutItem.duration} сек.`}</p></div></div></div><Button variant="secondary" onClick={() => updateActive({ state: settings.autoNext ? (settings.countdown ? 'countdown' : 'exercise-running') : 'next-exercise', restStartedAt: undefined, exerciseStartedAt: settings.autoNext && !settings.countdown ? Date.now() : undefined })} className="w-full">ПРОПУСТИТЬ ОТДЫХ</Button></motion.section>}

        {session.state === 'next-exercise' && <motion.section key="next" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col pt-10 text-center"><p className="text-sm font-extrabold uppercase tracking-[.15em] text-muted">Начни, когда будешь готов</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{exercise.name}</h1><div className="grid flex-1 place-items-center"><img src={exercise.images[0]} alt="" className="w-full rounded-[28px]" /></div><Button onClick={startNext} className="flex w-full items-center justify-center gap-2">НАЧАТЬ ДАЛЬШЕ<ChevronRight size={20} /></Button></motion.section>}
      </AnimatePresence>
    </main>
    <Sheet open={exitOpen} title="Тренировка не закончена" onClose={() => setExitOpen(false)}><p className="text-muted">Выполненные упражнения сохранены, но этот день не будет завершён.</p><div className="mt-6 grid gap-3"><Button onClick={() => setExitOpen(false)}>ПРОДОЛЖИТЬ ТРЕНИРОВКУ</Button><Button variant="secondary" onClick={exit}>ВЫЙТИ</Button></div></Sheet>
    <Sheet open={finishOpen} title="Завершить упражнение раньше?" onClose={() => setFinishOpen(false)}><p className="text-muted">Упражнение будет засчитано, после чего начнётся отдых.</p><div className="mt-6 grid gap-3"><Button onClick={() => { setFinishOpen(false); advanceAfterExercise() }}>ЗАВЕРШИТЬ РАНЬШЕ</Button><Button variant="secondary" onClick={() => setFinishOpen(false)}>ПРОДОЛЖИТЬ</Button></div></Sheet>
  </div>
}

function Completion({ programId, day, duration, onDone }: { programId: string; day: number; duration: number; onDone: () => void }) {
  const navigate = useNavigate()
  const program = getProgram(programId)!
  const item = program.days[day - 1]
  return <div className="relative flex min-h-dvh flex-col overflow-hidden bg-ink p-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(32px+env(safe-area-inset-top))] text-white">
    <div className="pointer-events-none absolute left-1/2 top-20 size-64 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
    <div className="relative flex flex-1 flex-col items-center justify-center text-center"><motion.div initial={{ scale: .6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="grid size-24 place-items-center rounded-[32px] bg-accent text-gray-950"><Trophy size={44} /></motion.div><p className="mt-8 text-sm font-black uppercase tracking-[.18em] text-accent">Прогресс челленджа</p><h1 className="mt-2 text-5xl font-black tracking-[-.06em]">День {day}<br />завершён</h1><div className="mt-10 grid w-full grid-cols-3 divide-x divide-white/15 rounded-[24px] border border-white/10 bg-white/5 py-5"><div><b className="block text-xl">{formatTime(duration)}</b><span className="text-xs text-white/50">Тренировка</span></div><div><b className="block text-xl">{item.exercises.length}</b><span className="text-xs text-white/50">Упражнений</span></div><div><b className="block text-xl">+1</b><span className="text-xs text-white/50">День</span></div></div></div>
    <div className="relative grid gap-3"><Button className="bg-accent text-gray-950" onClick={onDone}>ГОТОВО</Button><Button variant="ghost" className="text-white" onClick={() => navigate('/progress')}>ПОСМОТРЕТЬ ПРОГРЕСС</Button></div>
  </div>
}
