import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ActiveWorkoutSession, Category, Settings, WorkoutHistoryItem } from '../types'

const defaultSettings: Settings = {
  sound: true,
  voice: false,
  haptics: true,
  keepAwake: true,
  countdown: true,
  autoNext: false,
  restDuration: 30,
  theme: 'system'
}

interface AppState {
  version: 1
  hasOnboarded: boolean
  selectedPrograms: Partial<Record<Category, string>>
  completedDays: Record<string, number[]>
  completedExercises: Record<string, string[]>
  workoutHistory: WorkoutHistoryItem[]
  activeWorkoutSession: ActiveWorkoutSession | null
  viewedExerciseTutorials: string[]
  settings: Settings
  dismissedInstall: boolean
  finishOnboarding: (category?: Category, programId?: string) => void
  selectProgram: (category: Category, programId: string) => void
  setActiveSession: (session: ActiveWorkoutSession | null) => void
  updateActiveSession: (patch: Partial<ActiveWorkoutSession>) => void
  completeExercise: (sessionKey: string, exerciseId: string) => void
  completeWorkout: (item: WorkoutHistoryItem) => void
  markTutorialViewed: (exerciseId: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  dismissInstall: () => void
  resetProgress: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      version: 1,
      hasOnboarded: false,
      selectedPrograms: {},
      completedDays: {},
      completedExercises: {},
      workoutHistory: [],
      activeWorkoutSession: null,
      viewedExerciseTutorials: [],
      settings: defaultSettings,
      dismissedInstall: false,
      finishOnboarding: (category, programId) => set(state => ({
        hasOnboarded: true,
        selectedPrograms: category && programId ? { ...state.selectedPrograms, [category]: programId } : state.selectedPrograms
      })),
      selectProgram: (category, programId) => set(state => ({ selectedPrograms: { ...state.selectedPrograms, [category]: programId } })),
      setActiveSession: activeWorkoutSession => set({ activeWorkoutSession }),
      updateActiveSession: patch => set(state => ({
        activeWorkoutSession: state.activeWorkoutSession ? { ...state.activeWorkoutSession, ...patch } : null
      })),
      completeExercise: (sessionKey, exerciseId) => set(state => ({
        completedExercises: {
          ...(state.completedExercises ?? {}),
          [sessionKey]: Array.from(new Set([...(state.completedExercises?.[sessionKey] ?? []), exerciseId]))
        }
      })),
      completeWorkout: item => set(state => ({
        completedDays: {
          ...state.completedDays,
          [item.programId]: Array.from(new Set([...(state.completedDays[item.programId] ?? []), item.day])).sort((a, b) => a - b)
        },
        workoutHistory: [...state.workoutHistory, item],
        activeWorkoutSession: null
      })),
      markTutorialViewed: exerciseId => set(state => ({
        viewedExerciseTutorials: Array.from(new Set([...(state.viewedExerciseTutorials ?? []), exerciseId]))
      })),
      updateSettings: patch => set(state => ({ settings: { ...state.settings, ...patch } })),
      dismissInstall: () => set({ dismissedInstall: true }),
      resetProgress: () => set({
        completedDays: {}, completedExercises: {}, workoutHistory: [], activeWorkoutSession: null,
        viewedExerciseTutorials: [], selectedPrograms: {}
      })
    }),
    {
      name: 'workout-app-state-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = persisted as Partial<AppState>
        if (version < 1) return { ...state, version: 1, settings: { ...defaultSettings, ...state.settings } }
        return state as AppState
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<AppState>
        const activeWorkoutSession = saved.activeWorkoutSession
          ? {
              ...saved.activeWorkoutSession,
              completedExerciseIds: saved.activeWorkoutSession.completedExerciseIds ?? [],
              totalPausedTime: saved.activeWorkoutSession.totalPausedTime ?? 0
            }
          : null
        return {
          ...current,
          ...saved,
          version: 1,
          selectedPrograms: saved.selectedPrograms ?? current.selectedPrograms,
          completedDays: saved.completedDays ?? current.completedDays,
          completedExercises: saved.completedExercises ?? current.completedExercises,
          workoutHistory: saved.workoutHistory ?? current.workoutHistory,
          viewedExerciseTutorials: saved.viewedExerciseTutorials ?? current.viewedExerciseTutorials,
          settings: { ...defaultSettings, ...saved.settings },
          activeWorkoutSession
        }
      },
      partialize: state => state
    }
  )
)

export const getCurrentDay = (programId: string, completedDays: Record<string, number[]>) => {
  const completed = completedDays[programId] ?? []
  for (let day = 1; day <= 30; day += 1) if (!completed.includes(day)) return day
  return 30
}
