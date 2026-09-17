import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { programId, readPersistedState, seedState } from './helpers'

test.describe.configure({ mode: 'serial' })

const completedWorkout = {
  hasOnboarded: true,
  selectedPrograms: { body: programId },
  completedDays: { [programId]: [1] },
  completedExercises: { [`${programId}:1`]: ['0:lunges', '1:push-ups', '2:glute-bridge', '3:plank', '4:mountain-climbers'] },
  workoutHistory: [{ id: 'release-audit', programId, day: 1, completedAt: 1, duration: 300, exerciseCount: 5 }],
  activeWorkoutSession: null,
  viewedExerciseTutorials: ['lunges']
}

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const summary = results.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    nodes: nodes.map(node => ({ target: node.target, html: node.html, failure: node.failureSummary }))
  }))
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([])
}

test('keyboard, labels, contrast, focus-visible and non-color indicators', async ({ page }) => {
  await page.goto('/onboarding')
  await page.waitForTimeout(1_000)
  await expectNoA11yViolations(page)
  await page.evaluate(({ key, state }) => {
    localStorage.setItem(key, JSON.stringify({ state: { version: 1, ...state }, version: 1 }))
  }, { key: 'workout-app-state-v1', state: completedWorkout })
  await page.goto(`/program/${programId}`)
  await expectNoA11yViolations(page)
  await expect(page.getByText('Выполнено', { exact: true })).toBeAttached()
  await expect(page.getByLabel('День 3, заблокирован')).toBeVisible()

  await page.goto('/settings')
  await page.getByLabel('Тема').selectOption('dark')
  await page.waitForTimeout(100)
  await expectNoA11yViolations(page)
  await page.getByLabel('Тема').selectOption('light')

  await page.goto(`/program/${programId}/day/2`)
  await page.keyboard.press('Tab')
  const focusedBack = page.getByRole('link', { name: 'Назад к программе' })
  await expect(focusedBack).toBeFocused()
  const focusStyle = await focusedBack.evaluate(element => {
    const style = getComputedStyle(element)
    return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth) }
  })
  expect(focusStyle.outlineStyle).not.toBe('none')
  expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2)

  await page.keyboard.press('Tab')
  const startButton = page.getByRole('button', { name: 'НАЧАТЬ ТРЕНИРОВКУ' })
  await expect(startButton).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(new RegExp(`/workout/${programId}/2$`))
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toHaveCount(0)
  await page.waitForTimeout(1_000)
  await expectNoA11yViolations(page)
})

test('prefers-reduced-motion keeps technique frame stable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedState(page, {
    ...completedWorkout,
    completedDays: {},
    activeWorkoutSession: {
      programId,
      day: 1,
      exerciseIndex: 0,
      completedExerciseIds: [],
      state: 'exercise-preview',
      workoutStartedAt: Date.now(),
      totalPausedTime: 0
    },
    viewedExerciseTutorials: []
  })
  await page.goto(`/workout/${programId}/1`)
  const technique = page.getByAltText('Техника упражнения «Выпады»')
  const firstSource = await technique.getAttribute('src')
  await page.waitForTimeout(1_700)
  await expect(technique).toHaveAttribute('src', firstSource ?? '')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
})

test('manifest, maskable icon, service worker and install card are valid', async ({ page, context }) => {
  await seedState(page, completedWorkout)
  await page.goto('/')

  const manifestResponse = await page.request.get('/manifest.webmanifest')
  expect(manifestResponse.ok()).toBe(true)
  const manifest = await manifestResponse.json()
  expect(manifest).toMatchObject({
    id: '/',
    scope: '/',
    name: '30 дней тренировок',
    short_name: '30 дней',
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: '#10130f',
    background_color: '#f3f2ec'
  })
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ src: '/pwa-192x192.png', sizes: '192x192' }),
    expect.objectContaining({ src: '/pwa-512x512.png', sizes: '512x512' }),
    expect.objectContaining({ src: '/maskable-icon-512x512.png', sizes: '512x512', purpose: 'maskable' })
  ]))

  const maskableSize = await page.evaluate(async () => {
    const image = new Image()
    image.src = '/maskable-icon-512x512.png'
    await image.decode()
    return { width: image.naturalWidth, height: image.naturalHeight }
  })
  expect(maskableSize).toEqual({ width: 512, height: 512 })

  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'dismissed' }>
    }
    event.prompt = async () => {}
    event.userChoice = Promise.resolve({ outcome: 'dismissed' })
    window.dispatchEvent(event)
  })
  await expect(page.getByText('Установить приложение')).toBeVisible()
  await expect(page.getByRole('button', { name: 'УСТАНОВИТЬ' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'НЕ СЕЙЧАС' })).toBeVisible()
  await expectNoA11yViolations(page)

  const registrations = await context.serviceWorkers()
  expect(registrations).toHaveLength(1)
})

