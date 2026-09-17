Создай с нуля полноценное mobile-first веб-приложение на React для прохождения 30-дневных тренировочных челленджей.

Приложение должно ощущаться как нативное фитнес-приложение, а не как обычный сайт.

Главные приоритеты:

* очень простой UX
* удобство использования одной рукой
* минимальное количество действий во время тренировки
* понятный прогресс
* быстрые переходы
* работа оффлайн
* сохранение состояния тренировки
* корректная работа на мобильных устройствах

---

# Основная идея

Приложение называется условно:

**30 Day Workout Challenge**

Пользователь выбирает направление тренировок:

* Full Body
* Arms
* Abs

Для каждого направления есть:

* Beginner
* Intermediate
* Advanced

Внутри каждого уровня сложности есть 2 разных тренировочных плана:

* Plan A
* Plan B

Каждый план рассчитан на 30 дней.

Структура:

Category → Difficulty → Plan → 30 Days → Workout Day → Exercises

---

# Технологии

Используй:

* React
* TypeScript
* Vite
* React Router
* Zustand
* Tailwind CSS
* Framer Motion
* vite-plugin-pwa
* Service Worker
* Web App Manifest
* localStorage
* Web Audio API
* local audio assets

Backend не использовать.

Внешние API для работы приложения не использовать.

После первой загрузки приложение должно полностью работать без интернета.

---

# Mobile First

Основные размеры экранов:

* 360px
* 390px
* 430px

Desktop:

* центрировать приложение
* max-width примерно 480–600px

Приложение должно выглядеть как standalone mobile app.

Использовать:

* крупные touch targets минимум 44–48px
* sticky controls
* bottom navigation
* bottom sheets
* cards
* safe-area-inset
* минимум мелкого текста
* большие цифры таймера
* управление одной рукой

Основные кнопки действий должны находиться ближе к нижней части экрана.

---

# Главная навигация

Bottom navigation:

1. Home
2. Progress
3. Settings

Во время активной тренировки bottom navigation скрывать, чтобы пользователь случайно не вышел.

---

# Home

Показать:

**30 Day Challenge**

Ниже три большие карточки:

* Full Body
* Arms
* Abs

На карточке:

* название
* иллюстрация
* активный план
* количество выполненных дней
* progress bar

Например:

Full Body

12 / 30 days

████████░░

Если у пользователя уже есть активная программа, в верхней части Home показывать большую карточку:

**Continue Workout**

Day 12 · Full Body Beginner

Кнопка:

**CONTINUE**

Это должно быть основным действием после возвращения в приложение.

---

# Onboarding

При первом запуске показать очень короткий onboarding.

Не больше 3 экранов.

Экран 1:

**30 days. One goal.**

Короткое описание приложения.

Экран 2:

Выбор основной цели:

* Full Body
* Arms
* Abs

Экран 3:

Выбор уровня:

* Beginner
* Intermediate
* Advanced

После onboarding сразу предложить начать Day 1.

Onboarding можно пропустить.

Повторно автоматически его не показывать.

---

# Difficulty

После выбора категории показать:

Beginner
Intermediate
Advanced

Для каждого уровня:

* краткое описание
* примерная продолжительность
* интенсивность
* количество упражнений
* два тренировочных плана

Например:

Beginner

10–15 min/day
Low intensity

Plan A
Plan B

---

# Workout Plan

После выбора плана показать 30 дней.

Не использовать мелкую сетку из 30 одинаковых элементов, если это ухудшает usability.

Предпочтительно использовать вертикальный список или timeline.

Например:

Day 1 ✓
Day 2 ✓
Day 3 ✓
Day 4 ← Today
Day 5 🔒
Day 6 🔒

Показывать:

* completed
* current
* locked

Current Day должен быть визуально заметнее остальных.

После открытия экрана автоматически прокручивать список к текущему дню.

---

# Правила прогресса

Day 1 доступен сразу.

Следующий день открывается только после полного завершения предыдущего.

Нельзя открыть будущий день.

Completed Day можно открыть повторно.

Повторное прохождение старой тренировки не должно ломать основной прогресс.

---

# Workout Day

При открытии текущего дня показать summary:

Day 7

6 exercises
~12 min

Ниже список упражнений.

Каждое упражнение:

