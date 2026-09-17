import { expect, test } from '@playwright/test'
import {
  expectMobileLayout,
  expectPrimaryNearBottom,
  finishRepsAndStartNext,
  finishTimed,
  programId,
  saveScreenshot,
  seedState,
  startDayOne
} from './helpers'

test('onboarding → Day 1 → mixed workout → completion → Day 2 unlock', async ({ page }, testInfo) => {
  await seedState(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /30 дней/ })).toBeVisible()
  await expectPrimaryNearBottom(page, page.getByRole('button', { name: 'ПРОДОЛЖИТЬ' }))
  await expectMobileLayout(page)
  await saveScreenshot(page, testInfo, '01-onboarding')

  await page.getByRole('button', { name: 'ПРОДОЛЖИТЬ' }).click()
  await page.getByRole('button', { name: 'Всё тело' }).click()
  await page.getByRole('button', { name: 'ПРОДОЛЖИТЬ' }).click()
  await page.getByRole('button', { name: 'Начальный' }).click()
  await page.getByRole('button', { name: 'НАЧАТЬ ДЕНЬ 1' }).click()

  await expect(page.getByRole('heading', { name: 'День 1' })).toBeVisible()
  await expectPrimaryNearBottom(page, page.getByRole('button', { name: 'НАЧАТЬ ТРЕНИРОВКУ' }))
  await expectMobileLayout(page)
  await saveScreenshot(page, testInfo, '02-day-one')

  await startDayOne(page)
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toHaveCount(0)
  await expectPrimaryNearBottom(page, page.getByRole('button', { name: 'ГОТОВО' }))
  await expectMobileLayout(page)
  await saveScreenshot(page, testInfo, '03-reps-running')

  await finishRepsAndStartNext(page)
  await finishRepsAndStartNext(page)
  await finishRepsAndStartNext(page)

  await page.getByRole('button', { name: 'Пауза' }).click()
  await expect(page.getByText('Пауза', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeVisible()
  await saveScreenshot(page, testInfo, '04-timed-paused')
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await finishTimed(page)

  await expect(page.getByText('Отдых', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'ПРОПУСТИТЬ ОТДЫХ' }).click()
  await page.getByRole('button', { name: 'НАЧАТЬ ДАЛЬШЕ' }).click()
  await finishTimed(page)

  await expect(page.getByRole('heading', { name: /День 1.*завершён/ })).toBeVisible()
  await expectPrimaryNearBottom(page, page.getByRole('button', { name: 'ГОТОВО' }))
  await expectMobileLayout(page)
  await saveScreenshot(page, testInfo, '05-completion')

  await page.getByRole('button', { name: 'ГОТОВО' }).click()
  await expect(page).toHaveURL(new RegExp(`/program/${programId}$`))
  await expect(page.locator(`a[href="/program/${programId}/day/2"]`)).toBeVisible()
  await expect(page.getByLabel('День 3, заблокирован')).toBeVisible()
  await expectMobileLayout(page)
  await saveScreenshot(page, testInfo, '06-day-two-unlocked')
})
