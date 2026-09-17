type SoundName = 'beep' | 'start' | 'finish' | 'complete'

class AudioService {
  private context: AudioContext | null = null

  async unlock() {
    try {
      this.context ??= new AudioContext()
      if (this.context.state === 'suspended') await this.context.resume()
    } catch { /* Audio is an optional enhancement. */ }
  }

  play(name: SoundName, enabled = true) {
    if (!enabled) return
    const asset = new Audio(`/sounds/${name}.wav`)
    asset.volume = name === 'beep' ? .32 : .55
    asset.play().catch(() => this.tone(name))
  }

  announce(seconds: number, enabled = false) {
    if (!enabled || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${seconds} seconds`))
    } catch { /* Voice is an optional enhancement. */ }
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
