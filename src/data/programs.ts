import { exercises } from './exercises'
import type { Category, Difficulty, Variant, WorkoutDay, WorkoutExercise, WorkoutProgram } from '../types'

export const categoryMeta = {
  body: { title: 'Всё тело', eyebrow: 'Сила и выносливость', icon: '◆', gradient: 'from-lime-300 to-emerald-300' },
  arms: { title: 'Руки', eyebrow: 'Сильный верх тела', icon: '●', gradient: 'from-orange-300 to-rose-300' },
  abs: { title: 'Пресс', eyebrow: 'Сильный корпус', icon: '▲', gradient: 'from-sky-300 to-indigo-300' }
} as const

export const difficultyMeta = {
  beginner: { title: 'Начальный', minutes: '10–15 мин/день', intensity: 'Низкая нагрузка', count: 5 },
  intermediate: { title: 'Средний', minutes: '15–20 мин/день', intensity: 'Средняя нагрузка', count: 6 },
  advanced: { title: 'Продвинутый', minutes: '20–28 мин/день', intensity: 'Высокая нагрузка', count: 7 }
} as const

const pools: Record<Category, string[]> = {
  body: ['squats', 'jumping-jacks', 'lunges', 'push-ups', 'glute-bridge', 'plank', 'mountain-climbers', 'bird-dog', 'high-knees', 'superman', 'calf-raises', 'burpees'],
  arms: ['wall-push-ups', 'arm-circles', 'knee-push-ups', 'shoulder-taps', 'triceps-dips', 'push-ups', 'wide-push-ups', 'plank-up-downs', 'diamond-push-ups', 'pike-push-ups'],
  abs: ['dead-bug', 'crunches', 'heel-touches', 'plank', 'bicycle-crunches', 'reverse-crunch', 'flutter-kicks', 'leg-raises', 'russian-twists', 'side-plank', 'toe-touches', 'mountain-climbers']
}

const levels: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 }

function createDay(category: Category, difficulty: Difficulty, variant: Variant, day: number): WorkoutDay {
  const level = levels[difficulty]
  const recovery = day % 8 === 0 || day === 30
  const cycleDay = (day - 1) % 8
  const cycle = Math.floor((day - 1) / 8)
  const load = recovery ? Math.max(0, cycle - 1) : cycle + Math.min(cycleDay, 3)
  const count = recovery ? 4 : difficultyMeta[difficulty].count
  const offset = (day * 2 + (variant === 'B' ? 3 : 0) + level) % pools[category].length
  const selected = Array.from({ length: count }, (_, index) => pools[category][(offset + index) % pools[category].length])
  const dayExercises: WorkoutExercise[] = selected.map((exerciseId, index) => {
    const exercise = exercises[exerciseId]
    const restDuration = difficulty === 'beginner' ? 30 : difficulty === 'intermediate' ? 25 : 20
    if (exercise.mode === 'timed') {
      return { exerciseId, duration: (recovery ? 20 : 25 + level * 5 + load * 3) + index % 2 * 5, restDuration }
    }
    return { exerciseId, reps: (recovery ? 8 : 8 + level * 3 + load) + index % 3 * 2, restDuration }
  })
  return {
    day,
    title: recovery ? (day === 30 ? 'Финальная тренировка' : 'Восстановление и мобильность') : undefined,
    estimatedDuration: Math.max(7, Math.round(count * (1.7 + level * .5))),
    exercises: dayExercises,
    type: recovery ? 'recovery' : 'normal'
  }
}

export const programs: WorkoutProgram[] = (['body', 'arms', 'abs'] as Category[]).flatMap(category =>
  (['beginner', 'intermediate', 'advanced'] as Difficulty[]).flatMap(difficulty =>
    (['A', 'B'] as Variant[]).map(variant => ({
      id: `${category}-${difficulty}-${variant.toLowerCase()}`,
      category, difficulty, variant,
      days: Array.from({ length: 30 }, (_, index) => createDay(category, difficulty, variant, index + 1))
    }))
  )
)

export const getProgram = (id: string) => programs.find(program => program.id === id)
