/**
 * Client-side data store — loads game data from static JSON files at startup.
 * Mirrors the server's dataLoader.ts but runs in the browser.
 */

// --------------- Data Types ---------------

export interface ItemOrBlock {
  id: string;
  name: string;
  type: string;
  dimension: string[];
  stackable: boolean;
  renewable: boolean;
  versionAdded: string;
  textureUrl: string;
  wikiUrl: string;
}

export interface Mob {
  id: string;
  name: string;
  type: "Mob";
  dimension: string[];
  behavior: string;
  stackable: false;
  renewable: boolean;
  versionAdded: string;
  textureUrl: string;
  soundUrl?: string;
  wikiUrl: string;
}

export interface CraftingRecipe {
  itemId: string;
  name: string;
  grid: (string | null)[][];
  shapeless: boolean;
}

export interface SoundEntry {
  id: string;
  entityId: string;
  name: string;
  soundFile: string;
  category: string;
}

export interface ClassicEntity {
  id: string;
  name: string;
  type: string;
  dimension: string[];
  behavior: string;
  stackable: boolean;
  renewable: boolean;
  versionAdded: string;
  textureUrl: string;
  wikiUrl: string;
}

// --------------- Stored Data ---------------

let items: ItemOrBlock[] = [];
let mobs: Mob[] = [];
let recipes: CraftingRecipe[] = [];
let sounds: SoundEntry[] = [];
let classicEntities: ClassicEntity[] = [];
let ingredientIcons: Record<string, string> = {};
let dataLoaded = false;

// --------------- Validation ---------------

function isNonEmpty(value: string | undefined): boolean {
  return !!value && value.trim().length > 0;
}

function isValidForClassic(entity: ItemOrBlock | Mob): boolean {
  return (
    isNonEmpty(entity.id) &&
    isNonEmpty(entity.name) &&
    isNonEmpty(entity.type) &&
    Array.isArray(entity.dimension) &&
    entity.dimension.length > 0 &&
    typeof entity.stackable === "boolean" &&
    typeof entity.renewable === "boolean" &&
    isNonEmpty(entity.versionAdded) &&
    isNonEmpty(entity.textureUrl) &&
    isNonEmpty(entity.wikiUrl)
  );
}

function isValidMobForClassic(mob: Mob): boolean {
  return isValidForClassic(mob) && isNonEmpty(mob.behavior);
}

function isValidRecipe(recipe: CraftingRecipe): boolean {
  return (
    isNonEmpty(recipe.itemId) &&
    isNonEmpty(recipe.name) &&
    Array.isArray(recipe.grid) &&
    recipe.grid.length === 3 &&
    recipe.grid.every((row) => Array.isArray(row) && row.length === 3) &&
    recipe.grid.some((row) => row.some((cell) => cell !== null))
  );
}

function isValidSound(sound: SoundEntry): boolean {
  return (
    isNonEmpty(sound.id) &&
    isNonEmpty(sound.entityId) &&
    isNonEmpty(sound.name) &&
    isNonEmpty(sound.soundFile)
  );
}

// --------------- Loading ---------------

async function fetchJson<T>(filename: string): Promise<T> {
  const base = import.meta.env.BASE_URL || "/";
  const res = await fetch(`${base}data/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}`);
  return res.json();
}

/**
 * Load all game data from static JSON files.
 * Must be called once before any game can start.
 */
export async function loadAllData(): Promise<void> {
  if (dataLoaded) return;

  const [rawItems, rawMobs, rawRecipes, rawSounds, rawIcons] =
    await Promise.all([
      fetchJson<ItemOrBlock[]>("items.json"),
      fetchJson<Mob[]>("mobs.json"),
      fetchJson<CraftingRecipe[]>("recipes.json"),
      fetchJson<SoundEntry[]>("sounds.json"),
      fetchJson<Record<string, string>>("ingredientIcons.json"),
    ]);

  ingredientIcons = rawIcons;
  items = rawItems.filter((i) => isValidForClassic(i));
  mobs = rawMobs.filter((m) => isValidMobForClassic(m));

  const validMobIds = new Set(mobs.map((m) => m.id));
  sounds = rawSounds.filter(
    (s) => isValidSound(s) && validMobIds.has(s.entityId),
  );

  const validItemIds = new Set(items.map((i) => i.id));
  recipes = rawRecipes.filter(
    (r) => isValidRecipe(r) && validItemIds.has(r.itemId),
  );

  classicEntities = [
    ...items.map((item) => ({ ...item, behavior: "N/A" })),
    ...mobs.map((mob) => ({
      id: mob.id,
      name: mob.name,
      type: mob.type as string,
      dimension: mob.dimension,
      behavior: mob.behavior,
      stackable: mob.stackable as boolean,
      renewable: mob.renewable,
      versionAdded: mob.versionAdded,
      textureUrl: mob.textureUrl,
      wikiUrl: mob.wikiUrl,
    })),
  ];

  dataLoaded = true;
}

export function isDataLoaded(): boolean {
  return dataLoaded;
}

// --------------- Accessors ---------------

export function getItems(): ItemOrBlock[] {
  return items;
}
export function getMobs(): Mob[] {
  return mobs;
}
export function getRecipes(): CraftingRecipe[] {
  return recipes;
}
export function getSounds(): SoundEntry[] {
  return sounds;
}
export function getClassicEntities(): ClassicEntity[] {
  return classicEntities;
}
export function getIngredientIcons(): Record<string, string> {
  return ingredientIcons;
}

// --------------- Search ---------------

export type SearchHit = {
  id: string;
  name: string;
  textureUrl: string;
  type: string;
};

export function searchEntities(query: string, limit = 10): SearchHit[] {
  const q = query.toLowerCase();
  const results: SearchHit[] = [];
  for (const entity of classicEntities) {
    if (entity.name.toLowerCase().includes(q)) {
      results.push({
        id: entity.id,
        name: entity.name,
        textureUrl: entity.textureUrl,
        type: entity.type,
      });
    }
    if (results.length >= limit) break;
  }
  return results;
}

export function searchCraftableItems(query: string, limit = 10): SearchHit[] {
  const q = query.toLowerCase();
  const craftableIds = new Set(recipes.map((r) => r.itemId));
  const results: SearchHit[] = [];
  for (const item of items) {
    if (craftableIds.has(item.id) && item.name.toLowerCase().includes(q)) {
      results.push({
        id: item.id,
        name: item.name,
        textureUrl: item.textureUrl,
        type: item.type,
      });
    }
    if (results.length >= limit) break;
  }
  return results;
}

export function searchMobs(query: string, limit = 10): SearchHit[] {
  const q = query.toLowerCase();
  const results: SearchHit[] = [];
  for (const mob of mobs) {
    if (mob.name.toLowerCase().includes(q)) {
      results.push({
        id: mob.id,
        name: mob.name,
        textureUrl: mob.textureUrl,
        type: mob.type,
      });
    }
    if (results.length >= limit) break;
  }
  return results;
}
