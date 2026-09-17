import type { VoiceCue } from '../../services/audio'

interface ExerciseVoiceCueInput {
  duration?: number
  elapsedSeconds: number
  remainingSeconds: number
}

export function getExerciseVoiceCue({
  duration,
  elapsedSeconds,
  remainingSeconds
}: ExerciseVoiceCueInput): VoiceCue | null {
  if (duration) {
    if (elapsedSeconds <= 0 || remainingSeconds <= 0) return null
    if (remainingSeconds <= 10) return 'last-10-seconds'
    if (duration > 30 && remainingSeconds <= 30) return '30-seconds-left'
    return null
  }

  if (elapsedSeconds >= 90) return '90-seconds'
  if (elapsedSeconds >= 60) return '60-seconds'
  if (elapsedSeconds >= 30) return '30-seconds'
  return null
}
