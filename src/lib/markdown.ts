export interface MarkdownItem {
  label: string;
  checked: boolean;
  originalLine: string;
}

export interface MarkdownBucket {
  name: string;
  items: MarkdownItem[];
}

export interface ParsedMarkdown {
  title: string;
  buckets: MarkdownBucket[];
  rawContent: string;
}

/**
 * Parse markdown content into buckets and items
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const lines = content.split('\n');
  const buckets: MarkdownBucket[] = [];
  let title = '';
  let currentBucket: MarkdownBucket | null = null;

  for (const line of lines) {
    // Match H1 for title
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match && !title) {
      title = h1Match[1].trim();
      continue;
    }

    // Match H2 for bucket names
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (currentBucket) {
        buckets.push(currentBucket);
      }
      currentBucket = {
        name: h2Match[1].trim(),
        items: []
      };
      continue;
    }

    // Match checkbox list items
    const itemMatch = line.match(/^-\s+\[([ x])\]\s+(.+)$/);
    if (itemMatch && currentBucket) {
      currentBucket.items.push({
        label: itemMatch[2].trim(),
        checked: itemMatch[1] === 'x',
        originalLine: line
      });
    }
  }

  // Push the last bucket
  if (currentBucket) {
    buckets.push(currentBucket);
  }

  return {
    title: title || 'Untitled',
    buckets,
    rawContent: content
  };
}

/**
 * Generate markdown from buckets
 */
export function generateMarkdown(title: string, buckets: MarkdownBucket[]): string {
  let markdown = `# ${title}\n\n`;

  for (const bucket of buckets) {
    markdown += `## ${bucket.name}\n`;
    for (const item of bucket.items) {
      const checkbox = item.checked ? '[x]' : '[ ]';
      markdown += `- ${checkbox} ${item.label}\n`;
    }
    markdown += '\n';
  }

  return markdown.trim();
}

/**
 * Update a specific item in the markdown content
 */
export function updateMarkdownItem(
  content: string,
  bucketName: string,
  oldLabel: string,
  newLabel: string,
  newChecked?: boolean
): string {
  const lines = content.split('\n');
  let inTargetBucket = false;
  let updated = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're entering the target bucket
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      inTargetBucket = h2Match[1].trim() === bucketName;
      continue;
    }

    // If we're in the target bucket, look for the item
    if (inTargetBucket) {
      const itemMatch = line.match(/^-\s+\[([ x])\]\s+(.+)$/);
      if (itemMatch && itemMatch[2].trim() === oldLabel) {
        const checkbox = newChecked !== undefined 
          ? (newChecked ? '[x]' : '[ ]')
          : `[${itemMatch[1]}]`;
        lines[i] = `- ${checkbox} ${newLabel}`;
        updated = true;
        break;
      }
    }
  }

  return updated ? lines.join('\n') : content;
}

/**
 * Move an item from one bucket to another
 */
export function moveItemInMarkdown(
  content: string,
  fromBucket: string,
  toBucket: string,
  itemLabel: string,
  autoCheck?: boolean
): string {
  const lines = content.split('\n');
  let currentBucket = '';
  let itemToMove: { line: string; index: number } | null = null;
  let targetBucketIndex = -1;

  // First pass: find and remove the item
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      currentBucket = h2Match[1].trim();
      if (currentBucket === toBucket) {
        targetBucketIndex = i;
      }
      continue;
    }

    if (currentBucket === fromBucket) {
      const itemMatch = line.match(/^-\s+\[([ x])\]\s+(.+)$/);
      if (itemMatch && itemMatch[2].trim() === itemLabel) {
        itemToMove = { line, index: i };
        lines.splice(i, 1);
        break;
      }
    }
  }

  if (!itemToMove || targetBucketIndex === -1) {
    return content;
  }

  // Determine if we should check/uncheck based on the "Done" bucket rule
  let shouldCheck = false;
  if (autoCheck !== undefined) {
    shouldCheck = autoCheck;
  } else {
    shouldCheck = toBucket.toLowerCase().includes('done');
  }

  // Update the checkbox state
  const updatedLine = itemToMove.line.replace(
    /^-\s+\[([ x])\]/,
    `- [${shouldCheck ? 'x' : ' '}]`
  );

  // Find the insertion point (after the last item in target bucket or after bucket header)
  let insertIndex = targetBucketIndex + 1;
  for (let i = targetBucketIndex + 1; i < lines.length; i++) {
    if (lines[i].match(/^##\s+/)) {
      break;
    }
    if (lines[i].trim() !== '') {
      insertIndex = i + 1;
    }
  }

  lines.splice(insertIndex, 0, updatedLine);

  return lines.join('\n');
}

/**
 * Create a default example markdown
 */
export function createExampleMarkdown(projectName: string = 'Makban Project Board'): string {
  return `# ${projectName}

## Todo
- [ ] Convert markdown to board and vice versa

## In Progress
- [ ] Install packages

## Done
- [x] Create project

## Backlog
- [ ] Render board
- [ ] Implement drag and drop
- [ ] Reflect kanban changes in markdown file`;
}
