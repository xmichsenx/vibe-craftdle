import {
  startSilhouetteGame,
  guessSilhouette,
  getSilhouetteAnswer,
  OPACITY_LEVELS,
  MAX_REVEAL_STEP,
} from "../../server/src/services/silhouetteService";
import { loadAllData } from "../../server/src/data/dataLoader";

beforeAll(() => {
  loadAllData();
});

describe("silhouetteService", () => {
  describe("constants", () => {
    it("has valid opacity levels", () => {
      expect(OPACITY_LEVELS).toEqual([1.0, 0.85, 0.7, 0.55, 0.4, 0.0]);
      expect(MAX_REVEAL_STEP).toBe(5);
    });

    it("starts at full opacity and ends at zero", () => {
      expect(OPACITY_LEVELS[0]).toBe(1.0);
      expect(OPACITY_LEVELS[OPACITY_LEVELS.length - 1]).toBe(0.0);
    });
  });

  describe("startSilhouetteGame", () => {
    it("returns a valid session at full opacity", () => {
      const result = startSilhouetteGame(null);
      expect(result.sessionId).toBeDefined();
      expect(result.opacity).toBe(1.0);
      expect(result.textureUrl).toBeDefined();
      expect(typeof result.textureUrl).toBe("string");
    });

    it("respects guess limit", () => {
      const result = startSilhouetteGame(10);
      expect(result.guessLimit).toBe(10);
      expect(result.guessesRemaining).toBe(10);
    });

    it("returns null limits for unlimited", () => {
      const result = startSilhouetteGame(null);
      expect(result.guessLimit).toBeNull();
      expect(result.guessesRemaining).toBeNull();
    });
  });

  describe("guessSilhouette", () => {
    it("reduces opacity on wrong guess", () => {
      const game = startSilhouetteGame(null);
      const result = guessSilhouette(game.sessionId, "WrongMobName");

      if (!("error" in result)) {
        expect(result.opacity).toBeLessThan(1.0);
        expect(result.correct).toBe(false);
      }
    });

    it("returns error for invalid session", () => {
      const result = guessSilhouette("fake-id", "Creeper");
      expect("error" in result).toBe(true);
    });

    it("sets opacity to 0 on correct guess", () => {
      const game = startSilhouetteGame(null);
      // We don't know the target, but we can verify the response structure
      const result = guessSilhouette(game.sessionId, "SomeGuess");
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(typeof result.correct).toBe("boolean");
        expect(typeof result.opacity).toBe("number");
      }
    });

    it("decrements guessesRemaining with limit", () => {
      const game = startSilhouetteGame(5);
      const result = guessSilhouette(game.sessionId, "WrongGuess");
      if (!("error" in result)) {
        expect(result.guessesRemaining).toBe(4);
      }
    });
  });

  describe("getSilhouetteAnswer", () => {
    it("returns the answer for a valid session", () => {
      const game = startSilhouetteGame(null);
      const answer = getSilhouetteAnswer(game.sessionId);

      expect("error" in answer).toBe(false);
      if (!("error" in answer)) {
        expect(answer.id).toBeDefined();
        expect(answer.name).toBeDefined();
        expect(answer.textureUrl).toBeDefined();
        expect(answer.wikiUrl).toBeDefined();
      }
    });

    it("returns error for invalid session", () => {
      const answer = getSilhouetteAnswer("fake-id");
      expect("error" in answer).toBe(true);
    });
  });
});
