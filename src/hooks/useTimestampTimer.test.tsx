// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTimestampTimer } from './useTimestampTimer'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('useTimestampTimer', () => {
  it('derives elapsed time from timestamps instead of interval ticks', () => {
    vi.useFakeTimers()
    const startedAt = 1_000_000
    const initialNow = startedAt + 4_250
    vi.setSystemTime(initialNow)

    const { result } = renderHook(() => useTimestampTimer(startedAt, undefined, 750))
    expect(result.current).toBe(initialNow - startedAt - 750)

    const laterNow = initialNow + 1_370
    act(() => {
      vi.setSystemTime(laterNow - 200)
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe(laterNow - startedAt - 750)
  })

  it('freezes at pausedAt even while render timers advance', () => {
    vi.useFakeTimers()
    const startedAt = 2_000_000
    const pausedAt = startedAt + 8_400
    const totalPausedTime = 1_100
    vi.setSystemTime(pausedAt + 5_000)

    const { result } = renderHook(() => useTimestampTimer(startedAt, pausedAt, totalPausedTime))
    expect(result.current).toBe(pausedAt - startedAt - totalPausedTime)

    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current).toBe(pausedAt - startedAt - totalPausedTime)
  })
})
