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

  test('should drag and drop card between buckets', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Find the card to drag (Install packages in "In Progress")
    const cardToDrag = page.getByText('Install packages').first();
    
    // Find the Done bucket header
    const doneBucket = page.locator('text=Done').first();
    
    // Perform drag and drop
    await cardToDrag.dragTo(doneBucket);
    
    await page.waitForTimeout(500);
    
    // Verify the card moved to Done bucket
    // We check this by verifying Install packages is near the Done header
    const doneSection = page.locator('text=Done').locator('../..');
    await expect(doneSection.getByText('Install packages')).toBeVisible();
    
    // Verify it's checked (Done bucket auto-checks items)
    const checkbox = doneSection.locator('input[type="checkbox"]').last();
    await expect(checkbox).toBeChecked();
    
    // Verify in markdown view
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    const textarea = page.getByRole('textbox');
    const content = await textarea.inputValue();
    
    // Should have Install packages under Done section and checked
    expect(content).toContain('## Done');
    const doneSection2 = content.split('## Done')[1].split('##')[0];
    expect(doneSection2).toContain('[x] Install packages');
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

  test('should drag card to non-Done bucket and uncheck it', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // First, move Create project (which is checked) from Done to Todo
    const cardToDrag = page.getByText('Create project').first();
    const todoBucket = page.locator('text=Todo').first();
    
    await cardToDrag.dragTo(todoBucket);
    await page.waitForTimeout(500);
    
    // Verify it's now in Todo and unchecked
    const todoSection = page.locator('text=Todo').locator('../..');
    await expect(todoSection.getByText('Create project')).toBeVisible();
    
    const checkbox = todoSection.locator('input[type="checkbox"]').last();
    await expect(checkbox).not.toBeChecked();
    
    // Verify in markdown
    await page.getByRole('button', { name: /switch to markdown/i }).click();
    const content = await page.getByRole('textbox').inputValue();
    const todoSectionText = content.split('## Todo')[1].split('##')[0];
    expect(todoSectionText).toContain('[ ] Create project');
  });
});
