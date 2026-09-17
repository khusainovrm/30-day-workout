import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb, ListChecks } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Exercise } from '../types'

interface ExerciseTutorialProps {
  exercise: Exercise
  previouslyViewed: boolean
  onViewed: (exerciseId: string) => void
  onSkip: () => void
}

export function ExerciseTutorial({ exercise, previouslyViewed, onViewed, onSkip }: ExerciseTutorialProps) {
  const [wasPreviouslyViewed] = useState(previouslyViewed)
  const [expanded, setExpanded] = useState(!wasPreviouslyViewed)

  useEffect(() => {
    if (!wasPreviouslyViewed) onViewed(exercise.id)
  }, [exercise.id, onViewed, wasPreviouslyViewed])

  if (!expanded) {
    return <div className="mt-5 rounded-2xl bg-card p-4">
      <p className="text-sm text-muted">Техника уже просмотрена. Можно сразу начинать упражнение.</p>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-2 flex min-h-11 items-center gap-2 font-extrabold text-ink"
        aria-expanded="false"
      >
        <ChevronDown size={18} />Снова показать технику
      </button>
    </div>
  }

  return <div className="mt-6 rounded-2xl bg-card p-4">
    <button
      type="button"
      onClick={onSkip}
      className="mb-3 ml-auto flex min-h-11 items-center justify-center px-2 text-sm font-bold text-muted underline decoration-line underline-offset-4"
    >
      Пропустить объяснение
    </button>
    <section aria-labelledby={`instructions-${exercise.id}`}>
      <h2 id={`instructions-${exercise.id}`} className="flex items-center gap-2 font-black">
        <ListChecks size={18} />Как выполнять
      </h2>
      <ol className="mt-3 grid gap-2 text-sm text-muted">
        {exercise.instructions.map((instruction, index) => <li key={instruction} className="flex gap-3">
          <b className="text-ink">{index + 1}.</b><span>{instruction}</span>
        </li>)}
      </ol>
    </section>

    <section className="mt-5 border-t border-line pt-4" aria-labelledby={`tips-${exercise.id}`}>
      <h2 id={`tips-${exercise.id}`} className="flex items-center gap-2 font-black">
        <Lightbulb size={18} />Советы
      </h2>
      <ul className="mt-3 grid gap-2 text-sm text-muted">
        {(exercise.tips ?? []).map(tip => <li key={tip} className="flex gap-2"><span aria-hidden="true">•</span><span>{tip}</span></li>)}
      </ul>
    </section>

    <section className="mt-5 border-t border-line pt-4" aria-labelledby={`mistakes-${exercise.id}`}>
      <h2 id={`mistakes-${exercise.id}`} className="flex items-center gap-2 font-black">
        <AlertTriangle size={18} />Частые ошибки
      </h2>
      <ul className="mt-3 grid gap-2 text-sm text-muted">
        {(exercise.commonMistakes ?? []).map(mistake => <li key={mistake} className="flex gap-2"><span aria-hidden="true">•</span><span>{mistake}</span></li>)}
      </ul>
    </section>

    {wasPreviouslyViewed && <button
      type="button"
      onClick={() => setExpanded(false)}
      className="mt-4 flex min-h-11 items-center gap-2 text-sm font-extrabold text-muted"
      aria-expanded="true"
    >
      <ChevronUp size={18} />Свернуть технику
    </button>}
  </div>
}
