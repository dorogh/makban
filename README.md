# Makban

Kanban in markdown, markdown is kanban. A backend-hosted Kanban board app where the board state is a GitHub Flavored Markdown (GFM) file.

## Features

- **Markdown-based Kanban**: Your kanban board IS a markdown file with H2 sections as buckets and checkbox list items as cards
- **Dual View**: Toggle between Kanban board view and markdown editor view
- **Drag and Drop**: Move cards between buckets with intuitive drag and drop
- **Smart Checkboxes**: Items automatically check when moved to "Done" bucket, uncheck when moved elsewhere
- **Card Editing**: Click edit icon to rename any card
- **Local Storage**: All data persists in browser's localStorage
- **Import/Export**: Download your board as markdown or import existing markdown files
- **Reset**: Quickly reset to example board

## Tech Stack

### Backend
- **Fastify** - Fast and low overhead web framework
- **TypeScript** (strict mode)

### Frontend
- **TypeScript** (strict mode with ESLint)
- **React 19** with Vite 7
- **Tailwind CSS v4**
- **shadcn/ui** components
- **dnd-kit** for drag and drop
- **Zustand** for state management
- **Lucide React** for icons

### Testing
- **Vitest** for unit tests
- **Playwright** for E2E tests

## Project Structure

```
/src
  /backend     - Fastify server that serves the frontend
  /frontend    - React application
/dist
  /backend     - Compiled backend server
  /public      - Built frontend assets
```

## Getting Started

```bash
# Install dependencies
npm install

# Development (frontend only - recommended for development)
npm run dev

# Development (with backend)
npm run dev:backend

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run lint        # Linter
```

The production server runs on port 3000 by default (configurable via PORT environment variable).

## Markdown Format

The app uses standard GFM markdown:

```md
# Project Board Title

## Todo
- [ ] Task 1
- [ ] Task 2

## In Progress
- [ ] Task 3

## Done
- [x] Completed task

## Backlog
- [ ] Future task
```

- H1 (`# Title`) becomes the board title
- H2 (`## Section`) becomes a bucket/column
- Checkbox list items (`- [ ] Task`) become cards
- Other markdown content is preserved but not displayed in Kanban view

## Testing

- **Unit Tests**: 13 tests covering markdown parsing, generation, and manipulation
- **E2E Tests**: 7 tests covering UI interactions, persistence, and workflows
- **Test Coverage**: Core business logic (markdown manipulation) is fully tested

Note: Drag and drop E2E test is skipped as Playwright's `dragTo()` doesn't work well with dnd-kit's pointer sensors. The underlying move functionality is thoroughly tested in unit tests.

## License

MIT
