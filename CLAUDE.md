@AGENTS.md

# Project: 0x1f320.sh

Personal website built with Next.js 16 + React 19 + Tailwind CSS 4.

## Tech stack

- **Framework**: Next.js 16 (Turbopack), App Router
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4
- **Linter/Formatter**: Biome (tabs, double quotes)
- **Package manager**: pnpm
- **Path alias**: `@/*` → `./src/*`

## Directory structure

```
src/
├── app/              # Next.js App Router (pages, layouts, globals.css)
├── components/       # UI components
│   └── <name>/       # Complex components get their own directory
│       ├── index.tsx  # Component entry point
│       └── hooks/     # Component-specific hooks
├── fonts/            # Local font files
└── hooks/            # Shared reusable hooks (use-*.ts)
```

## Conventions

- Components with internal hooks or submodules use directory format (`component-name/index.tsx`), simple components use single file (`component-name.tsx`)
- Component-specific hooks live in `components/<name>/hooks/`, reusable hooks live in `src/hooks/`
- Hook files are named `use-<name>.ts` (kebab-case)
- Client components must have `"use client"` directive
- Run `pnpm build` to verify TypeScript and build after changes
