import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export const storageKey = 'workout-app-state-v1'
export const programId = 'body-beginner-a'

const quietSettings = {
  sound: false,
  voice: false,
  haptics: false,
  keepAwake: false,
  countdown: false,
  autoNext: false,
  restDuration: 30,
  theme: 'system'
}

export async function seedState(page: Page, state: Record<string, unknown> = {}) {
  await page.addInitScript(({ key, persistedState }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ state: persistedState, version: 1 }))
  }, {
    key: storageKey,
    persistedState: { version: 1, settings: quietSettings, ...state }
  })
}

export async function readPersistedState(page: Page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}').state ?? {}, storageKey)
}

export async function saveScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const path = resolve('e2e/screenshots', testInfo.project.name, `${name}.png`)
  await mkdir(dirname(path), { recursive: true })
  await page.screenshot({ path })
}

export async function expectPrimaryNearBottom(page: Page, locator: Locator) {
  await expect(locator).toBeVisible()
  const box = await locator.boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(box!.y + box!.height / 2).toBeGreaterThan(viewport!.height * .65)
}

export async function expectMobileLayout(page: Page) {
  const invalidTargets = await page.locator('a:visible, button:visible, select:visible, input:visible:not(.sr-only)').evaluateAll(elements =>
    elements.flatMap(element => {
      const rect = element.getBoundingClientRect()
      if (rect.width >= 44 && rect.height >= 44) return []
      return [{ text: (element.textContent ?? element.getAttribute('aria-label') ?? '').trim(), width: rect.width, height: rect.height }]
    })
  )
  expect(invalidTargets, `Touch targets smaller than 44px: ${JSON.stringify(invalidTargets)}`).toEqual([])

  const clippedText = await page.locator('h1:visible, h2:visible, h3:visible, p:visible, button:visible, a:visible, label:visible').evaluateAll(elements =>
    elements.flatMap(element => {
      const style = getComputedStyle(element)
      const clipped = (style.overflowX === 'hidden' && element.scrollWidth > element.clientWidth + 1)
        || (style.overflowY === 'hidden' && element.scrollHeight > element.clientHeight + 1)
      return clipped ? [(element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 100)] : []
    })
  )
  expect(clippedText, `Clipped text: ${JSON.stringify(clippedText)}`).toEqual([])

  expect(await page.evaluate(() => CSS.supports('padding-top', 'env(safe-area-inset-top)'))).toBe(true)
}

export async function startDayOne(page: Page) {
  await page.getByRole('button', { name: 'НАЧАТЬ ТРЕНИРОВКУ' }).click()
  await expect(page).toHaveURL(new RegExp(`/workout/${programId}/1$`))
  const skipExplanation = page.getByRole('button', { name: 'Пропустить объяснение' })
  if (await skipExplanation.isVisible()) await skipExplanation.click()
  else await page.getByRole('button', { name: 'НАЧАТЬ' }).click()
  await expect(page.getByText('Продолжай')).toBeVisible()
}

export async function finishRepsAndStartNext(page: Page) {
  await page.getByRole('button', { name: 'ГОТОВО' }).click()
  await expect(page.getByText('Отдых', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'ПРОПУСТИТЬ ОТДЫХ' }).click()
  await page.getByRole('button', { name: 'НАЧАТЬ ДАЛЬШЕ' }).click()
  await expect(page.getByText('Продолжай')).toBeVisible()
}

export async function finishTimed(page: Page) {
  await page.getByRole('button', { name: 'ЗАВЕРШИТЬ РАНЬШЕ' }).click()
  const dialog = page.getByRole('dialog', { name: 'Завершить упражнение раньше?' })
  await dialog.getByRole('button', { name: 'ЗАВЕРШИТЬ РАНЬШЕ' }).click()
}
