import { test, expect } from '@playwright/test';

test.describe('Navigation Dropdown and Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the deployed app
    await page.goto('https://todo-list-e7788.web.app');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should open profile dropdown on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for the profile button to be visible
    const profileButton = page.locator('.profile-container button').first();
    await expect(profileButton).toBeVisible();
    
    // Click the profile button to open dropdown
    await profileButton.click();
    
    // Check if dropdown is visible
    const dropdown = page.locator('.mobile-profile-menu');
    await expect(dropdown).toBeVisible();
    
    // Verify dropdown content
    await expect(page.locator('text=View Profile')).toBeVisible();
    await expect(page.locator('text=My Todos')).toBeVisible();
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should open profile dropdown on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Wait for the profile button to be visible
    const profileButton = page.locator('.profile-container button').first();
    await expect(profileButton).toBeVisible();
    
    // Click the profile button to open dropdown
    await profileButton.click();
    
    // Check if dropdown is visible
    const dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).toBeVisible();
    
    // Verify dropdown content
    await expect(page.locator('text=View Profile')).toBeVisible();
    await expect(page.locator('text=My Todos')).toBeVisible();
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Open dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Verify dropdown is open
    const dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).toBeVisible();
    
    // Click outside the dropdown (on the header)
    await page.locator('h1:has-text("Todo App")').click();
    
    // Verify dropdown is closed
    await expect(dropdown).not.toBeVisible();
  });

  test('should navigate to profile section from dropdown', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Open dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Click "View Profile" button
    await page.locator('text=View Profile').click();
    
    // Verify dropdown is closed
    const dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).not.toBeVisible();
    
    // Verify we're on profile section (this depends on your app's navigation)
    // You might need to adjust this based on how your app shows the active section
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('should navigate to todos section from dropdown', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Open dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Click "My Todos" button
    await page.locator('text=My Todos').click();
    
    // Verify dropdown is closed
    const dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).not.toBeVisible();
    
    // Verify we're on todos section
    await expect(page.locator('text=My Todos')).toBeVisible();
  });

  test('should show user information in dropdown', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Open dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Check if user email is displayed (assuming user is logged in)
    const userEmail = page.locator('.profile-container .text-xs.text-gray-500');
    await expect(userEmail).toBeVisible();
    
    // Check if user name or initials are displayed
    const userName = page.locator('.profile-container .text-sm.font-medium');
    await expect(userName).toBeVisible();
  });

  test('should handle logout process', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Open dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Click "Sign Out" button
    await page.locator('text=Sign Out').click();
    
    // Verify dropdown is closed
    const dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).not.toBeVisible();
    
    // Wait for logout to complete and redirect to login page
    // This depends on your app's logout flow
    await page.waitForURL('**/login**', { timeout: 10000 });
    
    // Verify we're on the login page
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should show profile picture or initials', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Check if profile picture or initials are visible
    const profilePicture = page.locator('.profile-picture');
    await expect(profilePicture).toBeVisible();
  });

  test('should handle dropdown on different screen sizes', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    let profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    let dropdown = page.locator('.mobile-profile-menu');
    await expect(dropdown).toBeVisible();
    await profileButton.click(); // Close dropdown
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).toBeVisible();
    await profileButton.click(); // Close dropdown
    
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).toBeVisible();
  });

  test('should maintain dropdown state during navigation', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Open dropdown
    const profileButton = page.locator('.profile-container button').first();
    await profileButton.click();
    
    // Verify dropdown is open
    const dropdown = page.locator('.profile-container .absolute');
    await expect(dropdown).toBeVisible();
    
    // Navigate to a different section using the main navigation
    await page.locator('text=Profile').click();
    
    // Verify dropdown is still open (if it should persist)
    // This depends on your app's behavior
    await expect(dropdown).toBeVisible();
  });
});
