import { describe, expect, it } from 'vitest'
import { programs } from './programs'

describe('program generation', () => {
  it('creates all 18 programs with 30 ordered days', () => {
    expect(programs).toHaveLength(18)
    expect(new Set(programs.map(program => program.id))).toHaveLength(18)
    expect(new Set(programs.map(program => `${program.category}:${program.difficulty}:${program.variant}`))).toHaveLength(18)

    for (const program of programs) {
      expect(program.days).toHaveLength(30)
      expect(program.days.map(day => day.day)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1))
      expect(program.days.every(day => day.exercises.length > 0)).toBe(true)
    }
  })

  it('generates recovery days on the planned cadence', () => {
    for (const program of programs) {
      const recoveryDays = program.days.filter(day => day.type === 'recovery')
      expect(recoveryDays.map(day => day.day)).toEqual([8, 16, 24, 30])
      expect(recoveryDays.every(day => day.exercises.length === 4)).toBe(true)
      expect(recoveryDays.at(-1)?.title).toBe('Финальная тренировка')
    }
  })

  it('increases prescriptions when the same exercise rotation repeats', () => {
    for (const program of programs) {
      const repeatDayNumber = program.category === 'arms' ? 26 : 25
      const first = program.days[0]
      const repeated = program.days[repeatDayNumber - 1]

      expect(repeated.exercises.map(item => item.exerciseId)).toEqual(first.exercises.map(item => item.exerciseId))
      first.exercises.forEach((item, index) => {
        const later = repeated.exercises[index]
        const initialLoad = item.reps ?? item.duration ?? 0
        const progressedLoad = later.reps ?? later.duration ?? 0
        expect(progressedLoad).toBeGreaterThan(initialLoad)
      })
    }
  })
})
