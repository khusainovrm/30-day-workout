import type { WorkoutState } from '../../types'

export type WorkoutTransition =
  | 'START'
  | 'COUNTDOWN_DONE'
  | 'PAUSE'
  | 'RESUME'
  | 'COMPLETE'
  | 'REST_DONE'
  | 'START_NEXT'

export function getNextWorkoutState(
  current: WorkoutState,
  event: WorkoutTransition,
  countdownEnabled: boolean,
  autoNext: boolean
): WorkoutState {
  const machine: Partial<Record<WorkoutState, Partial<Record<WorkoutTransition, WorkoutState>>>> = {
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

interface CompleteExerciseInput {
  exerciseIndex: number
  exerciseId: string
  exerciseCount: number
  completedExerciseIds: string[]
}

export interface CompleteExerciseResult {
  completedExerciseIds: string[]
  completionToken: string
  isWorkoutComplete: boolean
  nextExerciseIndex: number
  nextState: 'rest' | 'workout-completed'
}

export function completeCurrentExercise({
  exerciseIndex,
  exerciseId,
  exerciseCount,
  completedExerciseIds
}: CompleteExerciseInput): CompleteExerciseResult {
  const completionToken = getExerciseCompletionToken(exerciseIndex, exerciseId)
  const isWorkoutComplete = exerciseIndex >= exerciseCount - 1

  return {
    completionToken,
    completedExerciseIds: Array.from(new Set([...completedExerciseIds, completionToken])),
    isWorkoutComplete,
    nextExerciseIndex: isWorkoutComplete ? exerciseIndex : exerciseIndex + 1,
    nextState: isWorkoutComplete ? 'workout-completed' : 'rest'
  }
}

export const getExerciseCompletionToken = (exerciseIndex: number, exerciseId: string) =>
  `${exerciseIndex}:${exerciseId}`

export function isExerciseCompleted(completedExerciseIds: string[], exerciseIndex: number, exerciseId: string) {
  return completedExerciseIds.includes(getExerciseCompletionToken(exerciseIndex, exerciseId))
    || completedExerciseIds.includes(exerciseId)
}

export function getFirstIncompleteExerciseIndex(
  exerciseIds: string[],
  completedExerciseIds: string[]
) {
  const index = exerciseIds.findIndex((exerciseId, exerciseIndex) =>
    !isExerciseCompleted(completedExerciseIds, exerciseIndex, exerciseId)
  )
  return index === -1 ? Math.max(0, exerciseIds.length - 1) : index
}
