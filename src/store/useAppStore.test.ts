// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { getCurrentDay, mergePersistedAppState, migratePersistedAppState, useAppStore } from './useAppStore'

const programId = 'body-beginner-a'

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({
    version: 1,
    hasOnboarded: true,
    selectedPrograms: {},
    completedDays: {},
    completedExercises: {},
    workoutHistory: [],
    activeWorkoutSession: null,
    viewedExerciseTutorials: [],
    settings: {
      sound: true,
      voice: false,
      haptics: true,
      keepAwake: true,
      countdown: true,
      autoNext: false,
      restDuration: 30,
      theme: 'system'
    },
    dismissedInstall: false
  })
})

describe('getCurrentDay', () => {
  it('returns the first incomplete day regardless of stored order', () => {
    expect(getCurrentDay(programId, {})).toBe(1)
    expect(getCurrentDay(programId, { [programId]: [3, 1] })).toBe(2)
    expect(getCurrentDay(programId, { [programId]: Array.from({ length: 30 }, (_, index) => index + 1) })).toBe(30)
  })
})

describe('persisted store compatibility', () => {
  it('migrates old partial state and restores missing session defaults', () => {
    const current = useAppStore.getState()
    const migrated = migratePersistedAppState({
      hasOnboarded: true,
      completedDays: { [programId]: [1] },
      settings: { sound: false },
      activeWorkoutSession: {
        programId,
        day: 2,
        exerciseIndex: 1,
        state: 'exercise-paused',
        workoutStartedAt: 1_000
      }
    }, 0)
    const restored = mergePersistedAppState(migrated, current)

    expect(restored.version).toBe(1)
    expect(restored.completedDays[programId]).toEqual([1])
    expect(restored.settings.sound).toBe(false)
    expect(restored.settings.restDuration).toBe(30)
    expect(restored.activeWorkoutSession?.completedExerciseIds).toEqual([])
    expect(restored.activeWorkoutSession?.totalPausedTime).toBe(0)
    expect(restored.viewedExerciseTutorials).toEqual([])
  })

  it('resets progress without changing preferences or onboarding', () => {
    useAppStore.setState({
      selectedPrograms: { body: programId },
      completedDays: { [programId]: [1, 2] },
      completedExercises: { [`${programId}:3`]: ['0:squats'] },
      workoutHistory: [{ id: 'history', programId, day: 1, completedAt: 10, duration: 20, exerciseCount: 5 }],
      activeWorkoutSession: {
        programId,
        day: 3,
        exerciseIndex: 1,
        completedExerciseIds: ['0:squats'],
        state: 'exercise-running',
        workoutStartedAt: 1,
        totalPausedTime: 0
      },
      viewedExerciseTutorials: ['squats'],
      settings: { ...useAppStore.getState().settings, voice: true }
    })

    useAppStore.getState().resetProgress()
    const state = useAppStore.getState()

    expect(state.completedDays).toEqual({})
    expect(state.completedExercises).toEqual({})
    expect(state.workoutHistory).toEqual([])
    expect(state.activeWorkoutSession).toBeNull()
    expect(state.viewedExerciseTutorials).toEqual([])
    expect(state.selectedPrograms).toEqual({})
    expect(state.settings.voice).toBe(true)
    expect(state.hasOnboarded).toBe(true)
  })
})
