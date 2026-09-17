class WakeLockService {
  private lock: WakeLockSentinel | null = null
  private enabled = false

  async acquire(enabled = true) {
    this.enabled = enabled
    if (!enabled || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return
    try { this.lock = await navigator.wakeLock.request('screen') } catch { this.lock = null }
  }

  async release() {
    this.enabled = false
    try { await this.lock?.release() } catch { /* Already released. */ }
    this.lock = null
  }

  handleVisibility = () => {
    if (this.enabled && document.visibilityState === 'visible') void this.acquire(true)
  }
}

export const wakeLockService = new WakeLockService()
