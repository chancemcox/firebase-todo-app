const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Ensure all outputs go to test-results folder
  outputDir: './test-results/playwright-output',
  reporter: [
    ['html', { outputFolder: './test-results/playwright-report' }],
    ['junit', { outputFile: './test-results/playwright-junit.xml' }],
    ['json', { outputFile: './test-results/playwright-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Global screenshot and video settings
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  // Ensure all artifacts go to test-results
  artifactsDir: './test-results/artifacts',
  // Global timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
