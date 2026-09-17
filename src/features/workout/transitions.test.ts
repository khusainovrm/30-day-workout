import { describe, expect, it } from 'vitest'
import {
  completeCurrentExercise,
  getFirstIncompleteExerciseIndex,
  getNextWorkoutState,
  isExerciseCompleted
} from './transitions'

describe('workout state transitions', () => {
  it('starts through countdown when it is enabled', () => {
    expect(getNextWorkoutState('exercise-preview', 'START', true, false)).toBe('countdown')
    expect(getNextWorkoutState('countdown', 'COUNTDOWN_DONE', true, false)).toBe('exercise-running')
  })

  it('starts immediately and supports pause and resume', () => {
    expect(getNextWorkoutState('exercise-preview', 'START', false, false)).toBe('exercise-running')
    expect(getNextWorkoutState('exercise-running', 'PAUSE', false, false)).toBe('exercise-paused')
    expect(getNextWorkoutState('exercise-paused', 'RESUME', false, false)).toBe('exercise-running')
  })

  it('waits for START NEXT unless auto next is enabled', () => {
    expect(getNextWorkoutState('rest', 'REST_DONE', true, false)).toBe('next-exercise')
    expect(getNextWorkoutState('rest', 'REST_DONE', true, true)).toBe('countdown')
    expect(getNextWorkoutState('rest', 'REST_DONE', false, true)).toBe('exercise-running')
  })

  it('moves through completion and explicitly starts the next exercise', () => {
    expect(getNextWorkoutState('exercise-running', 'COMPLETE', true, false)).toBe('exercise-completed')
    expect(getNextWorkoutState('exercise-paused', 'COMPLETE', true, false)).toBe('exercise-completed')
    expect(getNextWorkoutState('exercise-completed', 'REST_DONE', true, false)).toBe('next-exercise')
    expect(getNextWorkoutState('next-exercise', 'START_NEXT', true, false)).toBe('countdown')
  })

  it('ignores transitions that are invalid for the current state', () => {
    expect(getNextWorkoutState('exercise-preview', 'PAUSE', true, false)).toBe('exercise-preview')
  })
})

describe('exercise completion transitions', () => {
  it('does not complete the workout before the final exercise', () => {
    const result = completeCurrentExercise({
      exerciseIndex: 0,
      exerciseId: 'squats',
      exerciseCount: 2,
      completedExerciseIds: []
    })

    expect(result.nextState).toBe('rest')
    expect(result.isWorkoutComplete).toBe(false)
    expect(result.nextExerciseIndex).toBe(1)
  })

  it('completes the workout only after the final exercise', () => {
    const result = completeCurrentExercise({
      exerciseIndex: 1,
      exerciseId: 'plank',
      exerciseCount: 2,
      completedExerciseIds: ['0:squats']
    })

    expect(result.nextState).toBe('workout-completed')
    expect(result.isWorkoutComplete).toBe(true)
    expect(result.completedExerciseIds).toEqual(['0:squats', '1:plank'])
  })
})

describe('persisted exercise progress compatibility', () => {
  it('recognizes both current indexed tokens and legacy exercise ids', () => {
    expect(isExerciseCompleted(['0:squats'], 0, 'squats')).toBe(true)
    expect(isExerciseCompleted(['squats'], 0, 'squats')).toBe(true)
  })

  it('resumes from the first incomplete exercise', () => {
    expect(getFirstIncompleteExerciseIndex(['squats', 'lunges', 'plank'], ['squats', '1:lunges'])).toBe(2)
  })
})