* название
* небольшая иллюстрация
* reps или duration
* completed state

Например:

Push Ups
12 reps

Plank
45 sec

---

# Workout Overview

Перед началом тренировки показать:

**Today’s Workout**

примерную продолжительность

количество упражнений

список упражнений

и большую кнопку:

**START WORKOUT**

Это позволяет пользователю заранее понять, что его ждёт.

---

# Workout Mode

После START приложение переходит в отдельный полноэкранный Workout Mode.

Во время тренировки минимизировать всё лишнее.

Показывать:

верхняя часть:

Day 7
Exercise 2 / 6

Progress bar

центр:

название упражнения

изображение / анимация

reps или timer

нижняя часть:

главная кнопка действия

---

# Countdown перед упражнением

Перед каждым упражнением:

3

2

1

GO

Каждый шаг сопровождается лёгкой вибрацией.

На GO:

* стартовый whistle
* более сильная vibration
* запуск упражнения

Countdown можно пропустить через настройку.

---

# Exercise Preview

Перед запуском упражнения показать:

* название
* изображения техники
* instructions
* tips

Изображения сменяются fade-анимацией.

Также добавить:

**Skip explanation**

Если пользователь уже знаком с упражнением.

После первого просмотра конкретного упражнения приложение может запомнить это локально.

В следующих тренировках инструкция может открываться в компактном виде.

---

# Два типа упражнений

Поддерживать:

* reps
* timed

---

# Reps Exercise

Например:

Push Ups

12 reps

После START запускается секундомер:

00:01
00:02
00:03

Пользователь выполняет упражнение в собственном темпе.

Главная кнопка:

**DONE**

После DONE:

* timer stop
* finish whistle
* vibration
* exercise completed

Не использовать кнопку STOP как основное действие.

Использовать DONE, потому что это понятнее пользователю.

---

# Timed Exercise

Например:

Plank

45 sec

После START:

45
44
43

...

3
2
1

При последних 3 секундах можно использовать короткие звуковые сигналы.

На 0:

* finish whistle
* vibration
* auto complete

Управление:

Pause
Resume
Finish early

Finish early должен требовать подтверждение.

---

# Таймер

Таймер нельзя реализовывать простым:

setInterval(() => time--)

Вместо этого использовать timestamp:

Date.now()

Хранить:

startedAt
pausedAt
totalPausedDuration

Текущее время вычислять из реального времени.

Это необходимо для корректной работы при:

* background tab
* блокировке экрана
* throttling браузера
* переключении приложений

---

# Wake Lock

Во время активной тренировки использовать:

Screen Wake Lock API

navigator.wakeLock

чтобы экран не выключался.

При возвращении приложения из background автоматически запрашивать Wake Lock снова.

Если API недоступен — приложение продолжает работать без ошибок.

Добавить настройку:

Keep screen awake

ON / OFF

По умолчанию ON.

---

# Rest Screen

После каждого упражнения показывать отдельный экран отдыха.

Например:

**Great job!**

Next:

Push Ups
12 reps

Rest:

00:30

Большая кнопка:

**SKIP REST**

Rest duration:

20–30 секунд.

В последние:

3
2
1

использовать короткие звуковые сигналы.

После 0 автоматически перейти к следующему упражнению.

---

# Smart Rest

Rest time может зависеть от сложности:

Beginner:
30 sec

Intermediate:
25 sec

Advanced:
20 sec

Для тяжёлых упражнений можно задавать индивидуальный restDuration.

---

# Auto Next

Добавить настройку:

Auto-start next exercise

По умолчанию OFF.

Если включено:

после завершения Rest автоматически запускается 3-second countdown следующего упражнения.

Если выключено:

показывать кнопку:

**START NEXT**

---

# Audio

Добавить централизованный AudioService.

Звуки:

* countdown beep
* start whistle
* finish whistle
* timer interval
* workout completed

Все звуки должны храниться локально.

Никаких сетевых audio URL.

---

# Voice intervals

Для длительных упражнений / тренировок голосом сообщать:

30 seconds

60 seconds

90 seconds

и т.д.

Лучше использовать локальные prerecorded audio assets.

SpeechSynthesis можно использовать как дополнительный механизм, но не делать его единственным вариантом.

