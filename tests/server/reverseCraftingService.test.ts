import {
  startReverseCraftingGame,
  guessReverseCrafting,
  getReverseCraftingAnswer,
} from "../../server/src/services/reverseCraftingService";
import { loadAllData, getRecipes } from "../../server/src/data/dataLoader";

beforeAll(() => {
  loadAllData();
});

describe("reverseCraftingService", () => {
  describe("startReverseCraftingGame", () => {
    it("returns a valid session with output item and ingredients", () => {
      const result = startReverseCraftingGame(null);
      expect(result.sessionId).toBeDefined();
      expect(result.outputItem).toBeDefined();
      expect(result.outputItem.id).toBeDefined();
      expect(result.outputItem.name).toBeDefined();
      expect(result.outputItem.textureUrl).toBeDefined();
      expect(result.gridSize).toBe(3);
      expect(Array.isArray(result.availableIngredients)).toBe(true);
      expect(result.availableIngredients.length).toBeGreaterThan(0);
      expect(result.lockedSlots).toEqual([]);
      expect(result.playerGrid).toEqual([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
    });

    it("respects guess limit", () => {
      const result = startReverseCraftingGame(10);
      expect(result.guessLimit).toBe(10);
      expect(result.guessesRemaining).toBe(10);
    });

    it("returns ingredient icons for available ingredients", () => {
      const result = startReverseCraftingGame(null);
      expect(typeof result.ingredientIcons).toBe("object");
    });
  });

  describe("guessReverseCrafting", () => {
    it("returns error for invalid session", () => {
      const emptyGrid = JSON.stringify([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      const result = guessReverseCrafting("fake-id", emptyGrid);
      expect("error" in result).toBe(true);
    });

    it("returns error for invalid grid format", () => {
      const game = startReverseCraftingGame(null);
      const result = guessReverseCrafting(game.sessionId, "not-json");
      expect("error" in result).toBe(true);
    });

    it("returns error for wrong grid dimensions", () => {
      const game = startReverseCraftingGame(null);
      const result = guessReverseCrafting(
        game.sessionId,
        JSON.stringify([[null, null]]),
      );
      expect("error" in result).toBe(true);
    });

    it("returns valid feedback for a guess", () => {
      const game = startReverseCraftingGame(null);
      const emptyGrid = JSON.stringify([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      const result = guessReverseCrafting(game.sessionId, emptyGrid);
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(typeof result.correct).toBe("boolean");
        expect(typeof result.correctCount).toBe("number");
        expect(typeof result.totalFilledSlots).toBe("number");
        expect(Array.isArray(result.lockedSlots)).toBe(true);
        expect(Array.isArray(result.playerGrid)).toBe(true);
      }
    });

    it("decrements guessesRemaining with limit", () => {
      const game = startReverseCraftingGame(5);
      const emptyGrid = JSON.stringify([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      const result = guessReverseCrafting(game.sessionId, emptyGrid);
      if (!("error" in result)) {
        expect(result.guessesRemaining).toBe(4);
      }
    });

    it("marks correct when all slots match the recipe", () => {
      // Start a game and use the actual recipe grid to guess
      const game = startReverseCraftingGame(null);
      const recipes = getRecipes();
      const recipe = recipes.find((r) => r.itemId === game.outputItem.id);

      if (recipe) {
        const result = guessReverseCrafting(
          game.sessionId,
          JSON.stringify(recipe.grid),
        );
        if (!("error" in result)) {
          expect(result.correct).toBe(true);
          expect(result.correctCount).toBe(9);
        }
      }
    });
  });

  describe("getReverseCraftingAnswer", () => {
    it("returns the answer with grid for a valid session", () => {
      const game = startReverseCraftingGame(null);
      const answer = getReverseCraftingAnswer(game.sessionId);
      expect("error" in answer).toBe(false);
      if (!("error" in answer)) {
        expect(answer.id).toBeDefined();
        expect(answer.name).toBeDefined();
        expect(answer.textureUrl).toBeDefined();
        expect(answer.wikiUrl).toBeDefined();
      }
    });

    it("returns error for invalid session", () => {
      const answer = getReverseCraftingAnswer("fake-id");
      expect("error" in answer).toBe(true);
    });
  });
});
