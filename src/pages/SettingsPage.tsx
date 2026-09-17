import { BellRing, Moon, RotateCcw, Smartphone, Volume2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button, Sheet, Toggle } from '../components/ui'
import { useAppStore } from '../store/useAppStore'

export function SettingsPage() {
  const { settings, updateSettings, resetProgress } = useAppStore()
  const [resetOpen, setResetOpen] = useState(false)
  return <div className="px-5 pt-5">
    <p className="text-sm font-extrabold uppercase tracking-[.16em] text-muted">Make it yours</p><h1 className="mt-1 text-4xl font-black tracking-[-.05em]">Settings</h1>
    <SettingsGroup title="Workout cues" icon={Volume2}><Toggle label="Sound" description="Beeps and workout cues" checked={settings.sound} onChange={sound => updateSettings({ sound })} /><Toggle label="Voice announcements" description="Announce longer intervals" checked={settings.voice} onChange={voice => updateSettings({ voice })} /><Toggle label="Haptics" description="Gentle vibration feedback" checked={settings.haptics} onChange={haptics => updateSettings({ haptics })} /></SettingsGroup>
    <SettingsGroup title="Workout flow" icon={BellRing}><Toggle label="3 second countdown" checked={settings.countdown} onChange={countdown => updateSettings({ countdown })} /><Toggle label="Auto-start next exercise" description="Start automatically after rest" checked={settings.autoNext} onChange={autoNext => updateSettings({ autoNext })} /><label className="flex min-h-16 items-center justify-between gap-4 py-2"><span><b className="block">Default rest</b><span className="text-sm text-muted">Used when a plan has no override</span></span><select aria-label="Default rest duration" value={settings.restDuration} onChange={event => updateSettings({ restDuration: Number(event.target.value) })} className="min-h-11 rounded-xl border border-line bg-surface px-3 font-bold">{[20, 25, 30, 45].map(value => <option key={value} value={value}>{value}s</option>)}</select></label></SettingsGroup>
    <SettingsGroup title="Device" icon={Smartphone}><Toggle label="Keep screen awake" description="While a workout is active" checked={settings.keepAwake} onChange={keepAwake => updateSettings({ keepAwake })} /><div className="flex min-h-16 items-center justify-between gap-4 py-2"><span><b className="block">Theme</b><span className="text-sm text-muted">Choose your appearance</span></span><select aria-label="Theme" value={settings.theme} onChange={event => updateSettings({ theme: event.target.value as typeof settings.theme })} className="min-h-11 rounded-xl border border-line bg-surface px-3 font-bold"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div></SettingsGroup>
    <section className="mb-4 mt-7 rounded-[24px] border border-red-500/20 bg-card p-5"><div className="flex items-center gap-2 text-red-600"><RotateCcw size={20} /><h2 className="font-black">Reset progress</h2></div><p className="mt-2 text-sm leading-6 text-muted">Remove completed workouts, statistics and active plans from this device.</p><Button variant="secondary" className="mt-4 w-full text-red-600" onClick={() => setResetOpen(true)}>RESET PROGRESS</Button></section>
    <p className="mb-5 text-center text-xs font-semibold text-muted">THIRTY · OFFLINE EDITION · v1.0</p>
    <Sheet open={resetOpen} title="Reset all progress?" onClose={() => setResetOpen(false)}><p className="text-muted">This will remove all completed workouts and statistics. This can’t be undone.</p><div className="mt-6 grid gap-3"><Button variant="danger" onClick={() => { resetProgress(); setResetOpen(false) }}>RESET EVERYTHING</Button><Button variant="secondary" onClick={() => setResetOpen(false)}>CANCEL</Button></div></Sheet>
  </div>
}

function SettingsGroup({ title, icon: Icon, children }: { title: string; icon: typeof Moon; children: ReactNode }) {
  return <section className="mt-7 rounded-[24px] bg-card p-5"><div className="mb-2 flex items-center gap-2"><Icon size={19} /><h2 className="text-lg font-black">{title}</h2></div><div className="divide-y divide-line">{children}</div></section>
}
