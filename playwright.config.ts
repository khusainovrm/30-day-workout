import { defineConfig } from '@playwright/test'

const viewports = [
  { name: 'mobile-360x800', viewport: { width: 360, height: 800 } },
  { name: 'mobile-390x844', viewport: { width: 390, height: 844 } },
  { name: 'mobile-430x932', viewport: { width: 430, height: 932 } }
]

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'ru-RU',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    ...viewports.map(({ name, viewport }) => ({
      name,
      testIgnore: /release-audit\.spec\.ts/,
      use: { viewport }
    })),
    {
      name: 'release-pwa',
      testMatch: /release-audit\.spec\.ts/,
      use: { channel: 'chrome', viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' as const }
    }
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30_000
  }
})
