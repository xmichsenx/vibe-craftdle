import { getRecipes, getIngredientIcons, getItems } from "../data/dataLoader";
import {
  createSession,
  getSession,
  getGuessesRemaining,
} from "./sessionService";
import {
  CraftingRecipe,
  ReverseCraftingSession,
  ReverseCraftingStartResponse,
  ReverseCraftingGuessResponse,
  AnswerResponse,
} from "../types";

function getRandomRecipe(): CraftingRecipe {
  const recipes = getRecipes();
  return recipes[Math.floor(Math.random() * recipes.length)];
}

function findRecipeById(itemId: string): CraftingRecipe | undefined {
  return getRecipes().find((r) => r.itemId === itemId);
}

/**
 * Get the unique ingredient IDs from a recipe grid.
 */
function getUniqueIngredients(grid: (string | null)[][]): string[] {
  const ingredients = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) {
        ingredients.add(cell);
      }
    }
  }
  return Array.from(ingredients);
}

/**
 * Collect icon URLs for a set of ingredient IDs.
 */
function collectIcons(ingredientIds: string[]): Record<string, string> {
  const icons = getIngredientIcons();
  const result: Record<string, string> = {};
  for (const id of ingredientIds) {
    if (icons[id]) {
      result[id] = icons[id];
    }
  }
  return result;
}

/**
 * Count how many slots the player got correct compared to the actual recipe.
 */
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

/**
 * Count total non-null slots in a recipe grid.
 */
function countFilledSlots(grid: (string | null)[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) count++;
    }
  }
  return count;
}

/**
 * Start a reverse crafting game round.
 * Player is shown the output item and must place ingredients in the correct grid positions.
 */
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
      lockedSlots: [],
      playerGrid: emptyGrid,
    } as Partial<ReverseCraftingSession>,
  );

  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    outputItem: {
      id: recipe.itemId,
      name: recipe.name,
      textureUrl: item?.textureUrl ?? `/textures/${recipe.itemId}.png`,
    },
    gridSize: 3,
    availableIngredients: ingredients,
    ingredientIcons: collectIcons(ingredients),
    lockedSlots: [],
    playerGrid: emptyGrid,
  };
}

/**
 * Process a reverse crafting guess.
 * The guess is a JSON-encoded 3x3 grid of ingredient IDs (or null for empty slots).
 * On wrong placement, one correctly-placed ingredient locks in (progressive assist).
 */
export function guessReverseCrafting(
  sessionId: string,
  guessGrid: string, // JSON string of (string | null)[][]
): ReverseCraftingGuessResponse | { error: string } {
  const session = getSession(sessionId) as ReverseCraftingSession | undefined;
  if (!session) return { error: "Session not found" };
  if (session.solved) return { error: "Game already completed" };

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    return { error: "No guesses remaining" };

  const recipe = findRecipeById(session.targetId);
  if (!recipe) return { error: "Recipe not found" };

  let playerGrid: (string | null)[][];
  try {
    playerGrid = JSON.parse(guessGrid);
  } catch {
    return { error: "Invalid grid format" };
  }

  if (
    !Array.isArray(playerGrid) ||
    playerGrid.length !== 3 ||
    !playerGrid.every((r) => Array.isArray(r) && r.length === 3)
  ) {
    return { error: "Grid must be 3x3" };
  }

  session.guesses.push(guessGrid);
  session.playerGrid = playerGrid;

  const { correctCount, correctSlots } = countCorrectSlots(
    playerGrid,
    recipe.grid,
  );
  const totalFilled = countFilledSlots(recipe.grid);

  // Check if all slots match (including empty slots)
  const correct = correctCount === 9;

  if (correct) {
    session.solved = true;
    session.lockedSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  } else {
    // Lock in one new correctly-placed slot as progressive assist
    const newCorrectSlots = correctSlots.filter(
      (s) => !session.lockedSlots.includes(s),
    );
    // Only lock slots that have actual ingredients (not empty-matching-empty)
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
      session.lockedSlots.push(slotToLock);
    }
  }

  const ingredients = getUniqueIngredients(recipe.grid);

  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    correctCount,
    totalFilledSlots: totalFilled,
    lockedSlots: session.lockedSlots,
    playerGrid: session.playerGrid,
    ingredientIcons: collectIcons(ingredients),
  };
}

/**
 * Reveal the answer for a reverse crafting game session.
 */
export function getReverseCraftingAnswer(
  sessionId: string,
):
  | (AnswerResponse & {
      grid: (string | null)[][];
      ingredientIcons: Record<string, string>;
    })
  | { error: string } {
  const session = getSession(sessionId);
  if (!session) return { error: "Session not found" };

  const recipe = findRecipeById(session.targetId);
  if (!recipe) return { error: "Recipe not found" };

  session.solved = true;

  const item = getItems().find((i) => i.id === recipe.itemId);
  const ingredients = getUniqueIngredients(recipe.grid);

  return {
    id: recipe.itemId,
    name: recipe.name,
    textureUrl: item?.textureUrl ?? `/textures/${recipe.itemId}.png`,
    wikiUrl:
      item?.wikiUrl ??
      `https://minecraft.wiki/w/${recipe.name.replace(/ /g, "_")}`,
    grid: recipe.grid,
    ingredientIcons: collectIcons(ingredients),
  };
}
