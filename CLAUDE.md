@AGENTS.md

# Project: 0x1f320.sh

Personal website built with Next.js 16 + React 19 + Tailwind CSS 4.

## Tech stack

- **Framework**: Next.js 16 (Turbopack), App Router
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl (ko default, en)
- **Linter/Formatter**: Biome (tabs, double quotes)
- **Package manager**: pnpm
- **Content**: velite (MDX compilation, schema validation, dev watch)
- **Comments**: giscus (GitHub Discussions)
- **Path alias**: `@/*` → `./src/*`

## Directory structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout (html, fonts, theme script)
│   ├── globals.css
│   └── [locale]/         # Locale-based routing
│       ├── layout.tsx    # NextIntlClientProvider, locale validation
│       ├── page.tsx
│       └── ...
├── i18n/                 # next-intl configuration
│   ├── routing.ts        # defineRouting (locales, defaultLocale)
│   ├── request.ts        # getRequestConfig (message loading)
│   └── navigation.ts     # Locale-aware Link, useRouter, etc.
├── components/
│   └── <name>/
│       ├── index.tsx
│       └── hooks/
├── fonts/
├── hooks/                # Shared reusable hooks (use-*.ts)
├── lib/
│   ├── blog.ts           # Blog data access (imports from velite output)
│   └── date.ts           # Date formatting utilities
└── proxy.ts              # next-intl middleware (locale detection)
content/
└── blog/                 # MDX blog posts ({slug}.{locale}.mdx)
locales/
├── ko.json               # Korean translations (default)
└── en.json               # English translations
generated/
└── content/              # velite output (gitignored, auto-generated)
```

## i18n

- **All user-facing text MUST be added to both `locales/ko.json` and `locales/en.json`.** Never hardcode strings directly in components.
- Use `getTranslations` in Server Components, `useTranslations` in Client Components
- Use `Link` from `@/i18n/navigation` for locale-aware navigation (not `next/link`)
- Default locale (ko) has no URL prefix (`/`), English is at `/en`

## Conventions

- Components with internal hooks or submodules use directory format (`component-name/index.tsx`), simple components use single file (`component-name.tsx`)
- Component-specific hooks live in `components/<name>/hooks/`, reusable hooks live in `src/hooks/`
- Hook files are named `use-<name>.ts` (kebab-case)
- Client components must have `"use client"` directive
- Run `pnpm build` to verify TypeScript and build after changes (this runs `velite && next build`)

## Blog

- Blog posts live in `content/blog/{slug}.{locale}.mdx` (e.g., `hello-world.ko.mdx`, `hello-world.en.mdx`)
- Frontmatter fields: `title`, `date` (YYYY-MM-DD), `description` (optional)
- velite compiles MDX at build time with `remark-gfm` (tables, strikethrough) and `rehype-pretty-code` (syntax highlighting with dual light/dark themes)
- `MDXContent` client component renders velite's compiled function-body MDX output
- Reading time is auto-calculated by velite's `s.metadata()`
- In dev, `velite --watch` recompiles on MDX changes → `generated/content/posts.json` updates → Turbopack picks it up
- Code blocks use `shiki` with CSS variables (`--shiki-light`/`--shiki-dark`) for theme switching

## Theme

- Dark/light mode via `.dark` class on `<html>`, toggled by `useTheme()` hook
- Theme script in `<head>` prevents FOUC by reading localStorage before paint
- `color-scheme: dark` on `.dark` class ensures native UI (scrollbars) follows theme
- giscus comments sync theme via `@giscus/react` props — component waits for hydration (`mounted` state) before rendering to avoid incorrect initial theme
