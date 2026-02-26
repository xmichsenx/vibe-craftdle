import {
  startCraftingGame,
  guessCrafting,
  getCraftingAnswer,
} from "../../server/src/services/craftingService";
import { loadAllData } from "../../server/src/data/dataLoader";

beforeAll(() => {
  loadAllData();
});

describe("craftingService", () => {
  describe("startCraftingGame", () => {
    it("returns a valid session with hidden grid", () => {
      const result = startCraftingGame(null);
      expect(result.sessionId).toBeDefined();
      expect(result.guessLimit).toBeNull();
      expect(result.guessesRemaining).toBeNull();
      expect(result.grid).toBeDefined();
      expect(result.grid.length).toBe(3);
      expect(result.grid[0].length).toBe(3);
      expect(result.revealedSlots).toEqual([]);
      // All slots should be null initially (hidden)
      for (const row of result.grid) {
        for (const cell of row) {
          expect(cell).toBeNull();
        }
      }
    });

    it("respects guess limit", () => {
      const result = startCraftingGame(5);
      expect(result.guessLimit).toBe(5);
      expect(result.guessesRemaining).toBe(5);
    });

    it("returns ingredientIcons property", () => {
      const result = startCraftingGame(null);
      expect(result.ingredientIcons).toBeDefined();
      expect(typeof result.ingredientIcons).toBe("object");
    });
  });

  describe("guessCrafting", () => {
    it("reveals a slot on wrong guess", () => {
      const game = startCraftingGame(null);
      // Guess something that's likely wrong
      const result = guessCrafting(game.sessionId, "Diamond Sword");

      if (!("error" in result) && !result.correct) {
        expect(result.revealedSlots.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("returns error for invalid session", () => {
      const result = guessCrafting("fake-id", "Diamond Sword");
      expect("error" in result).toBe(true);
    });

    it("decrements guesses remaining", () => {
      const game = startCraftingGame(10);
      const result = guessCrafting(game.sessionId, "Diamond Sword");
      if (!("error" in result)) {
        if (result.correct) {
          // Might actually be correct by chance
          expect(result.guessesRemaining).toBe(10);
        } else {
          expect(result.guessesRemaining).toBe(9);
        }
      }
    });
  });

  describe("getCraftingAnswer", () => {
    it("returns the answer for a valid session", () => {
      const game = startCraftingGame(null);
      const answer = getCraftingAnswer(game.sessionId);

      expect("error" in answer).toBe(false);
      if (!("error" in answer)) {
        expect(answer.id).toBeDefined();
        expect(answer.name).toBeDefined();
        expect(typeof answer.name).toBe("string");
      }
    });

    it("returns error for invalid session", () => {
      const answer = getCraftingAnswer("fake-id");
      expect("error" in answer).toBe(true);
    });
  });
});
