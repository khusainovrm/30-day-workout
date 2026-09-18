import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronRight, CirclePause, CirclePlay, Flag, Play, Trophy, X } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ExercisePreview } from '../components/ExercisePreview'
import { ExerciseTutorial } from '../components/ExerciseTutorial'
import { Button, ProgressBar, Sheet } from '../components/ui'
import { exercises } from '../data/exercises'
import { getProgram } from '../data/programs'
import { completeCurrentExercise, getNextWorkoutState } from '../features/workout/transitions'
import { getExerciseVoiceCue } from '../features/workout/voiceCues'
import { formatTime, useTimestampTimer } from '../hooks/useTimestampTimer'
import { audioService } from '../services/audio'
import { haptics } from '../services/haptics'
import { wakeLockService } from '../services/wakeLock'
import { useAppStore } from '../store/useAppStore'

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
  const sessionInitialized = useRef(false)
  const exiting = useRef(false)
  const completionDuration = useRef(0)

  const session = active && active.programId === programId && active.day === dayNumber ? active : null
  const day = program?.days[dayNumber - 1]
  const workoutItem = session && day ? day.exercises[session.exerciseIndex] : undefined
  const exercise = workoutItem ? exercises[workoutItem.exerciseId] : undefined
  const nextWorkoutItem = session && day ? day.exercises[session.exerciseIndex + 1] : undefined
  const nextExerciseImages = nextWorkoutItem ? exercises[nextWorkoutItem.exerciseId]?.images : undefined
  const elapsedMs = useTimestampTimer(session?.exerciseStartedAt, session?.pausedAt, session?.totalPausedTime)
  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const restElapsed = useTimestampTimer(session?.restStartedAt)
  const restRemaining = Math.max(0, (session?.restDuration ?? 0) - Math.floor(restElapsed / 1000))
  const timedRemaining = workoutItem?.duration ? Math.max(0, workoutItem.duration - elapsedSeconds) : 0

  useEffect(() => {
    if (session) {
      sessionInitialized.current = true
      return
    }
    if (!program || !day || sessionInitialized.current || committed.current || exiting.current) return
    sessionInitialized.current = true
    setActive({ programId: program.id, day: dayNumber, exerciseIndex: 0, completedExerciseIds: [], state: 'exercise-preview', workoutStartedAt: Date.now(), totalPausedTime: 0 })
  }, [program, day, dayNumber, session, setActive])

  useEffect(() => {
    nextExerciseImages?.forEach(source => {
      const image = new Image()
      image.decoding = 'async'
      image.src = source
    })
  }, [nextExerciseImages])

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
    if (session?.state !== 'exercise-running' || !workoutItem) return
    const cue = getExerciseVoiceCue({
      duration: workoutItem.duration,
      elapsedSeconds,
      remainingSeconds: timedRemaining
    })
    if (!cue) return
    audioService.announce(cue, settings.voice, `${session.workoutStartedAt}:${session.exerciseIndex}:${cue}`)
  }, [elapsedSeconds, session?.exerciseIndex, session?.state, session?.workoutStartedAt, settings.voice, timedRemaining, workoutItem])

  const advanceAfterExercise = useCallback(() => {
    if (!session || !day || !workoutItem) return
    const result = completeCurrentExercise({
      exerciseIndex: session.exerciseIndex,
      exerciseId: workoutItem.exerciseId,
      exerciseCount: day.exercises.length,
      completedExerciseIds: session.completedExerciseIds
    })
    completeExerciseInStore(`${session.programId}:${session.day}`, result.completionToken)
    audioService.play('finish', settings.sound); haptics.complete(settings.haptics)
    if (result.isWorkoutComplete) {
      updateActive({
        completedExerciseIds: result.completedExerciseIds,
        state: result.nextState,
        workoutCompletedAt: Date.now(),
        pausedAt: undefined
      })
      return
    }
    const restDuration = workoutItem.restDuration ?? settings.restDuration
    updateActive({
      completedExerciseIds: result.completedExerciseIds,
      exerciseIndex: result.nextExerciseIndex,
      state: result.nextState,
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
    if (restRemaining === 0 && restElapsed > 500) {
      audioService.announce('rest-finished', settings.voice, `${session.workoutStartedAt}:${session.exerciseIndex}:rest-finished`)
      updateActive({ state: getNextWorkoutState('rest', 'REST_DONE', settings.countdown, settings.autoNext), restStartedAt: undefined })
    }
  }, [restRemaining, restElapsed, session?.exerciseIndex, session?.state, session?.workoutStartedAt, settings.autoNext, settings.countdown, settings.sound, settings.voice, updateActive])

  useEffect(() => {
    if (session?.state !== 'workout-completed' || committed.current || !day || !program) return
    committed.current = true
    const completedAt = session.workoutCompletedAt ?? Date.now()
    const duration = Math.max(1, Math.floor((completedAt - session.workoutStartedAt) / 1000))
    completionDuration.current = duration
    completeWorkout({ id: `${program.id}-${dayNumber}-${session.workoutStartedAt}`, programId: program.id, day: dayNumber, completedAt, duration, exerciseCount: day.exercises.length })
    audioService.play('complete', settings.sound); haptics.workout(settings.haptics)
    audioService.announce('workout-completed', settings.voice, `${session.workoutStartedAt}:workout-completed`, settings.sound ? 650 : 0)
  }, [session?.state, session?.workoutStartedAt, session?.workoutCompletedAt, day, program, dayNumber, completeWorkout, settings.haptics, settings.sound, settings.voice])

  const start = () => {
    if (!session || !exercise) return
    void audioService.unlock()
    const next = getNextWorkoutState('exercise-preview', 'START', settings.countdown, settings.autoNext)
    updateActive({ state: next, exerciseStartedAt: next === 'exercise-running' ? Date.now() : undefined, totalPausedTime: 0 })
  }
  const pause = () => session && updateActive({ state: getNextWorkoutState('exercise-running', 'PAUSE', settings.countdown, settings.autoNext), pausedAt: Date.now() })
  const resume = () => session && updateActive({ state: getNextWorkoutState('exercise-paused', 'RESUME', settings.countdown, settings.autoNext), totalPausedTime: session.totalPausedTime + (Date.now() - (session.pausedAt ?? Date.now())), pausedAt: undefined })
  const startNext = () => {
    const next = getNextWorkoutState('next-exercise', 'START_NEXT', settings.countdown, settings.autoNext)
    updateActive({ state: next, exerciseStartedAt: next === 'exercise-running' ? Date.now() : undefined, totalPausedTime: 0 })
  }
  const exit = () => {
    exiting.current = true
    setActive(null)
    navigate(`/program/${programId}/day/${dayNumber}`, { replace: true })
  }
  const returnToCalendar = () => {
    exiting.current = true
    setActive(null)
    navigate(`/program/${programId}`, { replace: true })
  }

  if (!program || !day) return <Navigate to="/" replace />
  if (!session || !exercise || !workoutItem) {
    if (committed.current) return <Completion programId={program.id} day={dayNumber} duration={completionDuration.current} onDone={returnToCalendar} />
    return <div className="min-h-dvh bg-ink" />
  }
  if (session.state === 'workout-completed') {
    const completedAt = session.workoutCompletedAt ?? Date.now()
    return <Completion programId={program.id} day={dayNumber} duration={Math.max(1, Math.floor((completedAt - session.workoutStartedAt) / 1000))} onDone={returnToCalendar} />
  }

  const progress = ((session.exerciseIndex + (session.state === 'rest' || session.state === 'next-exercise' ? 1 : 0)) / day.exercises.length) * 100
  const compactTutorial = viewed.includes(exercise.id)
  return <div className="flex min-h-dvh flex-col bg-surface pb-safe pt-safe">
    <header className="px-5 pt-4"><div className="flex items-center justify-between"><button onClick={() => setExitOpen(true)} className="grid size-12 place-items-center rounded-full bg-card" aria-label="Выйти из тренировки"><X /></button><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.12em] text-muted">День {dayNumber}</p><p className="font-black">Упражнение {session.exerciseIndex + 1} из {day.exercises.length}</p></div><span className="size-12" /></div><ProgressBar value={progress} className="mt-4" /></header>
    <main className="flex flex-1 flex-col px-5 pb-5">
      <AnimatePresence mode="wait">
        {session.state === 'exercise-preview' && <motion.section key="preview" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col pt-6">
          <ExercisePreview images={exercise.images} exerciseName={exercise.name} />
          <div className="mt-5 flex items-start justify-between gap-3"><div><p className="text-sm font-extrabold uppercase tracking-[.12em] text-muted">Следующее упражнение</p><h1 className="mt-1 text-4xl font-black tracking-[-.05em]">{exercise.name}</h1></div><span className="shrink-0 rounded-2xl bg-card px-4 py-3 text-lg font-black">{workoutItem.reps ? `${workoutItem.reps} повт.` : `${workoutItem.duration} сек.`}</span></div>
          <ExerciseTutorial
            key={exercise.id}
            exercise={exercise}
            previouslyViewed={compactTutorial}
            onViewed={markViewed}
            onSkip={start}
          />
          <div className="mt-auto pt-5"><Button onClick={start} className="flex w-full items-center justify-center gap-2"><Play size={19} fill="currentColor" />НАЧАТЬ</Button></div>
        </motion.section>}

        {session.state === 'countdown' && <motion.section key="countdown" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="grid flex-1 place-items-center text-center"><div><p className="text-sm font-extrabold uppercase tracking-[.18em] text-muted">Приготовься</p><motion.div key={countdown} initial={{ scale: .55, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 text-[9rem] font-black leading-none tracking-[-.09em]">{countdown || 'СТАРТ'}</motion.div><p className="mt-5 text-xl font-black">{exercise.name}</p></div></motion.section>}

        {(session.state === 'exercise-running' || session.state === 'exercise-paused') && <motion.section key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col pt-8 text-center"><p className="text-sm font-extrabold uppercase tracking-[.15em] text-muted">{session.state === 'exercise-paused' ? 'Пауза' : 'Продолжай'}</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{exercise.name}</h1><div className="flex flex-1 items-start justify-center pt-[clamp(3rem,12dvh,7rem)]"><div><p data-testid="workout-timer" className="font-mono text-[5.4rem] font-black leading-none tracking-[-.08em] tabular-nums">{workoutItem.duration ? formatTime(timedRemaining) : formatTime(elapsedSeconds)}</p><p className="mt-5 text-lg font-bold text-muted">{workoutItem.reps ? `${workoutItem.reps} повторений` : 'Осталось времени'}</p></div></div><div className="flex items-center gap-3"><button onClick={session.state === 'exercise-paused' ? resume : pause} className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line bg-card" aria-label={session.state === 'exercise-paused' ? 'Продолжить' : 'Пауза'}>{session.state === 'exercise-paused' ? <CirclePlay /> : <CirclePause />}</button><Button onClick={() => workoutItem.duration ? setFinishOpen(true) : advanceAfterExercise()} className="flex flex-1 items-center justify-center gap-2">{workoutItem.duration ? <><Flag size={18} />ЗАВЕРШИТЬ РАНЬШЕ</> : <><Check size={20} />ГОТОВО</>}</Button></div></motion.section>}

        {session.state === 'rest' && <motion.section key="rest" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col pt-10 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-gray-950"><Check size={26} strokeWidth={3} /></span><h1 className="mt-4 text-4xl font-black tracking-[-.05em]">Отлично!</h1><div className="grid flex-1 place-items-center"><div><p className="text-sm font-extrabold uppercase tracking-[.15em] text-muted">Отдых</p><p className="mt-2 font-mono text-[5.4rem] font-black leading-none tracking-[-.08em] tabular-nums">{formatTime(restRemaining)}</p><div className="mx-auto mt-7 rounded-2xl bg-card px-5 py-3 text-left"><p className="text-xs font-bold uppercase text-muted">Дальше</p><p className="font-black">{exercise.name} · {workoutItem.reps ? `${workoutItem.reps} повт.` : `${workoutItem.duration} сек.`}</p></div></div></div><Button variant="secondary" onClick={() => updateActive({ state: settings.autoNext ? (settings.countdown ? 'countdown' : 'exercise-running') : 'next-exercise', restStartedAt: undefined, exerciseStartedAt: settings.autoNext && !settings.countdown ? Date.now() : undefined })} className="w-full">ПРОПУСТИТЬ ОТДЫХ</Button></motion.section>}

        {session.state === 'next-exercise' && <motion.section key="next" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col pt-10 text-center"><p className="text-sm font-extrabold uppercase tracking-[.15em] text-muted">Начни, когда будешь готов</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{exercise.name}</h1><div className="grid flex-1 place-items-center"><img src={exercise.images[0]} alt="" className="w-full rounded-[28px]" /></div><Button onClick={startNext} className="flex w-full items-center justify-center gap-2">НАЧАТЬ ДАЛЬШЕ<ChevronRight size={20} /></Button></motion.section>}
      </AnimatePresence>
    </main>
    <Sheet open={exitOpen} title="Тренировка не закончена" onClose={() => setExitOpen(false)}><p className="text-muted">Выполненные упражнения сохранены, но этот день не будет завершён.</p><div className="mt-6 grid gap-3"><Button onClick={() => setExitOpen(false)}>ПРОДОЛЖИТЬ ТРЕНИРОВКУ</Button><Button variant="secondary" onClick={exit}>ВЫЙТИ</Button></div></Sheet>
    <Sheet open={finishOpen} title="Завершить упражнение раньше?" onClose={() => setFinishOpen(false)}><p className="text-muted">Упражнение будет засчитано, после чего начнётся отдых.</p><div className="mt-6 grid gap-3"><Button onClick={() => { setFinishOpen(false); advanceAfterExercise() }}>ЗАВЕРШИТЬ РАНЬШЕ</Button><Button variant="secondary" onClick={() => setFinishOpen(false)}>ПРОДОЛЖИТЬ</Button></div></Sheet>
  </div>
}

function Completion({ programId, day, duration, onDone }: { programId: string; day: number; duration: number; onDone: () => void }) {
  const program = getProgram(programId)!
  const item = program.days[day - 1]
  return <div className="relative flex min-h-dvh flex-col overflow-hidden bg-ink p-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(32px+env(safe-area-inset-top))] text-white">
    <div className="pointer-events-none absolute left-1/2 top-20 size-64 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
    <div className="relative flex flex-1 flex-col items-center justify-center text-center"><motion.div initial={{ scale: .6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="grid size-28 place-items-center rounded-[36px] bg-accent text-gray-950 shadow-[0_20px_70px_rgba(190,242,100,.25)]"><Trophy size={58} strokeWidth={2.4} aria-hidden="true" /></motion.div><p className="mt-8 text-sm font-black uppercase tracking-[.18em] text-accent">День {day} завершён</p><h1 className="mt-2 text-5xl font-black tracking-[-.06em]">Ты молодец!</h1><p className="mt-4 max-w-xs text-base font-semibold leading-6 text-white/65">Все упражнения выполнены. Отличная работа — время восстановиться.</p><div className="mt-10 grid w-full grid-cols-3 divide-x divide-white/15 rounded-[24px] border border-white/10 bg-white/5 py-5"><div><b className="block text-xl">{formatTime(duration)}</b><span className="text-xs text-white/50">Тренировка</span></div><div><b className="block text-xl">{item.exercises.length}</b><span className="text-xs text-white/50">Упражнений</span></div><div><b className="block text-xl">+1</b><span className="text-xs text-white/50">День</span></div></div></div>
    <Button className="relative flex w-full items-center justify-center gap-2 bg-accent text-gray-950" onClick={onDone}><CalendarDays size={20} aria-hidden="true" />ВЕРНУТЬСЯ К КАЛЕНДАРЮ</Button>
  </div>
}
