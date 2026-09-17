import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'bg-ink text-white shadow-[0_8px_24px_rgba(16,19,15,.18)]',
    secondary: 'bg-card text-ink border border-line',
    danger: 'bg-red-600 text-white',
    ghost: 'bg-transparent text-ink'
  }
  return <button className={`min-h-12 rounded-2xl px-5 font-bold tracking-tight transition active:scale-[.98] disabled:opacity-40 ${styles[variant]} ${className}`} {...props}>{children}</button>
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return <div className={`h-2 overflow-hidden rounded-full bg-black/10 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
}

export function Sheet({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onMouseDown={onClose}>
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-safe w-full max-w-app rounded-[28px] bg-surface p-5 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
      <div className="mb-5 flex items-center justify-between"><h2 id="sheet-title" className="text-xl font-extrabold">{title}</h2><button onClick={onClose} className="grid size-11 place-items-center rounded-full bg-card" aria-label="Закрыть"><X size={20} /></button></div>
      {children}
    </motion.div>
  </div>
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description?: string }) {
  return <label className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-2">
    <span><span className="block font-bold">{label}</span>{description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}</span>
    <input className="peer sr-only" type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
    <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
  </label>
}
