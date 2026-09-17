import { describe, expect, it } from 'vitest'
import { getExerciseVoiceCue } from './voiceCues'

describe('exercise voice cues', () => {
  it('announces elapsed milestones for repetitions', () => {
    expect(getExerciseVoiceCue({ elapsedSeconds: 29, remainingSeconds: 0 })).toBeNull()
    expect(getExerciseVoiceCue({ elapsedSeconds: 30, remainingSeconds: 0 })).toBe('30-seconds')
    expect(getExerciseVoiceCue({ elapsedSeconds: 67, remainingSeconds: 0 })).toBe('60-seconds')
    expect(getExerciseVoiceCue({ elapsedSeconds: 95, remainingSeconds: 0 })).toBe('90-seconds')
  })

  it('announces remaining time for timed exercises', () => {
    expect(getExerciseVoiceCue({ duration: 60, elapsedSeconds: 29, remainingSeconds: 31 })).toBeNull()
    expect(getExerciseVoiceCue({ duration: 60, elapsedSeconds: 30, remainingSeconds: 30 })).toBe('30-seconds-left')
    expect(getExerciseVoiceCue({ duration: 60, elapsedSeconds: 50, remainingSeconds: 10 })).toBe('last-10-seconds')
  })

  it('does not announce a late cue after the timer has ended', () => {
    expect(getExerciseVoiceCue({ duration: 60, elapsedSeconds: 65, remainingSeconds: 0 })).toBeNull()
  })
})
