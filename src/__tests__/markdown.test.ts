import { describe, it, expect } from 'vitest';
import {
  parseMarkdown,
  generateMarkdown,
  updateMarkdownItem,
  moveItemInMarkdown,
  createExampleMarkdown,
} from '../lib/markdown';

describe('markdown parser', () => {
  it('should parse markdown with title, sections, and items', () => {
    const markdown = `# My Board

## Todo
- [ ] Task 1
- [ ] Task 2

## Done
- [x] Completed Task`;

    const result = parseMarkdown(markdown);

    expect(result.title).toBe('My Board');
    expect(result.buckets).toHaveLength(2);
    expect(result.buckets[0].name).toBe('Todo');
    expect(result.buckets[0].items).toHaveLength(2);
    expect(result.buckets[0].items[0].label).toBe('Task 1');
    expect(result.buckets[0].items[0].checked).toBe(false);
    expect(result.buckets[1].name).toBe('Done');
    expect(result.buckets[1].items[0].checked).toBe(true);
  });

  it('should handle markdown with no title', () => {
    const markdown = `## Section 1
- [ ] Item`;

    const result = parseMarkdown(markdown);

    expect(result.title).toBe('Untitled');
    expect(result.buckets).toHaveLength(1);
  });

  it('should ignore non-checkbox list items', () => {
    const markdown = `## Todo
- [ ] Task
- Regular list item
* Another regular item`;

    const result = parseMarkdown(markdown);

    expect(result.buckets[0].items).toHaveLength(1);
    expect(result.buckets[0].items[0].label).toBe('Task');
  });
});

describe('generateMarkdown', () => {
  it('should generate markdown from buckets', () => {
    const result = generateMarkdown('Test Board', [
      {
        name: 'Todo',
        items: [{ label: 'Task 1', checked: false, originalLine: '' }],
      },
      {
        name: 'Done',
        items: [{ label: 'Task 2', checked: true, originalLine: '' }],
      },
    ]);

    expect(result).toContain('# Test Board');
    expect(result).toContain('## Todo');
    expect(result).toContain('- [ ] Task 1');
    expect(result).toContain('## Done');
    expect(result).toContain('- [x] Task 2');
  });
});

describe('updateMarkdownItem', () => {
  it('should update item label', () => {
    const markdown = `# Board

## Todo
- [ ] Old Label

## Done
- [x] Task`;

    const result = updateMarkdownItem(markdown, 'Todo', 'Old Label', 'New Label');

    expect(result).toContain('- [ ] New Label');
    expect(result).not.toContain('Old Label');
  });

  it('should update checkbox state', () => {
    const markdown = `# Board

## Todo
- [ ] Task

## Done
- [x] Completed`;

    const result = updateMarkdownItem(markdown, 'Todo', 'Task', 'Task', true);

    expect(result).toContain('- [x] Task');
  });

  it('should not modify other items', () => {
    const markdown = `# Board

## Todo
- [ ] Task 1
- [ ] Task 2`;

    const result = updateMarkdownItem(markdown, 'Todo', 'Task 1', 'Updated Task 1');

    expect(result).toContain('Updated Task 1');
    expect(result).toContain('Task 2');
  });
});

describe('moveItemInMarkdown', () => {
  it('should move item between buckets', () => {
    const markdown = `# Board

## Todo
- [ ] Task to move
- [ ] Other task

## Done
- [x] Completed`;

    const result = moveItemInMarkdown(markdown, 'Todo', 'Done', 'Task to move');

    expect(result).not.toContain('## Todo\n- [ ] Task to move');
    expect(result).toContain('## Done');
    expect(result).toContain('[x] Task to move'); // Auto-checked because moved to Done
  });

  it('should auto-check when moving to Done bucket', () => {
    const markdown = `# Board

## Todo
- [ ] Task

## Done
- [x] Other`;

    const result = moveItemInMarkdown(markdown, 'Todo', 'Done', 'Task');

    expect(result).toContain('- [x] Task');
  });

  it('should not auto-check when moving to non-Done bucket', () => {
    const markdown = `# Board

## Done
- [x] Task

## Todo`;

    const result = moveItemInMarkdown(markdown, 'Done', 'Todo', 'Task', false);

    expect(result).toContain('## Todo');
    expect(result).toContain('- [ ] Task');
  });

  it('should handle Done-like bucket names case-insensitively', () => {
    const markdown = `# Board

## Todo
- [ ] Task

## DONE`;

    const result = moveItemInMarkdown(markdown, 'Todo', 'DONE', 'Task');

    expect(result).toContain('- [x] Task');
  });
});

describe('createExampleMarkdown', () => {
  it('should create example with default project name', () => {
    const result = createExampleMarkdown();

    expect(result).toContain('# Makban Project Board');
    expect(result).toContain('## Todo');
    expect(result).toContain('## In Progress');
    expect(result).toContain('## Done');
    expect(result).toContain('## Backlog');
  });

  it('should create example with custom project name', () => {
    const result = createExampleMarkdown('My Custom Project');

    expect(result).toContain('# My Custom Project');
  });
});