test('Chromium installs, launches and restores the closed PWA', async ({ page, browser }) => {
  const manifestId = 'http://127.0.0.1:4173/'
  const workoutUrl = `${manifestId}workout/${programId}/1`
  await seedState(page, {
    ...completedWorkout,
    completedDays: {},
    activeWorkoutSession: {
      programId,
      day: 1,
      exerciseIndex: 0,
      completedExerciseIds: [],
      state: 'exercise-running',
      workoutStartedAt: Date.now() - 5_000,
      exerciseStartedAt: Date.now() - 5_000,
      totalPausedTime: 0
    }
  })
  await page.goto(workoutUrl)
  await page.evaluate(() => navigator.serviceWorker.ready)
  const cdp = await browser.newBrowserCDPSession()

  try {
    await cdp.send('PWA.install', { manifestId, installUrlOrBundleUrl: manifestId })
    const launch = await cdp.send('PWA.launch', { manifestId, url: workoutUrl })
    expect(launch.targetId).toBeTruthy()
    const installedTarget = await cdp.send('Target.getTargetInfo', { targetId: launch.targetId })
    expect(installedTarget.targetInfo.url).toBe(workoutUrl)
    await cdp.send('Target.closeTarget', { targetId: launch.targetId })

    const relaunched = await cdp.send('PWA.launch', { manifestId, url: workoutUrl })
    const restoredTarget = await cdp.send('Target.getTargetInfo', { targetId: relaunched.targetId })
    expect(restoredTarget.targetInfo.url).toBe(workoutUrl)
    const restoredState = await readPersistedState(page)
    expect(restoredState.activeWorkoutSession).toMatchObject({ state: 'exercise-running', exerciseIndex: 0 })

    const osState = await cdp.send('PWA.getOsAppState', { manifestId })
    expect(osState.badgeCount).toBe(0)
  } finally {
    await cdp.send('PWA.uninstall', { manifestId }).catch(() => {})
    await cdp.detach()
  }
})

test('core workout remains offline, makes no external requests, and restores after app-window close', async ({ page, context }) => {
  await seedState(page, {
    ...completedWorkout,
    completedDays: {},
    workoutHistory: [],
    completedExercises: {},
    activeWorkoutSession: null
  })
  const externalRequests: string[] = []
  context.on('request', request => {
    const url = new URL(request.url())
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '127.0.0.1') externalRequests.push(request.url())
  })

  await page.goto(`/program/${programId}/day/1`)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'День 1' })).toBeVisible()
  await page.getByRole('button', { name: 'НАЧАТЬ ТРЕНИРОВКУ' }).click()
  await page.getByRole('button', { name: 'НАЧАТЬ' }).click()
  await expect(page.getByText('Продолжай')).toBeVisible()
  await page.getByRole('button', { name: 'ГОТОВО' }).click()
  await expect(page.getByText('Отдых', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'ПРОПУСТИТЬ ОТДЫХ' }).click()
  await page.getByRole('button', { name: 'НАЧАТЬ ДАЛЬШЕ' }).click()
  await expect(page.getByText('Продолжай')).toBeVisible()
  expect(externalRequests).toEqual([])

  const url = page.url()
  await page.close()
  const reopened = await context.newPage()
  await reopened.goto(url)
  await expect(reopened.getByText('Продолжай')).toBeVisible()
  const restored = await readPersistedState(reopened)
  expect(restored.activeWorkoutSession).toMatchObject({ state: 'exercise-running', exerciseIndex: 1 })
  await context.setOffline(false)
})

test('update prompt is suppressed during an active workout and never reloads it', async ({ page }) => {
  await seedState(page, {
    ...completedWorkout,
    completedDays: {},
    activeWorkoutSession: {
      programId,
      day: 1,
      exerciseIndex: 0,
      completedExerciseIds: [],
      state: 'exercise-running',
      workoutStartedAt: Date.now() - 5_000,
      exerciseStartedAt: Date.now() - 5_000,
      totalPausedTime: 0
    }
  })
  await page.goto(`/workout/${programId}/1`)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  const navigationCount = await page.evaluate(() => performance.getEntriesByType('navigation').length)
  const serviceWorkerPath = resolve('dist/sw.js')
  const originalServiceWorker = await readFile(serviceWorkerPath, 'utf8')

  try {
    await writeFile(serviceWorkerPath, `${originalServiceWorker}\n// release-audit-update-${Date.now()}\n`)
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      const installed = new Promise<void>(resolveInstalled => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed') resolveInstalled()
          })
        }, { once: true })
      })
      await registration.update()
      await installed
    })

    await expect(page.getByText('Продолжай')).toBeVisible()
    await expect(page.getByText('Доступно обновление')).toHaveCount(0)
    expect(await page.evaluate(() => performance.getEntriesByType('navigation').length)).toBe(navigationCount)

    await page.getByRole('button', { name: 'Выйти из тренировки' }).click()
    await page.getByRole('dialog', { name: 'Тренировка не закончена' }).getByRole('button', { name: 'ВЫЙТИ' }).click()
    await expect(page.getByText('Доступно обновление')).toBeVisible()
    await page.getByRole('button', { name: 'ПОЗЖЕ' }).click()
    await expect(page.getByText('Доступно обновление')).toHaveCount(0)
  } finally {
    await writeFile(serviceWorkerPath, originalServiceWorker)
  }
})
