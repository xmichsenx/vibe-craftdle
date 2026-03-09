/**
 * Client-side Crafting mode engine.
 */
import {
  getRecipes,
  getIngredientIcons,
  getItems,
  CraftingRecipe,
} from "./dataStore";
import {
  createSession,
  getSession,
  getGuessesRemaining,
} from "./sessionManager";
import type {
  CraftingStartResponse,
  CraftingGuessResponse,
  AnswerResponse,
} from "../types";

function getRandomRecipe(): CraftingRecipe {
  const r = getRecipes();
  return r[Math.floor(Math.random() * r.length)];
}

function findRecipeById(itemId: string): CraftingRecipe | undefined {
  return getRecipes().find((r) => r.itemId === itemId);
}

function findRecipeByName(name: string): CraftingRecipe | undefined {
  return getRecipes().find((r) => r.name.toLowerCase() === name.toLowerCase());
}

function buildVisibleGrid(
  recipe: CraftingRecipe,
  revealedSlots: number[],
): (string | null)[][] {
  const grid: (string | null)[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  for (const slotIndex of revealedSlots) {
    const row = Math.floor(slotIndex / 3);
    const col = slotIndex % 3;
    grid[row][col] = recipe.grid[row][col];
  }
  return grid;
}

function getNextSlotToReveal(
  recipe: CraftingRecipe,
  revealedSlots: number[],
): number | null {
  const allSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const hidden = allSlots.filter((s) => !revealedSlots.includes(s));
  if (hidden.length === 0) return null;

  const withIngredients = hidden.filter((s) => {
    const row = Math.floor(s / 3);
    const col = s % 3;
    return recipe.grid[row][col] !== null;
  });

  const pool = withIngredients.length > 0 ? withIngredients : hidden;
  return pool[Math.floor(Math.random() * pool.length)];
}

function collectVisibleIcons(
  grid: (string | null)[][],
): Record<string, string> {
  const icons = getIngredientIcons();
  const result: Record<string, string> = {};
  for (const row of grid) {
    for (const cell of row) {
      if (cell && !result[cell] && icons[cell]) {
        result[cell] = icons[cell];
      }
    }
  }
  return result;
}

export function startCraftingGame(
  guessLimit: number | null,
): CraftingStartResponse {
  const recipe = getRandomRecipe();
  const sessionId = createSession("crafting", recipe.itemId, guessLimit, {
    revealedSlots: [] as number[],
  });

  const grid = buildVisibleGrid(recipe, []);
  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    grid,
    revealedSlots: [],
    ingredientIcons: collectVisibleIcons(grid),
  };
}

export function guessCrafting(
  sessionId: string,
  guessName: string,
): CraftingGuessResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.solved) throw new Error("Game already completed");

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    throw new Error("No guesses remaining");

  const recipe = findRecipeById(session.targetId);
  if (!recipe) throw new Error("Recipe not found");

  const guessRecipe = findRecipeByName(guessName);
  session.guesses.push(guessName);

  const revealedSlots = (session.revealedSlots as number[]) || [];
  const correct = guessRecipe?.itemId === recipe.itemId;

  if (correct) {
    session.solved = true;
    session.revealedSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  } else {
    const nextSlot = getNextSlotToReveal(recipe, revealedSlots);
    if (nextSlot !== null) {
      revealedSlots.push(nextSlot);
      session.revealedSlots = revealedSlots;
    }
  }

  const currentSlots = session.revealedSlots as number[];
  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    grid: buildVisibleGrid(recipe, currentSlots),
    revealedSlots: currentSlots,
    ingredientIcons: collectVisibleIcons(
      buildVisibleGrid(recipe, currentSlots),
    ),
  };
}

export function getCraftingAnswer(sessionId: string): AnswerResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const recipe = findRecipeById(session.targetId);
  if (!recipe) throw new Error("Recipe not found");

  session.solved = true;
  const item = getItems().find((i) => i.id === recipe.itemId);

  return {
    id: recipe.itemId,
    name: recipe.name,
    textureUrl: item?.textureUrl ?? "",
    wikiUrl:
      item?.wikiUrl ??
      `https://minecraft.wiki/w/${recipe.name.replace(/ /g, "_")}`,
  };
}
