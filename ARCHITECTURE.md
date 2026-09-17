# 30 Day Workout — architecture

## Product boundaries

The app is an offline-first, backend-free PWA. The browser is the source of truth: workout definitions ship in the application bundle and personal state is stored in versioned `localStorage` through Zustand.

## Layers

- `src/data` — immutable exercise catalog and deterministic generator for 18 programs × 30 days.
- `src/types` — domain models: exercises, workout days, programs, sessions and settings.
- `src/store` — persisted user state and all mutations that affect progress.
- `src/services` — optional device capabilities (audio, vibration and Wake Lock), each with graceful degradation.
- `src/hooks` — timestamp-based time calculation. Rendering intervals only trigger repaint; they are not the clock.
- `src/pages` — route-level UI and workout state machine.
- `src/components` — reusable UI primitives, app shell and PWA lifecycle UI.

## Routes

| Route | Purpose |
| --- | --- |
| `/onboarding` | Three-step first-run flow |
| `/` | Home and primary continue action |
| `/category/:category` | Difficulty and plan selection |
| `/program/:programId` | Thirty-day timeline |
| `/program/:programId/day/:day` | Workout overview |
| `/workout/:programId/:day` | Full-screen workout player |
| `/progress` | Statistics and weekly activity |
| `/settings` | Preferences and progress reset |

## Workout state machine

`exercise-preview → countdown → exercise-running ⇄ exercise-paused → exercise-completed → rest → next-exercise → … → workout-completed`

Transitions are centralized in `getNextState`. The active session is persisted after each meaningful transition. Timers store timestamps (`exerciseStartedAt`, `pausedAt`, `totalPausedTime`, `restStartedAt`) and derive the displayed value from `Date.now()`, so background throttling cannot make the timer drift.

## Progress invariants

- Day 1 is initially available.
- The first incomplete day is current; later days are locked.
- A day is added to `completedDays` only after its final exercise.
- Replaying an old day produces history without locking or skipping the primary program sequence.
- Ending early preserves completed exercises but does not complete the day.

## Persistence and upgrades

The storage key is `workout-app-state-v1`. The persisted object has an explicit Zustand persistence version and migration function. Future schema changes should increment both the persistence version and the state `version`, then normalize old records inside `migrate`.

## Offline lifecycle

`vite-plugin-pwa` generates the manifest and Workbox service worker. The production build precaches application code, exercise SVGs, PWA icons and local WAV cues. Updates use prompt mode and are never applied while a workout session is active.
