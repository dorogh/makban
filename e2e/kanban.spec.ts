import { test, expect } from '@playwright/test';

test.describe('Makban Kanban App', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load with example data', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page.getByRole('heading', { name: 'Makban Project Board' })).toBeVisible();
    
    // Check buckets exist
    await expect(page.getByText('Todo', { exact: true })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();
    await expect(page.getByText('Backlog', { exact: true })).toBeVisible();
    
    // Check cards exist
    await expect(page.getByText('Convert markdown to board')).toBeVisible();
    await expect(page.getByText('Install packages')).toBeVisible();
    await expect(page.getByText('Create project')).toBeVisible();
  });

  test('should toggle between kanban and markdown view', async ({ page }) => {
    await page.goto('/');
    
    // Should start in kanban view
    await expect(page.getByText('Todo', { exact: true })).toBeVisible();
    
    // Click toggle to markdown view
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    
    // Should show markdown textarea
    const textarea = page.getByRole('textbox');
    await expect(textarea).toBeVisible();
    const content = await textarea.inputValue();
    expect(content).toContain('# Makban Project Board');
    expect(content).toContain('## Todo');
    
    // Click toggle back to kanban view
    await page.getByRole('button', { name: /switch to kanban/i }).click();
    
    // Should show kanban again
    await expect(page.getByText('Todo', { exact: true })).toBeVisible();
  });

  test('should edit markdown in markdown view', async ({ page }) => {
    await page.goto('/');
    
    // Switch to markdown view
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    
    // Edit markdown
    const textarea = page.getByRole('textbox');
    await textarea.fill('# My Custom Board\n\n## Bucket A\n- [ ] Task 1\n\n## Bucket B\n- [ ] Task 2');
    
    // Switch back to kanban view
    await page.getByRole('button', { name: /switch to kanban/i }).click();
    
    // Verify changes
    await expect(page.getByRole('heading', { name: 'My Custom Board' })).toBeVisible();
    await expect(page.getByText('Bucket A')).toBeVisible();
    await expect(page.getByText('Bucket B')).toBeVisible();
    await expect(page.getByText('Task 1')).toBeVisible();
    await expect(page.getByText('Task 2')).toBeVisible();
  });

  test('should edit card label', async ({ page }) => {
    await page.goto('/');
    
    // Find the first edit button and click it
    const firstCard = page.locator('text=Convert markdown to board').first();
    const editButton = firstCard.locator('..').getByRole('button').last();
    await editButton.click();
    
    // Edit the label
    const input = page.getByRole('textbox').first();
    await input.fill('Updated task label');
    
    // Save the edit
    await page.keyboard.press('Enter');
    
    // Verify the change
    await expect(page.getByText('Updated task label')).toBeVisible();
    
    // Verify it persists in markdown view
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    const textarea = page.getByRole('textbox');
    const content = await textarea.inputValue();
    expect(content).toContain('Updated task label');
  });

  test('should reset to example markdown', async ({ page }) => {
    await page.goto('/');
    
    // Modify the markdown
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    const textarea = page.getByRole('textbox');
    await textarea.fill('# Custom\n\n## Test\n- [ ] Item');
    
    // Click reset button
    await page.getByRole('button', { name: /switch to kanban/i }).click();
    
    // Confirm dialog will appear
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /reset/i }).click();
    
    await page.waitForTimeout(500);
    
    // Verify reset to example
    await expect(page.getByRole('heading', { name: 'Makban Project Board' })).toBeVisible();
    await expect(page.getByText('Todo', { exact: true })).toBeVisible();
    await expect(page.getByText('Convert markdown to board')).toBeVisible();
  });

  test('should persist data in localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Edit markdown
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    const textarea = page.getByRole('textbox');
    await textarea.fill('# Persistent Data\n\n## Test\n- [ ] Persist this');
    
    // Reload page
    await page.reload();
    
    // Verify data persisted
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    const content = await page.getByRole('textbox').inputValue();
    expect(content).toContain('# Persistent Data');
    expect(content).toContain('Persist this');
  });

  test('should export markdown file', async ({ page }) => {
    await page.goto('/');
    
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.getByRole('button', { name: /export/i }).click();
    
    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.md$/);
  });

  // Note: Drag and drop tests are commented out as Playwright's dragTo()
  // doesn't work well with dnd-kit's pointer sensors.
  // Drag and drop functionality is tested via unit tests.
  
  test.skip('should drag and drop card between buckets', async () => {
    // This test requires manual verification or a different testing approach
    // The moveItemInMarkdown function is tested in unit tests
  });
});
