# Pokemon App — Tyradex Pokemons UI (Vite + TypeScript)

Small frontend app ("pokemon-app") to browse a Pokemon dataset (built with Vite + TypeScript). This repository contains the UI, a small in-memory store and utilities, tests driven with Vitest, and a few DOM-driven components (table, chart, modal).

## Quick start

- Prerequisites: `node` (16+ recommended), `pnpm` installed globally.
- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev` (Vite + HMR)
- Build (type-checks then production build): `pnpm build`
- Preview production build: `pnpm preview`
- Run tests: `pnpm test`
- Run tests with coverage: `pnpm run coverage`

## Project structure

- `index.html` — application entry (Vite mounts `#app`)
- `src/` — TypeScript source files
  - `main.ts` — app bootstrap and DOM wiring
  - `pokemons.ts` — API types + `Pokemons.load()` (remote fetch)
  - `pokemonStore.ts` — in-memory store helpers (`setAllPokemons`, `getPokemonById`, `getAllPokemons`)
  - `pokemonTable.ts` — table rendering, sorting, filtering, pagination
  - `pokemonChart.ts` — chart rendering when `pokemons:visible` is emitted
  - `pokemonModal.ts` — modal rendering and evolution lookups
  - `style.css` — styles
- `public/` — static assets served at root (e.g. `/vite.svg`)
- `tests/` — Vitest unit tests

## Developer notes

- TypeScript uses strict mode; the project prefers explicit `./file.ts` imports when modifying code.
- Conventions: `camelCase` for functions/vars, `PascalCase` for types/classes.
- Use `pnpm build` locally before opening PRs to surface TypeScript issues.

## Useful DOM hooks & events

Components in this app expose DOM hooks and dispatch events to keep things decoupled.

- Table / filters / pagination
  - Table: `#pokemons-table`
  - Table body: `#pokemons-body`
  - Search input: `#search-name`, clear button: `#search-clear`
  - Generation select: `#filter-gen`
  - Sort buttons: `#sort-name`, `#sort-category`, `#sort-hp`, `#sort-atk`, `#sort-def`, `#sort-spa`, `#sort-spd`, `#sort-vit`
  - Pagination: `#page-prev`, `#page-next`, page info: `#page-info`

- Events
  - `pokemon:show` — dispatched with `detail = pokemon` to open the modal
  - `pokemons:visible` — dispatched with `detail = visibleList` when the table renders a page (used by chart)

- Modal / Chart
  - Modal renders radar inside a `div.modal-stats` and exposes img click handlers to navigate evolutions
  - Chart listens to `pokemons:visible` and renders an SVG polyline + clickable images which dispatch `pokemon:show`

## Store API

Use the helpers from `src/pokemonStore.ts` when you need cached data:

- `setAllPokemons(list: Pokemon[])` — set the store
- `getAllPokemons(): Pokemon[]` — get all cached pokemons
- `getPokemonById(id: number): Pokemon | undefined` — lookup by pokedex id

## Data source / API

- The app (via `Pokemons.load()`) fetches data from `https://tyradex.app/api/v1/pokemon`.
- Network calls should be treated as untrusted — do not inject raw HTML from API responses into the DOM.

## Testing

- Tests are written using Vitest and live in the `tests/` folder.
- Run unit tests: `pnpm test`.
- Coverage: `pnpm run coverage` (v8 collector in this project).

## Commits & PRs

- Use Conventional Commits (e.g. `feat:`, `fix:`, `test:`) for clarity.
- Keep PRs focused and small; run `pnpm build` and tests before opening a PR.

## Security & environment

- Client-exposed env vars for Vite must be prefixed with `VITE_`.
- Do not commit `.env*` files.

---

This README is a starting point — we can expand command examples, architecture diagrams, or developer onboarding steps next. If you want, I can also open a PR for this file.
