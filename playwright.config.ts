import { defineConfig, devices } from '@playwright/test'

const isHeaded = Boolean(process.env.PLAYWRIGHT_HEADED)
const slowMo = Number(process.env.PLAYWRIGHT_SLOW_MO ?? 0)

export default defineConfig({
  testDir: './e2e',
  timeout: isHeaded ? 60_000 : 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    headless: !isHeaded,
    launchOptions: slowMo > 0 ? { slowMo } : undefined,
    trace: isHeaded ? 'on' : 'on-first-retry',
    video: isHeaded ? 'on' : 'off',
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: 'pnpm start',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
})
