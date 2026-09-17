import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const voiceFiles = [
  '30-seconds.wav',
  '60-seconds.wav',
  '90-seconds.wav',
  '30-seconds-left.wav',
  'last-10-seconds.wav',
  'rest-finished.wav',
  'workout-completed.wav'
]

for (const file of voiceFiles) {
  const path = resolve('public/sounds/voice', file)
  const metadata = await stat(path).catch(() => null)
  if (!metadata?.isFile() || metadata.size < 10_000) {
    throw new Error(`Missing or empty prerecorded voice asset: ${path}`)
  }
  const header = await readFile(path, { encoding: null })
  if (header.subarray(0, 4).toString('ascii') !== 'RIFF' || header.subarray(8, 12).toString('ascii') !== 'WAVE') {
    throw new Error(`Voice asset is not a WAV file: ${path}`)
  }
}

if (process.argv.includes('--dist')) {
  const serviceWorker = await readFile(resolve('dist/sw.js'), 'utf8')
  for (const file of voiceFiles) {
    const url = `sounds/voice/${file}`
    if (!serviceWorker.includes(url)) throw new Error(`Voice asset is absent from service worker precache: ${url}`)
  }
  console.log(`Verified ${voiceFiles.length} prerecorded voice assets in service worker precache.`)
} else {
  console.log(`Validated ${voiceFiles.length} local prerecorded voice assets.`)
}
