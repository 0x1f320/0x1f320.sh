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
└── proxy.ts              # next-intl middleware (locale detection)
locales/
├── ko.json               # Korean translations (default)
└── en.json               # English translations
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
- Run `pnpm build` to verify TypeScript and build after changes
