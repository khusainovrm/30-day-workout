type SoundName = 'beep' | 'start' | 'finish' | 'complete'

export type VoiceCue =
  | '30-seconds'
  | '60-seconds'
  | '90-seconds'
  | '30-seconds-left'
  | 'last-10-seconds'
  | 'rest-finished'
  | 'workout-completed'

const voiceAssets: Record<VoiceCue, { source: string; fallbackText: string }> = {
  '30-seconds': { source: '/sounds/voice/30-seconds.wav', fallbackText: 'Тридцать секунд' },
  '60-seconds': { source: '/sounds/voice/60-seconds.wav', fallbackText: 'Шестьдесят секунд' },
  '90-seconds': { source: '/sounds/voice/90-seconds.wav', fallbackText: 'Девяносто секунд' },
  '30-seconds-left': { source: '/sounds/voice/30-seconds-left.wav', fallbackText: 'Осталось тридцать секунд' },
  'last-10-seconds': { source: '/sounds/voice/last-10-seconds.wav', fallbackText: 'Последние десять секунд' },
  'rest-finished': { source: '/sounds/voice/rest-finished.wav', fallbackText: 'Отдых закончен' },
  'workout-completed': { source: '/sounds/voice/workout-completed.wav', fallbackText: 'Тренировка завершена' }
}

const announcementStorageKey = 'workout-voice-announcements-v1'

export class AudioService {
  private context: AudioContext | null = null
  private voiceCache = new Map<VoiceCue, HTMLAudioElement>()
  private currentVoice: HTMLAudioElement | null = null
  private announcementMarks: Set<string> | null = null

  async unlock() {
    try {
      this.context ??= new AudioContext()
      if (this.context.state === 'suspended') await this.context.resume()
      for (const cue of Object.keys(voiceAssets) as VoiceCue[]) this.getVoiceAsset(cue).load()
    } catch { /* Audio is an optional enhancement. */ }
  }

  play(name: SoundName, enabled = true) {
    if (!enabled) return
    const asset = new Audio(`/sounds/${name}.wav`)
    asset.volume = name === 'beep' ? .32 : .55
    asset.play().catch(() => this.tone(name))
  }

  announce(cue: VoiceCue, enabled = false, dedupeKey: string = cue, delayMs = 0) {
    if (!enabled || this.hasAnnouncement(dedupeKey)) return
    this.markAnnouncement(dedupeKey)
    const play = () => this.playVoiceAsset(cue)
    if (delayMs > 0) window.setTimeout(play, delayMs)
    else play()
  }

  private playVoiceAsset(cue: VoiceCue) {
    const asset = this.getVoiceAsset(cue)
    this.currentVoice?.pause()
    this.currentVoice = asset
    asset.currentTime = 0
    asset.volume = .92

    let usedFallback = false
    const fallback = () => {
      if (usedFallback) return
      usedFallback = true
      this.speechFallback(voiceAssets[cue].fallbackText)
    }
    asset.onerror = fallback
    try {
      asset.play().catch(fallback)
    } catch {
      fallback()
    }
  }

  private getVoiceAsset(cue: VoiceCue) {
    const cached = this.voiceCache.get(cue)
    if (cached) return cached
    const asset = new Audio(voiceAssets[cue].source)
    asset.preload = 'auto'
    this.voiceCache.set(cue, asset)
    return asset
  }

  private speechFallback(text: string) {
    if (!('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ru-RU'
      utterance.rate = .95
      window.speechSynthesis.speak(utterance)
    } catch { /* Voice is an optional enhancement. */ }
  }

  private hasAnnouncement(key: string) {
    return this.getAnnouncementMarks().has(key)
  }

  private markAnnouncement(key: string) {
    const marks = this.getAnnouncementMarks()
    marks.add(key)
    try {
      sessionStorage.setItem(announcementStorageKey, JSON.stringify(Array.from(marks).slice(-200)))
    } catch { /* In-memory deduplication still works. */ }
  }

  private getAnnouncementMarks() {
    if (this.announcementMarks) return this.announcementMarks
    try {
      const saved = JSON.parse(sessionStorage.getItem(announcementStorageKey) ?? '[]')
      this.announcementMarks = new Set(Array.isArray(saved) ? saved.filter(item => typeof item === 'string') : [])
    } catch {
      this.announcementMarks = new Set()
    }
    return this.announcementMarks
  }

  private tone(name: SoundName) {
    try {
      this.context ??= new AudioContext()
      const oscillator = this.context.createOscillator()
      const gain = this.context.createGain()
      oscillator.frequency.value = name === 'finish' || name === 'complete' ? 720 : name === 'start' ? 560 : 440
      gain.gain.setValueAtTime(.0001, this.context.currentTime)
      gain.gain.exponentialRampToValueAtTime(.18, this.context.currentTime + .01)
      gain.gain.exponentialRampToValueAtTime(.0001, this.context.currentTime + .16)
      oscillator.connect(gain).connect(this.context.destination)
      oscillator.start()
      oscillator.stop(this.context.currentTime + .18)
    } catch { /* Silent fallback. */ }
  }
}

export const audioService = new AudioService()
