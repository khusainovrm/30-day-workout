import {BellRing, Moon, RotateCcw, Smartphone, Volume2} from 'lucide-react'
import {useState, type ReactNode} from 'react'
import {Button, Sheet, Toggle} from '../components/ui'
import {useAppStore} from '../store/useAppStore'

export function SettingsPage() {
    const {settings, updateSettings, resetProgress} = useAppStore()
    const [resetOpen, setResetOpen] = useState(false)
    return <div className="px-5 pt-5">
        <p className="text-sm font-extrabold uppercase tracking-[.16em] text-muted">Под себя</p><h1
        className="mt-1 text-4xl font-black tracking-[-.05em]">Настройки</h1>
        <SettingsGroup title="Сигналы" icon={Volume2}><Toggle label="Звук"
                                                              description="Сигналы таймера и тренировки"
                                                              checked={settings.sound}
                                                              onChange={sound => updateSettings({sound})}/><Toggle
            label="Голосовые подсказки" description="Озвучивать длинные интервалы"
            checked={settings.voice} onChange={voice => updateSettings({voice})}/><Toggle
            label="Вибрация" description="Лёгкая тактильная обратная связь"
            checked={settings.haptics}
            onChange={haptics => updateSettings({haptics})}/></SettingsGroup>
        <SettingsGroup title="Ход тренировки" icon={BellRing}><Toggle label="Отсчёт 3 секунды"
                                                                      checked={settings.countdown}
                                                                      onChange={countdown => updateSettings({countdown})}/><Toggle
            label="Автозапуск упражнения" description="Начинать автоматически после отдыха"
            checked={settings.autoNext} onChange={autoNext => updateSettings({autoNext})}/><label
            className="flex min-h-16 items-center justify-between gap-4 py-2"><span><b
            className="block">Отдых по умолчанию</b><span className="text-sm text-muted">Если план не задаёт другое время</span></span><select
            aria-label="Длительность отдыха" value={settings.restDuration}
            onChange={event => updateSettings({restDuration: Number(event.target.value)})}
            className="min-h-11 rounded-xl border border-line bg-surface px-3 font-bold">{[20, 25, 30, 45].map(value =>
            <option key={value} value={value}>{value} с</option>)}</select></label></SettingsGroup>
        <SettingsGroup title="Устройство" icon={Smartphone}><Toggle label="Не выключать экран"
                                                                    description="Пока идёт тренировка"
                                                                    checked={settings.keepAwake}
                                                                    onChange={keepAwake => updateSettings({keepAwake})}/>
            <div className="flex min-h-16 items-center justify-between gap-4 py-2"><span><b
                className="block">Тема</b><span
                className="text-sm text-muted">Оформление приложения</span></span><select
                aria-label="Тема" value={settings.theme}
                onChange={event => updateSettings({theme: event.target.value as typeof settings.theme})}
                className="min-h-11 rounded-xl border border-line bg-surface px-3 font-bold">
                <option value="system">Системная</option>
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
            </select></div>
        </SettingsGroup>
        <section className="mb-4 mt-7 rounded-[24px] border border-red-500/20 bg-card p-5">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400"><RotateCcw size={20}/><h2
                className="font-black">Сбросить прогресс</h2></div>
            <p className="mt-2 text-sm leading-6 text-muted">Удалить выполненные тренировки,
                статистику и выбранные планы с этого устройства.</p><Button variant="secondary"
                                                                            className="mt-4 w-full text-red-600 dark:text-red-400"
                                                                            onClick={() => setResetOpen(true)}>СБРОСИТЬ
            ПРОГРЕСС</Button></section>
        <p className="mb-5 text-center text-xs font-semibold text-muted">30 ДНЕЙ · ОФЛАЙН · v1.0</p>
        <Sheet open={resetOpen} title="Сбросить весь прогресс?" onClose={() => setResetOpen(false)}>
            <p className="text-muted">Все выполненные тренировки и статистика будут удалены без
                возможности восстановления.</p>
            <div className="mt-6 grid gap-3"><Button variant="danger" onClick={() => {
                resetProgress();
                setResetOpen(false)
            }}>СБРОСИТЬ ВСЁ</Button><Button variant="secondary"
                                            onClick={() => setResetOpen(false)}>ОТМЕНА</Button>
            </div>
        </Sheet>
    </div>
}

function SettingsGroup({title, icon: Icon, children}: {
    title: string;
    icon: typeof Moon;
    children: ReactNode
}) {
    return <section className="mt-7 rounded-[24px] bg-card p-5">
        <div className="mb-2 flex items-center gap-2"><Icon size={19}/><h2
            className="text-lg font-black">{title}</h2></div>
        <div className="divide-y divide-line">{children}</div>
    </section>
}
