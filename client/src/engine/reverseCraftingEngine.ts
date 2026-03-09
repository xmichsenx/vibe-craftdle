/**
 * Client-side Reverse Crafting mode engine.
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
  ReverseCraftingStartResponse,
  ReverseCraftingGuessResponse,
  AnswerResponse,
} from "../types";

function getRandomRecipe(): CraftingRecipe {
  const r = getRecipes();
  return r[Math.floor(Math.random() * r.length)];
}

function findRecipeById(itemId: string): CraftingRecipe | undefined {
  return getRecipes().find((r) => r.itemId === itemId);
}

function getUniqueIngredients(grid: (string | null)[][]): string[] {
  const ingredients = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) ingredients.add(cell);
    }
  }
  return Array.from(ingredients);
}

function collectIcons(ingredientIds: string[]): Record<string, string> {
  const icons = getIngredientIcons();
  const result: Record<string, string> = {};
  for (const id of ingredientIds) {
    if (icons[id]) result[id] = icons[id];
  }
  return result;
}

function countCorrectSlots(
  playerGrid: (string | null)[][],
  recipeGrid: (string | null)[][],
): { correctCount: number; correctSlots: number[] } {
  let correctCount = 0;
  const correctSlots: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const slotIndex = r * 3 + c;
      if (playerGrid[r][c] === recipeGrid[r][c]) {
        correctCount++;
        correctSlots.push(slotIndex);
      }
    }
  }
  return { correctCount, correctSlots };
}

function countFilledSlots(grid: (string | null)[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) count++;
    }
  }
  return count;
}

export function startReverseCraftingGame(
  guessLimit: number | null,
): ReverseCraftingStartResponse {
  const recipe = getRandomRecipe();
  const item = getItems().find((i) => i.id === recipe.itemId);
  const ingredients = getUniqueIngredients(recipe.grid);
  const emptyGrid: (string | null)[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  const sessionId = createSession(
    "reverse-crafting",
    recipe.itemId,
    guessLimit,
    {
      lockedSlots: [] as number[],
      playerGrid: emptyGrid,
    },
  );

  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    outputItem: {
      id: recipe.itemId,
      name: recipe.name,
      textureUrl: item?.textureUrl ?? "",
    },
    gridSize: 3,
    availableIngredients: ingredients,
    ingredientIcons: collectIcons(ingredients),
    lockedSlots: [],
    playerGrid: emptyGrid,
  };
}

export function guessReverseCrafting(
  sessionId: string,
  playerGrid: (string | null)[][],
): ReverseCraftingGuessResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.solved) throw new Error("Game already completed");

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    throw new Error("No guesses remaining");

  const recipe = findRecipeById(session.targetId);
  if (!recipe) throw new Error("Recipe not found");

  session.guesses.push(JSON.stringify(playerGrid));
  session.playerGrid = playerGrid;

  const { correctCount, correctSlots } = countCorrectSlots(
    playerGrid,
    recipe.grid,
  );
  const totalFilled = countFilledSlots(recipe.grid);
  const correct = correctCount === 9;

  const lockedSlots = (session.lockedSlots as number[]) || [];

  if (correct) {
    session.solved = true;
    session.lockedSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  } else {
    const newCorrectSlots = correctSlots.filter(
      (s) => !lockedSlots.includes(s),
    );
    const meaningfulNewSlots = newCorrectSlots.filter((s) => {
      const row = Math.floor(s / 3);
      const col = s % 3;
      return recipe.grid[row][col] !== null;
    });

    if (meaningfulNewSlots.length > 0) {
      const slotToLock =
        meaningfulNewSlots[
          Math.floor(Math.random() * meaningfulNewSlots.length)
        ];
      lockedSlots.push(slotToLock);
      session.lockedSlots = lockedSlots;
    }
  }

  const ingredients = getUniqueIngredients(recipe.grid);

  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    correctCount,
    totalFilledSlots: totalFilled,
    lockedSlots: session.lockedSlots as number[],
    playerGrid: session.playerGrid as (string | null)[][],
    ingredientIcons: collectIcons(ingredients),
  };
}

export function getReverseCraftingAnswer(sessionId: string): AnswerResponse & {
  grid: (string | null)[][];
  ingredientIcons: Record<string, string>;
} {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const recipe = findRecipeById(session.targetId);
  if (!recipe) throw new Error("Recipe not found");

  session.solved = true;
  const item = getItems().find((i) => i.id === recipe.itemId);
  const ingredients = getUniqueIngredients(recipe.grid);

  return {
    id: recipe.itemId,
    name: recipe.name,
    textureUrl: item?.textureUrl ?? "",
    wikiUrl:
      item?.wikiUrl ??
      `https://minecraft.wiki/w/${recipe.name.replace(/ /g, "_")}`,
    grid: recipe.grid,
    ingredientIcons: collectIcons(ingredients),
  };
}