Offline должен работать гарантированно.

---

# Background Audio

Во время выполнения timed упражнения звуковые сигналы должны продолжать работать настолько надёжно, насколько позволяет браузер.

Не полагаться на визуальный timer как единственный источник состояния.

---

# Haptics

Использовать navigator.vibrate().

Например:

обычный tap:
10 ms

START:
30 ms

exercise complete:
[30, 40, 30]

workout complete:
[50, 50, 100]

Добавить setting:

Haptics

ON / OFF

---

# Exercise Images

Каждое упражнение должно иметь 2–4 изображения.

Например:

Push Up:

position 1
position 2

Показывать их циклически с fade transition.

Можно использовать простые SVG / placeholder illustrations.

Архитектура должна позволять позже легко заменить изображения на реальные.

---

# Exercise Instructions

Структура:

Instructions

1. Place your hands slightly wider than shoulders.
2. Keep your body straight.
3. Lower your chest.
4. Push back up.

Tips

* Keep your core tight
* Don't arch your lower back
* Move under control

Добавить блок:

Common mistakes

с 1–2 короткими пунктами.

---

# Состав тренировок

Самостоятельно создать реалистичные планы.

Full Body:

* Squats
* Lunges
* Jumping Jacks
* Burpees
* Mountain Climbers
* Push Ups
* High Knees
* Glute Bridge
* Superman
* Plank
* Bird Dog
* Calf Raises

Arms:

* Push Ups
* Knee Push Ups
* Diamond Push Ups
* Wide Push Ups
* Triceps Dips
* Shoulder Taps
* Plank Up Downs
* Arm Circles
* Pike Push Ups
* Wall Push Ups

Abs:

* Crunches
* Bicycle Crunches
* Leg Raises
* Russian Twists
* Mountain Climbers
* Plank
* Side Plank
* Heel Touches
* Flutter Kicks
* Dead Bug
* Reverse Crunch
* Toe Touches

---

# Progression

Нагрузка должна увеличиваться постепенно.

Не увеличивать сложность каждый день линейно.

Использовать циклы нагрузки:

несколько дней роста нагрузки

↓

более лёгкий день

↓

следующий цикл

Например:

Day 1
Day 2
Day 3
Day 4 easier

Day 5
Day 6
Day 7
Day 8 recovery

Добавлять recovery days.

Recovery Day всё равно считается тренировочным днём, но содержит лёгкие упражнения или mobility.

---

# Workout Complete

После последнего упражнения показать полноэкранный completion screen.

Например:

🎉

**Day 8 Complete**

12:34

Workout time

7

Exercises completed

+1

Day streak

Добавить subtle confetti или completion animation.

Не делать слишком яркую или долгую анимацию.

Кнопки:

**DONE**

и:

**VIEW PROGRESS**

Следующий день автоматически становится доступен.

---

# Streak

Показывать:

Current streak

Но streak не должен наказывать пользователя слишком сильно.

Не обнулять весь визуальный прогресс программы при пропуске дня.

Основной прогресс — completed workout days.

Streak — дополнительная мотивационная метрика.

---

# Progress Screen

Показывать:

Current streak

Completed workouts

Total workout time

Total exercises

Full Body progress

Arms progress

Abs progress

Также показывать:

This week

и небольшой activity calendar.

Например:

M ✓
T ✓
W ○
T ✓
F ○
S ○
S ○

---

# Personal Bests

Можно показывать небольшие мотивационные достижения:

Longest plank

Fastest workout

Longest streak

Total workout time

Не делать achievements обязательной частью MVP, но архитектура должна позволять добавить их позже.

---

# Pause / Resume Workout

Если пользователь закрывает приложение во время тренировки, сохранять session state.

Например:

activeWorkoutSession

Хранить:

programId
day
exerciseIndex
completedExercises
startedAt
timer state
rest state

При следующем запуске показать:

**Workout in progress**

Day 8 · Exercise 4 / 7

Кнопки:

Resume

End workout

Не терять выполненные упражнения.

---

# Exit Workout

При попытке выйти:

**Workout in progress**

Are you sure you want to exit?

Keep workout
Exit

Если выйти:

уже завершённые упражнения сохраняются.

Текущий Day не считается завершённым.

---

# Accidental taps

