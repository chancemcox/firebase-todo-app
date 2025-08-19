import { test, expect } from '@playwright/test';

test.describe('Simple Page Load Test', () => {
  test('should load the production page and check for errors', async ({ page }) => {
    console.log('Starting simple page load test...');
    
    // Navigate to the login page
    await page.goto('/login');
    console.log('Navigated to /login');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    console.log('DOM content loaded');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    console.log('Network idle');
    
    // Get the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Get the current URL
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check if the root div exists
    const rootDiv = page.locator('#root');
    const rootExists = await rootDiv.count() > 0;
    console.log('Root div exists:', rootExists);
    
    if (rootExists) {
      const rootContent = await rootDiv.textContent();
      console.log('Root div content length:', rootContent ? rootContent.length : 0);
      console.log('Root div content preview:', rootContent ? rootContent.substring(0, 100) : 'empty');
    }
    
    // Check for any console errors
    const consoleErrors = [];
    const consoleLogs = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console Error:', msg.text());
      } else if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
        console.log('Console Log:', msg.text());
      }
    });
    
    // Wait a bit for any JavaScript to execute
    await page.waitForTimeout(5000);
    
    // Check for any error messages on the page
    const errorElements = page.locator('.bg-red-100, .text-red-700, [class*="error"], .error');
    const errorCount = await errorElements.count();
    console.log('Error elements found:', errorCount);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}:`, errorText);
      }
    }
    
    // Check for any loading indicators
    const loadingElements = page.locator('[class*="loading"], [class*="spinner"], .loading, .spinner');
    const loadingCount = await loadingElements.count();
    console.log('Loading elements found:', loadingCount);
    
    // Take a screenshot
    await page.screenshot({ path: 'simple-page-load-test.png' });
    console.log('Screenshot saved as simple-page-load-test.png');
    
    // Log summary
    console.log('\n=== Test Summary ===');
    console.log('Page title:', title);
    console.log('URL:', url);
    console.log('Root div exists:', rootExists);
    console.log('Console errors:', consoleErrors.length);
    console.log('Console logs:', consoleLogs.length);
    console.log('Page errors:', errorCount);
    console.log('Loading indicators:', loadingCount);
    
    // The test passes if we can at least load the page
    expect(title).toBeTruthy();
    expect(url).toContain('todo-list-e7788.web.app');
  });
});
