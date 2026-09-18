// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { formatTime } from '../hooks/useTimestampTimer'
import { useAppStore } from '../store/useAppStore'
import type { ActiveWorkoutSession } from '../types'
import { WorkoutPage } from './WorkoutPage'

const programId = 'body-beginner-a'
const day = 1
const now = 2_000_000_000_000

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  localStorage.clear()
  useAppStore.setState({
    hasOnboarded: true,
    completedDays: {},
    completedExercises: {},
    workoutHistory: [],
    activeWorkoutSession: null,
    settings: {
      sound: false,
      voice: false,
      haptics: false,
      keepAwake: false,
      countdown: true,
      autoNext: false,
      restDuration: 30,
      theme: 'system'
    }
  })
})

function restoreSession(patch: Partial<ActiveWorkoutSession>) {
  const session: ActiveWorkoutSession = {
    programId,
    day,
    exerciseIndex: 0,
    completedExerciseIds: [],
    state: 'exercise-running',
    workoutStartedAt: now - 60_000,
    totalPausedTime: 0,
    ...patch
  }
  useAppStore.setState({ activeWorkoutSession: session })

  render(<MemoryRouter initialEntries={[`/workout/${programId}/${day}`]}>
    <Routes><Route path="/workout/:programId/:day" element={<WorkoutPage />} /></Routes>
  </MemoryRouter>)
  return session
}

describe('workout session restoration', () => {
  it('restores countdown without restarting or skipping it', () => {
    restoreSession({ state: 'countdown' })

    expect(screen.getByText('Приготовься')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(useAppStore.getState().activeWorkoutSession?.state).toBe('countdown')
  })

  it('restores a running exercise from its timestamps', () => {
    const exerciseStartedAt = now - 12_340
    const totalPausedTime = 1_000
    restoreSession({ state: 'exercise-running', exerciseStartedAt, totalPausedTime })
    const expectedSeconds = Math.floor((now - exerciseStartedAt - totalPausedTime) / 1_000)

    expect(screen.getByText('Продолжай')).toBeInTheDocument()
    expect(screen.getByText(formatTime(expectedSeconds))).toBeInTheDocument()
    expect(useAppStore.getState().activeWorkoutSession?.state).toBe('exercise-running')
  })

  it('restores a paused exercise at the paused timestamp', () => {
    const exerciseStartedAt = now - 20_000
    const pausedAt = now - 5_000
    const totalPausedTime = 2_000
    restoreSession({ state: 'exercise-paused', exerciseStartedAt, pausedAt, totalPausedTime })
    const expectedSeconds = Math.floor((pausedAt - exerciseStartedAt - totalPausedTime) / 1_000)

    expect(screen.getByText('Пауза')).toBeInTheDocument()
    expect(screen.getByText(formatTime(expectedSeconds))).toBeInTheDocument()
    expect(useAppStore.getState().activeWorkoutSession?.state).toBe('exercise-paused')
  })

  it('restores rest time from restStartedAt', () => {
    const restStartedAt = now - 10_300
    const restDuration = 30
    restoreSession({
      state: 'rest',
      exerciseIndex: 1,
      completedExerciseIds: ['0:lunges'],
      restStartedAt,
      restDuration
    })
    const expectedRemaining = restDuration - Math.floor((now - restStartedAt) / 1_000)

    expect(screen.getByText('Отдых')).toBeInTheDocument()
    expect(screen.getByText(formatTime(expectedRemaining))).toBeInTheDocument()
    expect(screen.getByText('Выполнено 1 из 5')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20')
    expect(useAppStore.getState().activeWorkoutSession?.state).toBe('rest')
  })

  it('keeps progress monotonic and exercise numbering accurate across rest', () => {
    restoreSession({ state: 'exercise-running', exerciseIndex: 0 })

    expect(screen.getByText('Упражнение 1 из 5')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

    fireEvent.click(screen.getByRole('button', { name: 'ГОТОВО' }))

    expect(screen.getByText('Выполнено 1 из 5')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20')

    fireEvent.click(screen.getByRole('button', { name: 'ПРОПУСТИТЬ ОТДЫХ' }))

    expect(screen.getByText('Упражнение 2 из 5')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20')

    fireEvent.click(screen.getByRole('button', { name: 'НАЧАТЬ ДАЛЬШЕ' }))

    expect(screen.getByText('Упражнение 2 из 5')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20')
  })

  it('restores the completion screen and clears the session only when returning to the calendar', () => {
    restoreSession({
      state: 'workout-completed',
      exerciseIndex: 4,
      completedExerciseIds: ['0:lunges', '1:push-ups', '2:glute-bridge', '3:plank', '4:mountain-climbers'],
      workoutCompletedAt: now - 1_000
    })

    expect(screen.getByRole('heading', { name: 'Ты молодец!' })).toBeInTheDocument()
    expect(useAppStore.getState().activeWorkoutSession?.state).toBe('workout-completed')

    fireEvent.click(screen.getByRole('button', { name: 'ВЕРНУТЬСЯ К КАЛЕНДАРЮ' }))

    expect(useAppStore.getState().activeWorkoutSession).toBeNull()
  })
})
