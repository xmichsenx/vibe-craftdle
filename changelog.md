# Changelog

All notable changes to the Craftdle project are documented in this file.

---

## [0.0.2] - 2026-02-24

### Changed
- Data source updated from HTML scraping to **minecraft.wiki MediaWiki API** (`https://minecraft.wiki/api.php`).
- Build-time scripts renamed from `scrape-*.ts` to `fetch-*.ts`.
- Data collection section rewritten with API endpoints, actions, and batch query approach.

---

## [0.0.1] - 2026-02-24

### Added
- Initial `model_instructions.md` created with full project plan.
- 4 game modes defined: Classic, Crafting Grid, Texture Close-up, Sound.
- Tech stack: React + Node.js (TypeScript), Tailwind CSS, Jest, Vite.
- Data model schemas for items, mobs, biomes, recipes, and sounds.
- API endpoint definitions for all game modes.
- Project folder structure.
- Implementation order (10 steps).
