# Release checklist

Audit date: 2026-09-18  
Specification: `application.md`  
Environment: macOS, Node.js 22.22.3, npm 10.9.8, Playwright 1.63.0, Google Chrome 153.0.8010.50

## Release status

- [x] No open release blockers were found after fixes and the final verification run.
- [x] Production build completes successfully.
- [x] Core workout flow works after switching Chromium to offline mode following the first online load.
- [x] The PWA can be installed, launched, closed, relaunched and uninstalled through the Chromium PWA CDP API.

## Accessibility

- [x] Keyboard navigation: verified with real `Tab` and `Enter` input on the Day screen. Focus moves to “Назад к программе”, then to the primary “НАЧАТЬ ТРЕНИРОВКУ” action, and Enter opens Workout Mode.
- [x] Focus-visible: the keyboard-focused control has a visible solid outline of at least 2 px.
- [x] Screen-reader labels: axe WCAG A/AA found zero violations on settled onboarding, program, dark settings, workout preview and install-card states.
- [x] Progress bars have an accessible name. The audit initially found an unnamed workout progressbar; `aria-label="Прогресс"` was added.
- [x] Completed and locked states do not rely on color alone. Completed exercises have visible “Готово”; completed program days have a check icon plus screen-reader text “Выполнено”; locked days have a lock icon and an accessible locked label.
- [x] Contrast: axe found zero WCAG A/AA contrast violations after fixes. The audit initially found insufficient dark-theme contrast for destructive `red-600` text (3.3–3.38:1); dark mode now uses `red-400`.
- [x] Reduced motion: with `prefers-reduced-motion: reduce`, the exercise technique image remains on the first frame for at least 1.7 seconds and the media query is active.
- [x] Touch targets and mobile layout are covered at 360×800, iPhone 8 Plus 414×736, 390×844 and 430×932: no interactive target under 44 px and no detected clipped headings, paragraphs, labels or actions.

## Manifest and icons

- [x] Generated manifest was fetched from the production preview and parsed successfully.
- [x] Verified manifest values: `id: /`, `scope: /`, `start_url: /`, Russian name/short name, `display: standalone`, `orientation: portrait-primary`, theme and background colors.
- [x] Verified 192×192 and 512×512 regular icons and a 512×512 icon with `purpose: maskable`.
- [x] Maskable PNG decodes at 512×512 in Chromium.
- [x] The previous maskable asset had white outer margins. It was replaced with a full-bleed dark background and a centered glyph inside the mask-safe area.

## Service worker, install and update flow

- [x] Service worker registration reaches `ready`; after reload the production page has an active `navigator.serviceWorker.controller`.
- [x] Production precache contains 129 entries, including application bundles, icons, exercise WebP images and local audio.
- [x] Install card appears only when an install event is available and workout history is non-empty. “УСТАНОВИТЬ” and “НЕ СЕЙЧАС” are both accessible actions.
- [x] Install-card rendering was tested with a controlled `beforeinstallprompt` event. Actual installability was independently verified by successful Chrome `PWA.install` and `PWA.launch` calls.
- [x] The installed PWA launches the requested in-scope workout URL. Its app target was closed and launched again successfully.
- [x] The active `exercise-running` session and exercise index remained persisted across installed-app target close/relaunch.
- [x] A real service worker byte update was served and installed during an active workout. No navigation/reload occurred and the update card stayed hidden.
- [x] After leaving Workout Mode, the same waiting update produced “Доступно обновление”; “ПОЗЖЕ” dismissed it without reloading.

## Offline and network behavior

- [x] The production page was loaded online once and confirmed to be service-worker controlled before airplane-mode emulation.
- [x] With Chromium offline, Day 1 reloaded successfully from cache.
- [x] Offline core flow completed: open Day 1, start a reps exercise, mark it done, enter rest, skip rest, start the next exercise.
- [x] The app window was closed and reopened while offline; the next `exercise-running` session restored at exercise index 1.
- [x] Zero external HTTP(S) requests were observed across the audited core workout flow. Requests were limited to `127.0.0.1`, representing the production preview origin and service-worker cache lookups.

## Regression coverage

- [x] Vitest: 30 tests passed across 8 files, including persistent/idempotent workout completion and explicit return to the calendar.
- [x] Mobile Playwright matrix includes 360×800, iPhone 8 Plus 414×736, 390×844 and 430×932; the core completion flow passes on all four viewports.
- [x] Release PWA Playwright project: 6 tests passed in Google Chrome with service workers enabled.
- [x] Existing screenshots remain available under `e2e/screenshots/` for nine key states at each mobile viewport.

## Build checks

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm test`
- [x] `npm run build`
- [x] `npx playwright test`

The final command outputs and counts above come from actual local runs against the production preview; unchecked or inferred results are not included.
