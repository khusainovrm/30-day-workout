import { expect, test } from '@playwright/test'
import {
  expectMobileLayout,
  programId,
  readPersistedState,
  saveScreenshot,
  seedState,
  startDayOne
} from './helpers'

const onboardedState = {
  hasOnboarded: true,
  selectedPrograms: { body: programId },
  completedDays: {},
  completedExercises: {},
  workoutHistory: [],
  activeWorkoutSession: null,
  viewedExerciseTutorials: ['lunges']
}

test('reload and resume exercise/rest, then exit without completing day', async ({ page }, testInfo) => {
  await seedState(page, onboardedState)
  await page.goto(`/program/${programId}/day/1`)
  await startDayOne(page)

  await page.reload()
  await expect(page.getByText('Продолжай')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toHaveCount(0)
  await saveScreenshot(page, testInfo, '07-reloaded-exercise')

  await page.goto('/')
  await expect(page.getByText('ВОЗОБНОВИТЬ')).toBeVisible()
  await page.getByText('ВОЗОБНОВИТЬ').click()
  await expect(page.getByText('Продолжай')).toBeVisible()

  await page.getByRole('button', { name: 'ГОТОВО' }).click()
  await expect(page.getByText('Отдых', { exact: true })).toBeVisible()
  const restBeforeReload = await page.locator('.font-mono').textContent()
  await page.reload()
  await expect(page.getByText('Отдых', { exact: true })).toBeVisible()
  const restAfterReload = await page.locator('.font-mono').textContent()
  const toSeconds = (value: string | null) => {
    const [minutes, seconds] = (value ?? '00:00').split(':').map(Number)
    return minutes * 60 + seconds
  }
  expect(toSeconds(restAfterReload)).toBeLessThanOrEqual(toSeconds(restBeforeReload))
  expect(toSeconds(restAfterReload)).toBeGreaterThanOrEqual(toSeconds(restBeforeReload) - 2)
  await saveScreenshot(page, testInfo, '08-reloaded-rest')

  await page.getByRole('button', { name: 'Выйти из тренировки' }).click()
  await page.getByRole('dialog', { name: 'Тренировка не закончена' }).getByRole('button', { name: 'ВЫЙТИ' }).click()
  await expect(page.getByRole('heading', { name: 'День 1' })).toBeVisible()
  await expect(page.getByText('Готово')).toHaveCount(1)
  const state = await readPersistedState(page)
  expect(state.completedDays?.[programId] ?? []).not.toContain(1)
  expect(state.activeWorkoutSession).toBeNull()
  await expectMobileLayout(page)
})

test('replays a completed day from the first exercise', async ({ page }) => {
  await seedState(page, {
    ...onboardedState,
    completedDays: { [programId]: [1] },
    completedExercises: { [`${programId}:1`]: ['0:lunges', '1:push-ups'] },
    workoutHistory: [{ id: 'done', programId, day: 1, completedAt: 1, duration: 300, exerciseCount: 5 }]
  })
  await page.goto(`/program/${programId}/day/1`)

  await page.getByRole('button', { name: 'ПОВТОРИТЬ ТРЕНИРОВКУ' }).click()
  await expect(page).toHaveURL(new RegExp(`/workout/${programId}/1$`))
  await expect(page.getByText('Упражнение 1 из 5')).toBeVisible()
  const state = await readPersistedState(page)
  expect(state.activeWorkoutSession).toMatchObject({ exerciseIndex: 0, completedExerciseIds: [], state: 'exercise-preview' })
})

test('switches theme and resets progress', async ({ page }, testInfo) => {
  await seedState(page, {
    ...onboardedState,
    completedDays: { [programId]: [1] },
    completedExercises: { [`${programId}:1`]: ['0:lunges'] },
    viewedExerciseTutorials: ['lunges'],
    workoutHistory: [{ id: 'done', programId, day: 1, completedAt: 1, duration: 300, exerciseCount: 5 }]
  })
  await page.goto('/settings')

  await page.getByLabel('Тема').selectOption('dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await saveScreenshot(page, testInfo, '09-dark-theme')

  await page.getByLabel('Тема').selectOption('light')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.getByRole('button', { name: 'СБРОСИТЬ ПРОГРЕСС' }).click()
  await page.getByRole('dialog', { name: 'Сбросить весь прогресс?' }).getByRole('button', { name: 'СБРОСИТЬ ВСЁ' }).click()

  const state = await readPersistedState(page)
  expect(state.completedDays).toEqual({})
  expect(state.completedExercises).toEqual({})
  expect(state.workoutHistory).toEqual([])
  expect(state.selectedPrograms).toEqual({})
  expect(state.settings.theme).toBe('light')
  await expectMobileLayout(page)
})
