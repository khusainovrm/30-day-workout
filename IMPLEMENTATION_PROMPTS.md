# Поэтапные промпты для реализации 30 Day Workout Challenge

Ниже — последовательность готовых промптов. Их можно копировать в новую сессию с coding agent по одному. Каждый следующий этап предполагает, что изменения предыдущего уже находятся в рабочем каталоге. После каждого этапа просите агента сохранить рабочее состояние и не заменять существующую реализацию упрощённым прототипом.

## Этап 1. Анализ требований и каркас проекта

```text
Прочитай application.md целиком. Создай с нуля React + TypeScript + Vite проект для mobile-first PWA «30 Day Workout Challenge». Подключи React Router, Zustand, Tailwind CSS, Framer Motion и vite-plugin-pwa. Сначала создай ARCHITECTURE.md: опиши слои, маршруты, модели данных, persisted state, state machine тренировки, правила разблокировки дней и offline-стратегию. Затем создай исходный каркас каталогов. Не реализуй заглушку вместо архитектуры. Запусти typecheck и production build, исправь ошибки.
```

## Этап 2. Доменные модели и база упражнений

```text
Продолжи существующий проект. Реализуй строгие TypeScript-модели Exercise, WorkoutExercise, WorkoutDay, WorkoutProgram, ActiveWorkoutSession, WorkoutHistoryItem, Settings и WorkoutState согласно application.md. Создай локальный каталог всех перечисленных упражнений Full Body, Arms и Abs: тип нагрузки, инструкции, советы, частые ошибки и ссылки на локальные иллюстрации. Никаких внешних API или удалённых assets. Проверь уникальность id и отсутствие битых ссылок. Запусти typecheck и lint.
```

## Этап 3. Все 18 программ по 30 дней

```text
Реализуй все 18 тренировочных программ: 3 категории × 3 сложности × Plan A/Plan B, по 30 дней каждая. Допускается детерминированная генерация из конфигурации, но на runtime должны существовать полноценные WorkoutProgram и WorkoutDay. Сделай циклическую прогрессию нагрузки, облегчённые дни и recovery days, а не линейное увеличение каждый день. Учитывай reps/timed, сложность, длительность и индивидуальный restDuration. Добавь автоматическую проверку: 18 уникальных программ, в каждой ровно 30 дней, ссылки только на существующие упражнения, валидные значения reps/duration. Запусти проверки и build.
```

## Этап 4. Persisted Zustand store

```text
Создай Zustand store с versioned persistence под ключом workout-app-state-v1. Храни onboarding, selectedPrograms, completedDays, completedExercises, workoutHistory, activeWorkoutSession, viewedExerciseTutorials и settings. Добавь явную migration function для будущих версий. Реализуй безопасные actions, исключающие дубликаты. Зафиксируй инварианты: будущие дни нельзя отметить через UI; повтор старого дня не ломает основной прогресс; reset удаляет прогресс и статистику. Не очищай localStorage целиком — только состояние приложения. Добавь тесты чистой логики, typecheck и lint.
```

## Этап 5. UI foundation и навигация

```text
Создай mobile-first UI foundation в стиле нативного фитнес-приложения. Ширина 360/390/430 px должна быть приоритетной, desktop-контейнер ограничь примерно 540 px. Реализуй theme tokens, System/Light/Dark, safe-area-inset, focus-visible, reduced motion, touch targets минимум 44 px, карточки, buttons, progress bar, modal/bottom sheet и snackbar. Добавь AppShell и bottom navigation Home/Progress/Settings; в workout mode навигация должна скрываться. Используй lucide icons и Framer Motion умеренно. Запусти build.
```

## Этап 6. Onboarding и Home

```text
Реализуй onboarding максимум из 3 экранов: вводный экран, выбор цели и выбор сложности. Разреши Skip, больше автоматически onboarding не показывай. После выбора создай активный Plan A и предложи Day 1. Реализуй Home: три крупные карточки категорий, активный план, количество завершённых дней и progress bar. Если есть выбранная программа или незавершённая сессия, сверху должна быть доминирующая Continue/Resume card с правильным deep link. Интерфейс должен удобно работать одной рукой. Проверь сценарии первого и повторного запуска.
```

## Этап 7. Выбор программы и timeline 30 дней

```text
Реализуй экраны Category → Difficulty → Plan. Для сложности покажи продолжительность, интенсивность, число упражнений и Plan A/B. Экран программы сделай вертикальным timeline на 30 дней с completed/current/locked состояниями, recovery marker и данными дня. Автоматически прокручивай к current day. Day 1 открыт сразу, следующий открывается только после полного завершения предыдущего, completed day можно повторить. Не используй цвет как единственный индикатор. Проверь прямые URL на заблокированные дни.
```

## Этап 8. Workout overview и tutorial

