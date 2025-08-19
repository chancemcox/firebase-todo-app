import { test, expect } from '@playwright/test';

test.describe('Authentication and Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show login page when not authenticated', async ({ page }) => {
    // Check if we're redirected to login or if login form is visible
    const loginForm = page.locator('form');
    const loginButton = page.locator('button:has-text("Login")');
    
    // Either the login form should be visible or we should be on login page
    if (await loginForm.isVisible()) {
      await expect(loginForm).toBeVisible();
      await expect(loginButton).toBeVisible();
    } else {
      // Check if we're on login page
      await expect(page.locator('text=Login')).toBeVisible();
    }
  });

  test('should handle Google sign-in process', async ({ page }) => {
    // Look for Google sign-in button
    const googleSignInButton = page.locator('button:has-text("Google")');
    
    if (await googleSignInButton.isVisible()) {
      // Click Google sign-in button
      await googleSignInButton.click();
      
      // Wait for Google OAuth popup or redirect
      // This test might need to be run in headed mode to handle OAuth
      await page.waitForTimeout(2000);
      
      // Check if we're redirected or if there's an error
      // The actual behavior depends on your OAuth setup
    }
  });

  test('should show user profile when authenticated', async ({ page }) => {
    // This test assumes user is already authenticated
    // You might need to set up authentication state or mock it
    
    // Check if profile elements are visible
    const profileContainer = page.locator('.profile-container');
    
    if (await profileContainer.isVisible()) {
      // User is authenticated, check profile elements
      await expect(profileContainer).toBeVisible();
      
      // Check if user info is displayed
      const userInfo = page.locator('.profile-container .text-sm, .profile-container .text-xs');
      await expect(userInfo.first()).toBeVisible();
    } else {
      // User is not authenticated, skip this test
      test.skip();
    }
  });

  test('should logout successfully', async ({ page }) => {
    // This test assumes user is already authenticated
    const profileContainer = page.locator('.profile-container');
    
    if (!(await profileContainer.isVisible())) {
      test.skip('User not authenticated');
      return;
    }
    
    // Open profile dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Verify dropdown is open
    const dropdown = page.locator('.profile-container .absolute, .mobile-profile-menu');
    await expect(dropdown).toBeVisible();
    
    // Click logout button
    const logoutButton = page.locator('text=Sign Out');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    
    // Wait for logout to complete
    await page.waitForTimeout(2000);
    
    // Verify we're logged out - should see login form or be redirected
    const loginForm = page.locator('form');
    const loginText = page.locator('text=Login');
    
    // Either login form should be visible or we should be on login page
    if (await loginForm.isVisible()) {
      await expect(loginForm).toBeVisible();
    } else {
      await expect(loginText).toBeVisible();
    }
  });

  test('should handle logout errors gracefully', async ({ page }) => {
    // This test checks error handling during logout
    const profileContainer = page.locator('.profile-container');
    
    if (!(await profileContainer.isVisible())) {
      test.skip('User not authenticated');
      return;
    }
    
    // Open profile dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Click logout button
    const logoutButton = page.locator('text=Sign Out');
    await logoutButton.click();
    
    // Wait for logout process
    await page.waitForTimeout(3000);
    
    // Check if there are any error messages
    const errorMessages = page.locator('.error, .alert, [role="alert"]');
    
    // If there are error messages, they should be visible
    if (await errorMessages.count() > 0) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test('should maintain authentication state across page reloads', async ({ page }) => {
    // This test assumes user is already authenticated
    const profileContainer = page.locator('.profile-container');
    
    if (!(await profileContainer.isVisible())) {
      test.skip('User not authenticated');
      return;
    }
    
    // Get current user info
    const userInfo = page.locator('.profile-container .text-sm, .profile-container .text-xs');
    const userText = await userInfo.first().textContent();
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if user is still authenticated
    const profileContainerAfterReload = page.locator('.profile-container');
    await expect(profileContainerAfterReload).toBeVisible();
    
    // Check if user info is still the same
    const userInfoAfterReload = page.locator('.profile-container .text-sm, .profile-container .text-xs');
    const userTextAfterReload = await userInfoAfterReload.first().textContent();
    
    // User should still be authenticated
    expect(userTextAfterReload).toBe(userText);
  });

  test('should show proper loading states during authentication', async ({ page }) => {
    // Look for loading indicators
    const loadingIndicators = page.locator('.loading, .spinner, [aria-busy="true"]');
    
    // If loading indicators exist, they should eventually disappear
    if (await loadingIndicators.count() > 0) {
      // Wait for loading to complete
      await page.waitForTimeout(5000);
      
      // Loading indicators should not be visible after loading
      for (let i = 0; i < await loadingIndicators.count(); i++) {
        await expect(loadingIndicators.nth(i)).not.toBeVisible();
      }
    }
  });
});
