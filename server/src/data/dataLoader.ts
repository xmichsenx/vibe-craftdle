import * as fs from 'fs';
import * as path from 'path';
import { ItemOrBlock, Mob, Biome, CraftingRecipe, SoundEntry, ClassicEntity } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');

function loadJson<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

let items: ItemOrBlock[] = [];
let mobs: Mob[] = [];
let biomes: Biome[] = [];
let recipes: CraftingRecipe[] = [];
let sounds: SoundEntry[] = [];
let classicEntities: ClassicEntity[] = [];

export function loadAllData(): void {
  items = loadJson<ItemOrBlock>('items.json');
  mobs = loadJson<Mob>('mobs.json');
  biomes = loadJson<Biome>('biomes.json');
  recipes = loadJson<CraftingRecipe>('recipes.json');
  sounds = loadJson<SoundEntry>('sounds.json');

  // Build classic entity pool (items + mobs merged)
  classicEntities = [
    ...items.map((item) => ({
      ...item,
      behavior: 'N/A' as const,
    })),
    ...mobs.map((mob) => ({
      id: mob.id,
      name: mob.name,
      type: mob.type as ClassicEntity['type'],
      dimension: mob.dimension,
      behavior: mob.behavior,
      stackable: mob.stackable,
      renewable: mob.renewable,
      versionAdded: mob.versionAdded,
      textureUrl: mob.textureUrl,
      wikiUrl: mob.wikiUrl,
    })),
  ];
}

export function getItems(): ItemOrBlock[] {
  return items;
}

export function getMobs(): Mob[] {
  return mobs;
}

export function getBiomes(): Biome[] {
  return biomes;
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

export function searchEntities(query: string, limit = 10): { id: string; name: string; textureUrl: string; type: string }[] {
  const q = query.toLowerCase();
  const results: { id: string; name: string; textureUrl: string; type: string }[] = [];

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