```text
Создай экран Day/Today's Workout: номер дня, примерная длительность, число упражнений, полный список reps/duration и крупная нижняя START WORKOUT. После старта открывай полноэкранный workout player. Перед упражнением показывай Exercise Preview с 2–4 локальными изображениями/кадрами, инструкциями, tips и common mistakes. Запоминай просмотр tutorial локально и при повторном просмотре показывай компактный вариант. Предзагружай asset следующего упражнения. Добавь доступные alt/aria labels.
```

## Этап 9. Workout state machine

```text
Реализуй workout player как явную state machine, а не набор несвязанных boolean: exercise-preview, countdown, exercise-running, exercise-paused, exercise-completed, rest, next-exercise, workout-completed. Определи разрешённые events и переходы централизованно. На каждом состоянии оставь одно очевидное primary action в нижних 35% экрана. Сохраняй activeWorkoutSession после каждого значимого перехода. Добавь защиту от двойного complete и повторных side effects в React StrictMode.
```

## Этап 10. Надёжные таймеры и восстановление

```text
Реализуй reps stopwatch, timed countdown и rest timer только на основе timestamp: Date.now(), startedAt, pausedAt, totalPausedDuration и restStartedAt. setInterval может лишь вызывать render, но не быть источником времени. Поддержи Pause/Resume, DONE и Finish early с подтверждением. После перезагрузки, background tab или блокировки экрана вычисляй правильное оставшееся время и восстанавливай workout state. При запуске приложения показывай Resume незавершённой тренировки. Проверь поведение ручным изменением времени и reload.
```

## Этап 11. Rest, auto-next и завершение дня

```text
Реализуй отдельный Rest Screen: Great job, следующее упражнение, таймер, SKIP REST. Длительность по умолчанию: Beginner 30, Intermediate 25, Advanced 20 секунд, но учитывай override упражнения. Последние 3 секунды сопровождай короткими сигналами. При Auto-start OFF после отдыха показывай START NEXT, при ON запускай countdown следующего упражнения. После последнего упражнения покажи completion screen со временем, количеством упражнений и +1 day. Только тогда разблокируй следующий день. Добавь ненавязчивую completion animation.
```

## Этап 12. Device services

```text
Создай централизованные AudioService, HapticsService и WakeLockService. Все аудиофайлы должны лежать локально и precache для offline: countdown beep, start, finish, workout complete. Web Audio может быть fallback. navigator.vibrate и navigator.wakeLock должны использоваться только при включённых настройках и не вызывать ошибок при отсутствии API. После visibilitychange повторно запрашивай Wake Lock. Добавь voice intervals с локальным механизмом там, где есть assets, и безопасным SpeechSynthesis fallback. Разблокируй AudioContext из пользовательского gesture.
```

## Этап 13. Progress и Settings

```text
Реализуй Progress: current streak без наказания основного прогресса, completed workouts, total workout time, total exercises, прогресс трёх категорий, This week calendar и последние тренировки. Статистику вычисляй из persisted history. Реализуй Settings: sound, voice, haptics, keep screen awake, countdown, auto-start, rest duration и System/Light/Dark theme. Reset Progress вынеси в destructive confirmation bottom sheet без Undo. Убедись, что настройки переживают reload.
```

## Этап 14. PWA, install и update UX

```text
Настрой production-ready PWA: корректный manifest, 192/512/maskable icons, portrait orientation, standalone display, theme/background colors. Workbox должен precache JS, CSS, HTML, icons, SVG/WebP, WAV и workout data; core workout flow после первой загрузки обязан работать без сети. Перехвати beforeinstallprompt, но показывай Install card только после первой завершённой тренировки. Обновления service worker применяй через snackbar Update/Later и никогда не reload во время active workout. Проверь generated manifest и service worker в dist.
```

## Этап 15. Финальная проверка качества

```text
Проведи полный аудит проекта по application.md. Не переписывай рабочие части без необходимости. Проверь onboarding, выбор всех 18 программ, блокировку дней, replay, state machine, reps/timed, pause/resume, rest/auto-next, completion, session recovery, reset, themes, offline и PWA update guard. Проверь экраны 360, 390, 430 и desktop. Затем обязательно выполни TypeScript typecheck, ESLint с нулём warnings и production build; исправь все ошибки. Проверь dist: manifest, service worker, локальные exercise/audio assets и отсутствие сетевых зависимостей core flow. В финале перечисли выполненные команды и известные ограничения браузерных API.
```

## Универсальный контрольный промпт после любого этапа

```text
Проверь текущие изменения на соответствие application.md. Не оставляй TODO в основной логике. Не используй внешние API и удалённые assets. Сохрани совместимость с уже записанным workout-app-state-v1. Выполни npm run typecheck, npm run lint и npm run build; исправь все ошибки и warnings до завершения ответа. Кратко перечисли изменённые файлы, проверенные сценарии и оставшиеся ограничения, если они действительно есть.
```