Для опасных действий:

* reset progress
* finish early
* end workout

использовать confirmation modal / bottom sheet.

Для обычных действий подтверждение не использовать.

---

# LocalStorage

Использовать Zustand persistence или отдельный persistence layer.

Хранить данные versioned.

Например:

workout-app-state-v1

Структура:

{
version: 1,
profile: {},
selectedPrograms: {},
completedDays: {},
completedExercises: {},
workoutHistory: [],
workoutDurations: {},
activeWorkoutSession: null,
viewedExerciseTutorials: [],
settings: {}
}

---

# Storage migrations

Добавить version.

Если структура store изменится в будущем, предусмотреть migration function.

Не ломать существующий прогресс пользователя после обновления приложения.

---

# Settings

Добавить:

Sound

Voice announcements

Haptics

Keep screen awake

3 second countdown

Auto-start next exercise

Rest duration

Theme

---

# Theme

Поддержать:

System
Light
Dark

По умолчанию:

System

---

# Reset Progress

Кнопка:

**Reset Progress**

После нажатия открыть bottom sheet:

Reset all progress?

This will remove all completed workouts and statistics.

Cancel

Reset

Reset button выделить как destructive.

---

# Undo

Для небольших случайных действий, где возможно, использовать snackbar:

Workout marked complete

Undo

Но не использовать Undo для полного Reset Progress.

---

# PWA

Настроить полноценное PWA.

Использовать:

vite-plugin-pwa

Manifest:

* name
* short_name
* icons
* theme_color
* background_color
* display: standalone
* orientation: portrait

Приложение должно нормально работать как установленное PWA.

---

# Install UX

Если browser поддерживает beforeinstallprompt:

показать ненавязчивую карточку:

**Install app**

Train offline and open it like a normal app.

Install

Not now

Не показывать install prompt при первом же открытии.

Например, показывать после завершения первой тренировки.

---

# Offline

Offline кешировать:

* JS
* CSS
* fonts
* icons
* illustrations
* audio
* workout data

Приложение должно работать в airplane mode.

---

# Offline indicator

Не показывать большой баннер при offline.

Можно показать маленький статус:

Offline

только если это действительно полезно.

Поскольку приложение offline-first, отсутствие интернета не должно восприниматься как ошибка.

---

# App Update UX

Service Worker update не должен внезапно перезагружать приложение во время тренировки.

Если доступно обновление:

показать snackbar:

**Update available**

Update

Later

Если активна тренировка, не предлагать reload до её завершения.

---

# Performance

Не загружать сразу все изображения высокого разрешения.

Использовать:

* lazy loading
* preloading следующего упражнения
* оптимизированные SVG/WebP

Перед началом текущего упражнения заранее preload изображения следующего.

Это должно сделать переход почти мгновенным.

---

# Motion

Framer Motion использовать только там, где он улучшает UX.

Использовать:

* fade
* slide
* subtle scale
* progress animations

Не использовать длинные декоративные анимации.

Учитывать:

prefers-reduced-motion

---

# Gestures

Не делать swipe обязательным способом навигации.

Можно добавить swipe назад как дополнительную возможность, но все действия должны иметь обычные кнопки.

---

# Accessibility

Поддержать:

* minimum touch target 44px
* aria-label
* keyboard navigation
* visible focus
* sufficient contrast
* reduced motion
* screen reader friendly labels

Не использовать цвет как единственный индикатор состояния.

---

# Error Handling

Приложение не должно падать, если недоступны:

* Wake Lock
* Vibrate
* SpeechSynthesis
* AudioContext
* PWA install prompt

Использовать graceful degradation.

---

# Архитектура

Пример:

src/
app/
router/
providers/

components/
ui/
layout/

features/
workout-plans/
workout-player/
exercise/
progress/
settings/
onboarding/

pages/

data/
exercises/
programs/

hooks/

store/

services/
audio/
haptics/
storage/
wake-lock/
pwa/

types/

utils/

---

# Exercise model

type Exercise = {
id: string
name: string
category: 'body' | 'arms' | 'abs'

mode: 'reps' | 'timed'

images: string[]

instructions: string[]

tips?: string[]

commonMistakes?: string[]
}

---

# Workout exercise

