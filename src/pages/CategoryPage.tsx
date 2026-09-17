import { ArrowLeft, ArrowRight, Clock3, Gauge } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { categoryMeta, difficultyMeta, programs } from '../data/programs'
import type { Category, Difficulty } from '../types'

export function CategoryPage() {
  const { category } = useParams()
  if (!category || !(category in categoryMeta)) return <Navigate to="/" replace />
  const typedCategory = category as Category
  return <div className="px-5 pt-3">
    <Link to="/" className="grid size-12 place-items-center rounded-full bg-card" aria-label="Back home"><ArrowLeft /></Link>
    <p className="mt-8 text-sm font-extrabold uppercase tracking-[.16em] text-muted">{categoryMeta[typedCategory].eyebrow}</p>
    <h1 className="mt-1 text-4xl font-black tracking-[-.05em]">Choose your level</h1>
    <p className="mt-3 max-w-sm leading-6 text-muted">Pick a level that feels challenging but manageable. You can switch plans anytime.</p>
    <div className="mt-7 grid gap-5">{(Object.keys(difficultyMeta) as Difficulty[]).map((difficulty, difficultyIndex) => {
      const meta = difficultyMeta[difficulty]
      return <section key={difficulty} className="rounded-[26px] border border-line bg-card p-5">
        <div className="flex items-start justify-between"><div><span className="text-xs font-black text-muted">LEVEL {difficultyIndex + 1}</span><h2 className="mt-1 text-2xl font-black">{meta.title}</h2></div><span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold">{meta.count} exercises</span></div>
        <div className="mt-4 flex gap-4 text-sm font-semibold text-muted"><span className="flex items-center gap-1.5"><Clock3 size={16} />{meta.minutes}</span><span className="flex items-center gap-1.5"><Gauge size={16} />{meta.intensity}</span></div>
        <div className="mt-5 grid grid-cols-2 gap-3">{(['A', 'B'] as const).map(variant => {
          const program = programs.find(item => item.category === typedCategory && item.difficulty === difficulty && item.variant === variant)!
          return <Link key={variant} to={`/program/${program.id}`} className="flex min-h-14 items-center justify-between rounded-2xl bg-ink px-4 font-extrabold text-white">Plan {variant}<ArrowRight size={17} className="text-accent" /></Link>
        })}</div>
      </section>
    })}</div>
  </div>
}
