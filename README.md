# Vandana Worship App

A bilingual worship lyrics app designed for Hindi-speaking Christian communities. The product is built to make songs readable, searchable, and usable across generations, with support for both Hinglish and Hindi script in a mobile-first, installable experience.

## Highlights

- Dual-script lyrics experience for Hinglish and Hindi readers
- Mobile-first interface with installable app behavior
- Dark, cinematic presentation built for focused worship use
- Supabase-backed data access and app services

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PWA-friendly frontend patterns

## Project structure

- `src/app/` - app routes and page-level composition
- `src/components/` - reusable UI building blocks
- `src/contexts/` - shared app state and providers
- `src/data/` - song and content-oriented data sources
- `src/lib/` - utilities and integration helpers
- `public/` - icons, static assets, and app metadata
- `scripts/` - supporting scripts and maintenance utilities

## Local development

1. Install dependencies with `npm install`.
2. Add the required Supabase values to `.env.local`.
3. Run `npm run dev`.
4. Use `npm run build` and `npm run start` for a production check.

## Notes

- Current local package version is `1.9.1`.
- The repo includes audit and build artifacts that help document quality and release readiness.
