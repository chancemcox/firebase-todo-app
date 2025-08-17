import { test, expect } from '@playwright/test';

test.describe('Todo App Styling', () => {
  test('should load the main page with proper styling', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page title is displayed
    await expect(page.getByRole('heading', { name: 'Firebase Todo App' })).toBeVisible();
    
    // Check if the main content is loaded
    await expect(page.getByRole('heading', { name: 'My Todos' })).toBeVisible();
    
    // Check if the add todo form is present
    await expect(page.getByRole('heading', { name: 'Add New Todo' })).toBeVisible();
    
    // Check if form inputs are present
    await expect(page.getByLabel('Title *')).toBeVisible();
    await expect(page.getByLabel('Priority')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    
    // Check if the submit button is present
    await expect(page.getByRole('button', { name: 'Add Todo' })).toBeVisible();
  });

  test('should have TailwindCSS classes applied', async ({ page }) => {
    await page.goto('/');
    
    // Check if TailwindCSS classes are being applied
    const header = page.locator('h1');
    await expect(header).toHaveClass(/text-4xl/);
    await expect(header).toHaveClass(/font-bold/);
    await expect(header).toHaveClass(/text-center/);
    await expect(header).toHaveClass(/text-white/);
    
    // Check if the form has styling
    const form = page.locator('form');
    await expect(form).toHaveClass(/bg-white/);
    await expect(form).toHaveClass(/rounded-lg/);
    await expect(form).toHaveClass(/shadow-md/);
    
    // Check if buttons have proper styling
    const addButton = page.getByRole('button', { name: 'Add Todo' });
    await expect(addButton).toHaveClass(/bg-green-500/);
    await expect(addButton).toHaveClass(/text-white/);
    
    // Check if inputs have styling
    const titleInput = page.getByLabel('Title *');
    await expect(titleInput).toHaveClass(/border/);
    await expect(titleInput).toHaveClass(/rounded-md/);
  });

  test('should have proper color scheme and layout', async ({ page }) => {
    await page.goto('/');
    
    // Check if the app has the gradient background
    const app = page.locator('.App');
    await expect(app).toHaveClass(/bg-gradient-to-br/);
    await expect(app).toHaveClass(/from-blue-500/);
    await expect(app).toHaveClass(/via-purple-500/);
    await expect(app).toHaveClass(/to-indigo-600/);
    
    // Check if the header text is white (should be visible on gradient)
    const header = page.locator('h1');
    await expect(header).toHaveClass(/text-white/);
    
    // Check if the main content area has proper spacing
    const main = page.locator('main');
    await expect(main).toHaveClass(/px-8/);
    await expect(main).toHaveClass(/pb-8/);
    await expect(main).toHaveClass(/max-w-6xl/);
    await expect(main).toHaveClass(/mx-auto/);
    
    // Check if the form has proper spacing
    const form = page.locator('form');
    await expect(form).toHaveClass(/mb-8/);
  });

  test('should have responsive design elements', async ({ page }) => {
    await page.goto('/');
    
    // Check if the grid layout is responsive - look for the specific grid div
    const formGrid = page.locator('form > div.grid');
    await expect(formGrid).toHaveClass(/grid/);
    await expect(formGrid).toHaveClass(/md:grid-cols-2/);
    
    // Check if the container has max width
    const container = page.locator('.max-w-4xl');
    await expect(container).toBeVisible();
  });

  test('should have interactive elements with hover states', async ({ page }) => {
    await page.goto('/');
    
    // Check if buttons have hover states
    const addButton = page.getByRole('button', { name: 'Add Todo' });
    await expect(addButton).toHaveClass(/hover:bg-green-600/);
    
    // Check if the add tag button has hover states - be more specific
    const tagButton = page.locator('button[type="button"]:has-text("Add")').first();
    await expect(tagButton).toHaveClass(/hover:bg-blue-600/);
  });

  test('should display todos with proper styling when added', async ({ page }) => {
    await page.goto('/');
    
    // Add a new todo
    await page.getByLabel('Title *').fill('Test Todo');
    await page.getByLabel('Description').fill('This is a test todo');
    await page.getByLabel('Priority').selectOption('high');
    
    // Submit the form
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Wait for the todo to appear - be more specific
    await expect(page.locator('h3:has-text("Test Todo")')).toBeVisible();
    
    // Check if the todo has proper styling
    const todoItem = page.locator('.bg-white.rounded-lg.p-4.shadow-md').first();
    await expect(todoItem).toBeVisible();
    
    // Check if the priority badge has proper styling
    const priorityBadge = page.locator('.bg-red-100.text-red-800').first();
    await expect(priorityBadge).toBeVisible();
    await expect(priorityBadge).toHaveText('high');
  });

  test('should have proper form validation styling', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit without title (should show validation)
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Check if the title input has required styling
    const titleInput = page.getByLabel('Title *');
    await expect(titleInput).toHaveAttribute('required');
    
    // Check if focus states work
    await titleInput.focus();
    await expect(titleInput).toHaveClass(/focus:ring-2/);
    await expect(titleInput).toHaveClass(/focus:ring-blue-500/);
  });
});
