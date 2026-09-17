import { useEffect, useState } from 'react'
import { Download, RefreshCcw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './ui'
import { useAppStore } from '../store/useAppStore'

interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export function PwaPrompts() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const history = useAppStore(state => state.workoutHistory)
  const dismissed = useAppStore(state => state.dismissedInstall)
  const dismissInstall = useAppStore(state => state.dismissInstall)
  const activeSession = useAppStore(state => state.activeWorkoutSession)
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()
  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallPromptEvent) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  const showInstall = installEvent && history.length > 0 && !dismissed && !activeSession
  const showUpdate = needRefresh && !activeSession
  if (!showInstall && !showUpdate) return null
  return <div className="fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-40 mx-auto max-w-[510px] rounded-[22px] border border-line bg-card p-4 shadow-2xl"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-gray-950">{showUpdate ? <RefreshCcw size={20} /> : <Download size={20} />}</span><div><b>{showUpdate ? 'Доступно обновление' : 'Установить приложение'}</b><p className="mt-0.5 text-sm text-muted">{showUpdate ? 'Установите последние улучшения.' : 'Тренируйтесь офлайн и запускайте как обычное приложение.'}</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => showUpdate ? setNeedRefresh(false) : dismissInstall()}>{showUpdate ? 'ПОЗЖЕ' : 'НЕ СЕЙЧАС'}</Button><Button onClick={() => showUpdate ? void updateServiceWorker(true) : void installEvent?.prompt()}>{showUpdate ? 'ОБНОВИТЬ' : 'УСТАНОВИТЬ'}</Button></div></div>
}
