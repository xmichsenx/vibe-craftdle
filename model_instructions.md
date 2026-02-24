# Craftdle — Model Instructions & Project Plan

## Overview

**Craftdle** is a Minecraft-themed guessing game inspired by [Loldle](https://loldle.net). Players try to identify Minecraft items, blocks, mobs, or biomes through various game modes. The game is free-play (unlimited rounds, no daily limit) and fully anonymous (no accounts or login). Data is sourced from [minecraft.wiki](https://minecraft.wiki) at build time.

---

## Tech Stack

| Layer       | Technology                                            |
| ----------- | ----------------------------------------------------- |
| Frontend    | React + TypeScript                                    |
| Backend     | Node.js + Express + TypeScript                        |
| Styling     | Tailwind CSS                                          |
| Data Store  | JSON files / in-memory                                |
| Testing     | Jest (unit/integration) for both frontend and backend |
| Build Tool  | Vite (frontend), ts-node / tsc (backend)              |
| Data Source | minecraft.wiki API (MediaWiki API) at build time      |

---

## Minecraft Version Scope

- **Latest stable release only (1.21+)**
- Only items, blocks, mobs, biomes, recipes, textures, and sounds present in the current version are included.

---

## Game Modes

### 1. Classic Mode

**Concept:** The player guesses an item, block, or mob. After each guess, the game shows feedback across multiple attribute columns indicating whether each attribute **matches** or **doesn't match** the target answer.

**Subject Pool:** Items, Blocks, and Mobs.

**Feedback Attributes (columns):**

| Attribute       | Description                                | Values                                        |
| --------------- | ------------------------------------------ | --------------------------------------------- |
| Type / Category | What kind of entity it is                  | Block, Item, Tool, Weapon, Armor, Food, Mob   |
| Dimension       | Where it is primarily found                | Overworld, Nether, End (can be multiple)      |
| Behavior        | Mob behavior (only for mobs)               | Hostile, Passive, Neutral, N/A (for non-mobs) |
| Stackable       | Whether it can stack in inventory          | Yes / No                                      |
| Renewable       | Whether it can be obtained infinitely      | Yes / No                                      |
| Version Added   | The Minecraft version it was introduced in | e.g., "1.0", "1.19", "1.21"                   |

**Feedback Style:** Simple match (green) / no-match (red) per attribute. No directional arrows.

**Guess Limit:** Configurable by the user before starting a round. Options: unlimited, or a specific number (e.g., 5, 10, 15, 20).

---

### 2. Crafting Grid Mode

**Concept:** The player must identify a craftable item from its crafting recipe. The 3×3 crafting grid is shown with all ingredient slots **hidden**. One ingredient is revealed after each wrong guess (progressive reveal).

**Subject Pool:** All craftable items and blocks that have a crafting recipe.

**Mechanics:**

- A 3×3 grid is displayed with 9 slots, all hidden initially.
- After each wrong guess, one random hidden slot is revealed (showing the ingredient texture or "empty" if the slot is unused).
- The output item is NOT shown — the player must deduce it from revealed ingredients.
- The player types their guess from an autocomplete search.

**Guess Limit:** Configurable by the user (like Classic mode).

---

### 3. Texture Close-up Mode

**Concept:** The player sees a small, zoomed-in crop of a block or item's 16×16 texture. After each wrong guess, the view zooms out to reveal more of the texture.

**Subject Pool:** Items and Blocks (anything with a texture sprite).

**Mechanics:**

- Start by showing a randomly positioned 4×4 pixel crop from the 16×16 texture, displayed at large scale.
- After each wrong guess, expand the visible area (e.g., 4×4 → 6×6 → 8×8 → 10×10 → 12×12 → full 16×16).
- The player types their guess from an autocomplete search.

**Guess Limit:** Configurable by the user.

---

### 4. Sound Mode

**Concept:** The player hears a Minecraft sound effect and must identify the mob, block, or item it belongs to.

**Subject Pool:** Mobs, Blocks, and Items that have distinct sound effects.

**Mechanics:**

- The full sound clip is played immediately (no progressive reveal).
- The player can replay the sound as many times as they want.
- The player types their guess from an autocomplete search.

**Guess Limit:** Configurable by the user.

---

## User Guess Limit Configuration

Before starting any game mode, the player can choose a guess limit:

- **Unlimited** (default)
- **Custom number:** 5, 10, 15, 20 (selectable)

This is set per-round via a settings panel or pre-game screen. When the limit is reached without a correct answer, the round ends and the answer is revealed.

---

## Data Model

All game data is stored as JSON files, loaded into memory at server startup.

### Items & Blocks (`data/items.json`)

```json
{
  "id": "diamond_sword",
  "name": "Diamond Sword",
  "type": "Weapon",
  "dimension": ["Overworld"],
  "stackable": false,
  "renewable": true,
  "versionAdded": "1.0",
  "textureUrl": "/textures/diamond_sword.png",
  "wikiUrl": "https://minecraft.wiki/w/Diamond_Sword"
}
```

### Mobs (`data/mobs.json`)

```json
{
  "id": "creeper",
  "name": "Creeper",
  "type": "Mob",
  "dimension": ["Overworld"],
  "behavior": "Hostile",
  "stackable": false,
  "renewable": true,
  "versionAdded": "1.0",
  "textureUrl": "/textures/creeper.png",
  "soundUrl": "/sounds/creeper.ogg",
  "wikiUrl": "https://minecraft.wiki/w/Creeper"
}
```

### Biomes (`data/biomes.json`)

```json
{
  "id": "dark_forest",
  "name": "Dark Forest",
  "dimension": ["Overworld"],
  "versionAdded": "1.0",
  "wikiUrl": "https://minecraft.wiki/w/Dark_Forest"
}
```

### Crafting Recipes (`data/recipes.json`)

```json
{
  "itemId": "diamond_sword",
  "name": "Diamond Sword",
  "grid": [
    [null, "diamond", null],
    [null, "diamond", null],
    [null, "stick", null]
  ],
  "shapeless": false
}
```

### Sounds (`data/sounds.json`)

```json
{
  "id": "creeper_hiss",
  "entityId": "creeper",
  "name": "Creeper",
  "soundFile": "/sounds/creeper_hiss.ogg",
  "category": "Mob"
}
```

---

## Data Collection (Build-time)

A build-time script (`scripts/fetch-wiki-data.ts`) uses the **minecraft.wiki API** (MediaWiki Action API) to populate the JSON data files.

### API Base URL

```
https://minecraft.wiki/api.php
```

This is a standard MediaWiki API. Key actions used:

| Action                              | Purpose                                                                |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `action=query&list=categorymembers` | List all pages in a category (e.g., `Category:Items`, `Category:Mobs`) |
| `action=parse&page=...`             | Get parsed HTML/wikitext of a page (infobox data, crafting recipes)    |
| `action=query&prop=revisions`       | Get raw wikitext for structured parsing                                |
| `action=query&prop=imageinfo`       | Get URLs for texture/image files                                       |
| `action=query&titles=File:...`      | Resolve file pages to direct download URLs for textures/sounds         |

### Data Targets

| Data             | API Approach                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Items & Blocks   | Query `Category:Items` and `Category:Blocks` members, then parse each page's infobox via `action=parse`     |
| Mobs             | Query `Category:Mobs` members, parse infobox for behavior, dimension, etc.                                  |
| Biomes           | Query `Category:Biomes` members, parse infobox attributes                                                   |
| Crafting Recipes | Parse individual item pages — extract crafting grid from wikitext/HTML                                      |
| Textures         | Use `action=query&prop=imageinfo` on `File:` pages to get direct image URLs, download to `public/textures/` |
| Sounds           | Query sound file pages, download `.ogg` files to `public/sounds/`                                           |

### Fetch Approach

- Use `axios` or `node-fetch` to call the MediaWiki API endpoints.
- Respect the wiki's rate limits (add delays between requests, use batch queries where possible via `titles=Page1|Page2|...`).
- Parse infobox templates from wikitext to extract structured attributes (type, dimension, behavior, stackable, renewable, version added).
- Download texture images and sound files to `public/textures/` and `public/sounds/`.
- Output structured JSON to the `data/` directory.
- Script is idempotent — can be re-run to update data.

---

## Project Structure

```
Craftdle/
├── client/                        # React frontend
│   ├── public/
│   │   ├── textures/              # Minecraft texture images
│   │   └── sounds/                # Minecraft sound files
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Shared UI components
│   │   │   │   ├── AutocompleteSearch.tsx
│   │   │   │   ├── GuessLimitSelector.tsx
│   │   │   │   ├── GuessList.tsx
│   │   │   │   └── GameOverModal.tsx
│   │   │   ├── classic/           # Classic mode components
│   │   │   │   ├── ClassicGame.tsx
│   │   │   │   └── AttributeRow.tsx
│   │   │   ├── crafting/          # Crafting Grid mode components
│   │   │   │   ├── CraftingGame.tsx
│   │   │   │   └── CraftingGrid.tsx
│   │   │   ├── texture/           # Texture Close-up mode components
│   │   │   │   ├── TextureGame.tsx
│   │   │   │   └── TextureCrop.tsx
│   │   │   ├── sound/             # Sound mode components
│   │   │   │   ├── SoundGame.tsx
│   │   │   │   └── SoundPlayer.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── ModeSelector.tsx
│   │   │       └── Footer.tsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useGame.ts
│   │   │   └── useAutocomplete.ts
│   │   ├── services/              # API client
│   │   │   └── api.ts
│   │   ├── types/                 # TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css              # Tailwind entry
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                        # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── classicRoutes.ts
│   │   │   ├── craftingRoutes.ts
│   │   │   ├── textureRoutes.ts
│   │   │   └── soundRoutes.ts
│   │   ├── services/
│   │   │   ├── classicService.ts
│   │   │   ├── craftingService.ts
│   │   │   ├── textureService.ts
│   │   │   └── soundService.ts
│   │   ├── data/                  # Data loader
│   │   │   └── dataLoader.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── compare.ts        # Attribute comparison logic
│   │   └── app.ts                 # Express app setup
│   ├── data/                      # JSON data files (generated)
│   │   ├── items.json
│   │   ├── mobs.json
│   │   ├── biomes.json
│   │   ├── recipes.json
│   │   └── sounds.json
│   ├── tsconfig.json
│   └── package.json
│
├── scripts/                       # Build-time scripts
│   ├── fetch-wiki-data.ts         # Main wiki API data fetcher
│   ├── fetch-items.ts
│   ├── fetch-mobs.ts
│   ├── fetch-biomes.ts
│   ├── fetch-recipes.ts
│   ├── fetch-sounds.ts
│   └── fetch-textures.ts
│
├── tests/                         # Test files
│   ├── client/
│   │   ├── ClassicGame.test.tsx
│   │   ├── CraftingGame.test.tsx
│   │   ├── TextureGame.test.tsx
│   │   └── SoundGame.test.tsx
│   └── server/
│       ├── classicService.test.ts
│       ├── craftingService.test.ts
│       ├── textureService.test.ts
│       ├── soundService.test.ts
│       └── compare.test.ts
│
├── model_instructions.md          # This file
├── changelog.md                   # Changelog tracking all changes
├── package.json                   # Root package.json (workspaces)
└── README.md
```

---

## API Endpoints

### Game Session Flow

Each game mode follows the same pattern:

1. **Start a new round** → server picks a random target, returns a session ID.
2. **Submit a guess** → server compares guess to target, returns feedback.
3. **Give up / Game over** → server reveals the answer.

### Classic Mode

| Method | Endpoint                         | Description                              |
| ------ | -------------------------------- | ---------------------------------------- |
| POST   | `/api/classic/start`             | Start new round, returns `sessionId`     |
| POST   | `/api/classic/guess`             | Submit guess, returns attribute feedback |
| GET    | `/api/classic/answer/:sessionId` | Reveal answer (give up)                  |

### Crafting Grid Mode

| Method | Endpoint                          | Description                                         |
| ------ | --------------------------------- | --------------------------------------------------- |
| POST   | `/api/crafting/start`             | Start new round, returns `sessionId` + hidden grid  |
| POST   | `/api/crafting/guess`             | Submit guess, reveals one ingredient on wrong guess |
| GET    | `/api/crafting/answer/:sessionId` | Reveal answer                                       |

### Texture Close-up Mode

| Method | Endpoint                         | Description                                     |
| ------ | -------------------------------- | ----------------------------------------------- |
| POST   | `/api/texture/start`             | Start round, returns `sessionId` + initial crop |
| POST   | `/api/texture/guess`             | Submit guess, zooms out on wrong guess          |
| GET    | `/api/texture/answer/:sessionId` | Reveal answer                                   |

### Sound Mode

| Method | Endpoint                       | Description                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| POST   | `/api/sound/start`             | Start round, returns `sessionId` + sound URL |
| POST   | `/api/sound/guess`             | Submit guess, returns match result           |
| GET    | `/api/sound/answer/:sessionId` | Reveal answer                                |

### Shared

| Method | Endpoint               | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| GET    | `/api/items/search?q=` | Autocomplete search across all entities |

### Request/Response Examples

**POST `/api/classic/start`**

```json
// Request
{ "guessLimit": 10 }

// Response
{
  "sessionId": "abc123",
  "guessLimit": 10,
  "guessesRemaining": 10,
  "attributes": ["type", "dimension", "behavior", "stackable", "renewable", "versionAdded"]
}
```

**POST `/api/classic/guess`**

```json
// Request
{ "sessionId": "abc123", "guess": "creeper" }

// Response
{
  "correct": false,
  "guessesRemaining": 9,
  "feedback": {
    "name": "Creeper",
    "type": { "value": "Mob", "match": true },
    "dimension": { "value": ["Overworld"], "match": false },
    "behavior": { "value": "Hostile", "match": true },
    "stackable": { "value": false, "match": true },
    "renewable": { "value": true, "match": false },
    "versionAdded": { "value": "1.0", "match": false }
  }
}
```

---

## Frontend Behavior

### General

- **Autocomplete search:** All guess inputs use a searchable dropdown that filters the entity list as the user types. Data fetched from `/api/items/search?q=`.
- **Guess history:** All previous guesses and their feedback are displayed in a scrollable list/table above the input.
- **Responsive:** Mobile-first responsive design using Tailwind CSS.
- **Mode selection:** A home/hub page lets the player choose a game mode.

### Classic Mode UI

- Table layout with columns for each attribute.
- Each row = one guess. Cells are colored green (match) or red (no match).
- Guess input at the bottom with autocomplete.

### Crafting Grid Mode UI

- A visual 3×3 grid with slot squares.
- Hidden slots show a "?" icon. Revealed slots show the ingredient texture.
- Guess input below the grid.
- The output slot (right side of the crafting table) remains hidden until the game is over.

### Texture Close-up Mode UI

- A large square canvas showing the cropped/zoomed texture.
- Smooth zoom-out animation on each wrong guess.
- Guess input below the image.

### Sound Mode UI

- A prominent "Play Sound" button.
- Visual waveform or speaker animation while audio plays.
- Guess input below the player.

### Game Over State

- Modal or inline reveal showing: the correct answer, its texture, name, and a link to its minecraft.wiki page.
- "Play Again" button to start a new round in the same mode.

---

## Styling & Theme

- **Tailwind CSS** for all styling.
- Minecraft-inspired aesthetic:
  - Use a pixel/blocky font (e.g., Minecraft font or similar) for headings.
  - Earthy/stone color palette (grays, browns, greens) with accent colors from Minecraft's UI.
  - Subtle block/pixel patterns for backgrounds.
  - Buttons styled to resemble Minecraft UI buttons (stone texture, hover states).
- Dark mode by default (like Minecraft's inventory screen).

---

## Testing Strategy

Both frontend and backend must have tests using **Jest**.

### Backend Tests

- **Service tests:** Verify game logic (correct/incorrect comparison, progressive reveal, session management).
- **Route tests:** HTTP-level tests using `supertest` for each endpoint.
- **Utility tests:** Attribute comparison logic in `compare.ts`.

### Frontend Tests

- **Component tests:** Using `@testing-library/react` for each game mode component.
- **Hook tests:** Verify `useGame` and `useAutocomplete` hooks.
- **Integration tests:** Full user flow per game mode (start → guess → feedback → win/lose).

---

## Implementation Order

1. **Project scaffolding** — Initialize monorepo, install dependencies, configure TypeScript, Tailwind, Vite, Jest.
2. **Data fetch scripts** — Build the wiki API data fetcher to populate JSON data files with items, mobs, biomes, recipes, textures, and sounds.
3. **Backend core** — Express server, data loader, session management, autocomplete endpoint.
4. **Classic mode** — Backend service + routes, then frontend components + integration.
5. **Crafting Grid mode** — Backend service + routes, then frontend components.
6. **Texture Close-up mode** — Backend service + routes, then frontend components.
7. **Sound mode** — Backend service + routes, then frontend components.
8. **UI polish** — Home page, mode selector, responsive design, Minecraft theme.
9. **Testing** — Write and run full test suites for both frontend and backend.
10. **Documentation** — README with setup instructions, architecture overview.

---

## Version Control

- Use a **local git repository** to track all changes.
- Commit after each meaningful milestone (scaffolding, new mode, data scripts, etc.).
- Use clear, descriptive commit messages.
- All changes must be recorded in `changelog.md` with date, description, and version.
