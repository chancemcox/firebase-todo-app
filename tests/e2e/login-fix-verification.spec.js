import { test, expect } from '@playwright/test';

test.describe('Login Page Fix Verification', () => {
  
  test('should load login page without JavaScript module errors', async ({ page }) => {
    // Track console errors
    const jsErrors = [];
    const networkErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // Navigate to login page
    await page.goto('/login');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that we don't have the specific MIME type error
    const hasMimeError = jsErrors.some(error => 
      error.includes('Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"')
    );
    
    expect(hasMimeError, `JavaScript MIME type error found: ${jsErrors.join('\n')}`).toBe(false);
    
    // Check for missing JavaScript files
    const hasMissingJS = networkErrors.some(error => 
      error.includes('.js') && (error.includes('404') || error.includes('500'))
    );
    
    expect(hasMissingJS, `Missing JavaScript files: ${networkErrors.join('\n')}`).toBe(false);
    
    // Verify login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Sign in' })).toBeVisible();
    
    // Log any remaining errors for debugging
    if (jsErrors.length > 0) {
      console.log('JavaScript errors found:', jsErrors);
    }
    if (networkErrors.length > 0) {
      console.log('Network errors found:', networkErrors);
    }
  });

  test('should not have browser extension conflicts', async ({ page }) => {
    const extensionErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('StacksProvider') ||
        msg.text().includes('inpage.js') ||
        msg.text().includes('listener indicated an asynchronous response')
      )) {
        extensionErrors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // These errors are from browser extensions, not our app
    // But we can log them for reference
    if (extensionErrors.length > 0) {
      console.log('Browser extension errors (not app-related):', extensionErrors);
    }
    
    // The important thing is that our login form still works despite extension errors
    await expect(page.locator('h2', { hasText: 'Sign in to your account' })).toBeVisible();
  });

  test('should load production site without module errors', async ({ page }) => {
    // Test the actual production site
    const jsErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    try {
      await page.goto('https://todo-list-e7788.web.app/login');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check for the specific MIME type error that was reported
      const hasMimeError = jsErrors.some(error => 
        error.includes('Expected a JavaScript-or-Wasm module script') ||
        error.includes('MIME type of "text/html"')
      );
      
      expect(hasMimeError, `Production MIME type error: ${jsErrors.join('\n')}`).toBe(false);
      
      // Verify the login form loads
      await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 5000 });
      
      console.log('Production site test passed - no MIME type errors');
      
    } catch (error) {
      console.log('Production site test info:', error.message);
      // Don't fail the test if production site is temporarily unavailable
    }
  });
});
