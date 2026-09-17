export const haptics = {
  tap(enabled = true) { if (enabled && 'vibrate' in navigator) navigator.vibrate(10) },
  start(enabled = true) { if (enabled && 'vibrate' in navigator) navigator.vibrate(30) },
  complete(enabled = true) { if (enabled && 'vibrate' in navigator) navigator.vibrate([30, 40, 30]) },
  workout(enabled = true) { if (enabled && 'vibrate' in navigator) navigator.vibrate([50, 50, 100]) }
}
