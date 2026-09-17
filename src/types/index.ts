export type Category = 'body' | 'arms' | 'abs'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type Variant = 'A' | 'B'
export type ExerciseMode = 'reps' | 'timed'
export type WorkoutState =
  | 'exercise-preview' | 'countdown' | 'exercise-running' | 'exercise-paused'
  | 'exercise-completed' | 'rest' | 'next-exercise' | 'workout-completed'

export interface Exercise {
  id: string
  name: string
  category: Category
  mode: ExerciseMode
  images: string[]
  instructions: string[]
  tips?: string[]
  commonMistakes?: string[]
}

export interface WorkoutExercise {
  exerciseId: string
  reps?: number
  duration?: number
  restDuration?: number
}

export interface WorkoutDay {
  day: number
  title?: string
  estimatedDuration: number
  exercises: WorkoutExercise[]
  type?: 'normal' | 'recovery'
}

export interface WorkoutProgram {
  id: string
  category: Category
  difficulty: Difficulty
  variant: Variant
  days: WorkoutDay[]
}

export interface ActiveWorkoutSession {
  programId: string
  day: number
  exerciseIndex: number
  completedExerciseIds: string[]
  state: WorkoutState
  workoutStartedAt: number
  exerciseStartedAt?: number
  pausedAt?: number
  totalPausedTime: number
  restStartedAt?: number
  restDuration?: number
  elapsedBeforePause?: number
}

export interface WorkoutHistoryItem {
  id: string
  programId: string
  day: number
  completedAt: number
  duration: number
  exerciseCount: number
}

export interface Settings {
  sound: boolean
  voice: boolean
  haptics: boolean
  keepAwake: boolean
  countdown: boolean
  autoNext: boolean
  restDuration: number
  theme: 'system' | 'light' | 'dark'
}
