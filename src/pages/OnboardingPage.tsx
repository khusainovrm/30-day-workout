import { useState } from 'react'
import { ArrowRight, Check, Dumbbell, Sparkles, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { categoryMeta, programs } from '../data/programs'
import { useAppStore } from '../store/useAppStore'
import type { Category, Difficulty } from '../types'

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState<Category>('body')
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const finish = useAppStore(state => state.finishOnboarding)
  const navigate = useNavigate()
  const complete = () => {
    const program = programs.find(item => item.category === category && item.difficulty === difficulty && item.variant === 'A')!
    finish(category, program.id)
    navigate(`/program/${program.id}/day/1`, { replace: true })
  }
  const icons = [Dumbbell, Target, Sparkles]
  const IntroIcon = icons[step]
  return <div className="flex min-h-dvh flex-col bg-ink p-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))] text-white">
    <div className="flex items-center justify-between"><span className="font-extrabold tracking-wide">30 ДНЕЙ</span><button className="min-h-11 px-3 text-sm font-bold text-white/60" onClick={() => { finish(); navigate('/', { replace: true }) }}>Пропустить</button></div>
    <div className="flex min-w-0 flex-1 flex-col justify-center py-10">
      <div className="mb-8 grid size-20 place-items-center rounded-[26px] bg-accent text-ink"><IntroIcon size={36} /></div>
      {step === 0 && <><p className="mb-3 text-sm font-bold uppercase tracking-[.18em] text-accent">Твой челлендж</p><h1 className="max-w-sm text-5xl font-black leading-[.96] tracking-[-.055em]">30 дней.<br />Одна цель.</h1><p className="mt-5 w-full max-w-sm pr-2 text-lg leading-7 text-white/65">Короткие тренировки, которые легко вписать в день. Даже без интернета.</p></>}
      {step === 1 && <><p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-accent">Выбери цель</p><h1 className="text-4xl font-black tracking-[-.04em]">Что будем тренировать?</h1><div className="mt-7 grid gap-3">{(Object.keys(categoryMeta) as Category[]).map(key => <button key={key} onClick={() => setCategory(key)} className={`flex min-h-16 items-center justify-between rounded-2xl border px-5 text-left text-lg font-extrabold ${category === key ? 'border-accent bg-accent text-ink' : 'border-white/15 bg-white/5'}`}><span>{categoryMeta[key].title}</span>{category === key && <Check />}</button>)}</div></>}
      {step === 2 && <><p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-accent">Выбери уровень</p><h1 className="text-4xl font-black tracking-[-.04em]">Начни в своём темпе.</h1><div className="mt-7 grid gap-3">{(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((key, index) => <button key={key} onClick={() => setDifficulty(key)} className={`flex min-h-[72px] items-center justify-between rounded-2xl border px-5 text-left ${difficulty === key ? 'border-accent bg-accent text-ink' : 'border-white/15 bg-white/5'}`}><span><span className="block text-lg font-extrabold">{difficultyMeta[key].title}</span><span className={`text-sm ${difficulty === key ? 'text-ink/65' : 'text-white/55'}`}>{10 + index * 5}–{15 + index * 5} минут в день</span></span>{difficulty === key && <Check />}</button>)}</div></>}
    </div>
    <div className="flex gap-2 pb-6">{[0, 1, 2].map(index => <span key={index} className={`h-1.5 rounded-full transition-all ${index === step ? 'w-8 bg-accent' : 'w-2 bg-white/25'}`} />)}</div>
    <Button className="flex w-full items-center justify-center gap-2 bg-accent text-ink" onClick={() => step < 2 ? setStep(step + 1) : complete()}>{step < 2 ? 'ПРОДОЛЖИТЬ' : 'НАЧАТЬ ДЕНЬ 1'}<ArrowRight size={19} /></Button>
  </div>
}
