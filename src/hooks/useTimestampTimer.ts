import { useEffect, useState } from 'react'

export function useTimestampTimer(startedAt?: number, pausedAt?: number, totalPausedTime = 0) {
  const [, render] = useState(0)
  useEffect(() => {
    if (!startedAt || pausedAt) return
    const id = window.setInterval(() => render(value => value + 1), 200)
    return () => window.clearInterval(id)
  }, [startedAt, pausedAt])
  if (!startedAt) return 0
  const endpoint = pausedAt ?? Date.now()
  return Math.max(0, endpoint - startedAt - totalPausedTime)
}

export const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}
