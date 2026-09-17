import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ExercisePreviewProps {
  images: string[]
  exerciseName: string
}

export function ExercisePreview({ images, exerciseName }: ExercisePreviewProps) {
  const reduceMotion = useReducedMotion()
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => setFrameIndex(0), [images])

  useEffect(() => {
    if (reduceMotion || images.length < 2) return
    const interval = window.setInterval(
      () => setFrameIndex(current => (current + 1) % images.length),
      1400
    )
    return () => window.clearInterval(interval)
  }, [images, reduceMotion])

  const source = reduceMotion ? images[0] : images[frameIndex]

  return <div className="relative aspect-[4/2.7] overflow-hidden rounded-[28px] bg-[#e9efcf]">
    <AnimatePresence initial={false}>
      <motion.img
        key={source}
        src={source}
        alt={`Техника упражнения «${exerciseName}»`}
        className="absolute inset-0 size-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
      />
    </AnimatePresence>
  </div>
}
