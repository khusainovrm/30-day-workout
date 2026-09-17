import { afterEach, describe, expect, it, vi } from 'vitest'
import { AudioService } from './audio'

afterEach(() => vi.unstubAllGlobals())

describe('AudioService voice announcements', () => {
  it('does not replay an announcement after the service is restored', () => {
    let playCount = 0
    const storage = new Map<string, string>()

    class FakeAudio {
      currentTime = 0
      onerror: (() => void) | null = null
      preload = ''
      volume = 1
      load() {}
      pause() {}
      play() {
        playCount += 1
        return Promise.resolve()
      }
    }

    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value)
    })

    new AudioService().announce('30-seconds', true, 'session:exercise:30-seconds')
    new AudioService().announce('30-seconds', true, 'session:exercise:30-seconds')

    expect(playCount).toBe(1)
  })

  it('does not load or play voice when announcements are disabled', () => {
    let createdAudioElements = 0
    vi.stubGlobal('Audio', class { constructor() { createdAudioElements += 1 } })

    new AudioService().announce('30-seconds', false, 'disabled-cue')

    expect(createdAudioElements).toBe(0)
  })
})