type WorkoutExercise = {
exerciseId: string

reps?: number

duration?: number

restDuration?: number
}

---

# Workout day

type WorkoutDay = {
day: number

title?: string

estimatedDuration: number

exercises: WorkoutExercise[]

type?: 'normal' | 'recovery'
}

---

# Program

type WorkoutProgram = {
id: string

category:
| 'body'
| 'arms'
| 'abs'

difficulty:
| 'beginner'
| 'intermediate'
| 'advanced'

variant:
| 'A'
| 'B'

days: WorkoutDay[]
}

---

# Workout Player State Machine

Workout Player не реализовывать набором несвязанных boolean state.

Использовать state machine концепцию.

Состояния:

idle

workout-overview

exercise-preview

countdown

exercise-running

exercise-paused

exercise-completed

rest

next-exercise

workout-completed

Переходы между состояниями должны быть явными.

---

# Active session

Создать ActiveWorkoutSession.

Например:

type ActiveWorkoutSession = {
programId: string
day: number

exerciseIndex: number

completedExerciseIds: string[]

state: WorkoutState

workoutStartedAt: number

exerciseStartedAt?: number

pausedAt?: number

totalPausedTime?: number

restStartedAt?: number
}

---

# Главное UX-правило

Во время тренировки пользователь не должен думать, что нажимать дальше.

На каждом экране должно быть одно очевидное primary action.

Примеры:

START WORKOUT

START

DONE

SKIP REST

START NEXT

FINISH

Не располагать рядом несколько одинаково заметных primary buttons.

---

# One-handed UX

Главные controls держать в нижних 35% экрана.

Не требовать от пользователя тянуться к верхней части экрана для основных действий.

Back / Close могут находиться сверху.

START / DONE / NEXT должны находиться снизу.

---

# Large Timer

В timed exercises timer — главный визуальный элемент.

Он должен занимать значительную часть экрана.

Например:

00:45

Не перегружать этот экран текстом.

---

# Keep user context

После перехода назад приложение должно помнить scroll position и выбранный план.

Не возвращать пользователя каждый раз на Home.

---

# Пример flow

Home

↓

Continue Workout

↓

Day 8

↓

Today's Workout

↓

START WORKOUT

↓

Exercise 1 preview

↓

3

2

1

GO

↓

exercise

↓

DONE

↓

Rest 00:30

↓

Exercise 2

...

↓

Workout Complete

↓

Day 9 unlocked

---

# Критические требования

1. Это полноценное приложение, не prototype.
2. Все основные сценарии должны работать.
3. Backend отсутствует.
4. Внешние API не нужны.
5. Прогресс сохраняется локально.
6. Активная тренировка сохраняется.
7. Следующий день открывается только после завершения текущего.
8. Приложение работает offline.
9. Все необходимые assets доступны offline.
10. Таймер не должен ломаться при background throttling.
11. Workout session должна корректно восстанавливаться.
12. UI должен быть оптимизирован в первую очередь под мобильный телефон.
13. Основные действия должны быть доступны одной рукой.
14. Не оставлять TODO вместо основной логики.

---

# Что нужно реализовать

Создай:

1. Полный React + TypeScript проект.
2. Архитектуру приложения.
3. Routing.
4. Zustand stores.
5. Versioned localStorage persistence.
6. PWA.
7. Service Worker.
8. Offline caching.
9. Все экраны.
10. Workout Player.
11. State machine.
12. Timer engine.
13. Rest timer.
14. AudioService.
15. HapticsService.
16. WakeLockService.
17. Workout session recovery.
18. Exercise tutorials.
19. Workout database.
20. Все 18 тренировочных программ:

* 3 categories
* 3 difficulties
* 2 variants

21. В каждом плане 30 дней.
22. Progressive overload.
23. Recovery days.
24. Progress statistics.
25. Settings.
26. Reset progress.
27. Dark mode.
28. Install PWA flow.
29. Update PWA flow.
30. Error handling.

Сначала спроектируй архитектуру и модели данных.

После этого реализуй приложение.

В конце обязательно:

* запусти TypeScript typecheck
* запусти ESLint
* запусти production build
* исправь все ошибки
* проверь PWA configuration
* проверь отсутствие сетевых зависимостей для core workout flow

Не завершай работу, пока production build не проходит успешно.
