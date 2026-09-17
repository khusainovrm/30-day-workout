// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DayPage } from './DayPage'
import { useAppStore } from '../store/useAppStore'

const programId = 'body-beginner-a'

afterEach(cleanup)

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({
    hasOnboarded: true,
    completedDays: {},
    completedExercises: {},
    activeWorkoutSession: null
  })
})

function renderDay(day: number) {
  return render(<MemoryRouter initialEntries={[`/program/${programId}/day/${day}`]}>
    <Routes>
      <Route path="/program/:programId/day/:day" element={<DayPage />} />
      <Route path="/program/:programId" element={<div>Обзор программы</div>} />
      <Route path="/workout/:programId/:day" element={<div>Режим тренировки</div>} />
    </Routes>
  </MemoryRouter>)
}

describe('day access and replay', () => {
  it('blocks a future day until all previous days are complete', () => {
    renderDay(2)

    expect(screen.getByText('Обзор программы')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'День 2' })).not.toBeInTheDocument()
  })

  it('allows a completed day to be replayed from a clean session', async () => {
    useAppStore.setState({
      completedDays: { [programId]: [1] },
      completedExercises: { [`${programId}:1`]: ['0:lunges'] }
    })
    const user = userEvent.setup()
    renderDay(1)

    await user.click(screen.getByRole('button', { name: 'ПОВТОРИТЬ ТРЕНИРОВКУ' }))

    expect(screen.getByText('Режим тренировки')).toBeInTheDocument()
    expect(useAppStore.getState().activeWorkoutSession).toMatchObject({
      programId,
      day: 1,
      exerciseIndex: 0,
      completedExerciseIds: [],
      state: 'exercise-preview'
    })
    expect(useAppStore.getState().completedDays[programId]).toEqual([1])
  })
})
