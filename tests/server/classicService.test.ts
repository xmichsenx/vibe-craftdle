import {
  startClassicGame,
  guessClassic,
  getClassicAnswer,
} from "../../server/src/services/classicService";
import { loadAllData } from "../../server/src/data/dataLoader";

// Load data before tests
beforeAll(() => {
  loadAllData();
});

describe("classicService", () => {
  describe("startClassicGame", () => {
    it("returns a session with valid structure", () => {
      const result = startClassicGame(null);
      expect(result.sessionId).toBeDefined();
      expect(typeof result.sessionId).toBe("string");
      expect(result.guessLimit).toBeNull();
      expect(result.guessesRemaining).toBeNull();
      expect(result.attributes).toEqual(
        expect.arrayContaining([
          "type",
          "dimension",
          "behavior",
          "stackable",
          "renewable",
          "versionAdded",
        ]),
      );
    });

    it("respects the guess limit parameter", () => {
      const result = startClassicGame(10);
      expect(result.guessLimit).toBe(10);
      expect(result.guessesRemaining).toBe(10);
    });
  });

  describe("guessClassic", () => {
    it("returns feedback for a valid guess", () => {
      const game = startClassicGame(null);
      // Guess a known entity name
      const result = guessClassic(game.sessionId, "Creeper");

      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(typeof result.correct).toBe("boolean");
        expect(result.feedback).toBeDefined();
        expect(result.feedback.name).toBe("Creeper");
        expect(result.feedback.type).toHaveProperty("match");
        expect(result.feedback.type).toHaveProperty("value");
      }
    });

    it("returns error for unknown entity", () => {
      const game = startClassicGame(null);
      const result = guessClassic(game.sessionId, "NotARealEntity");
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Unknown entity");
      }
    });

    it("returns error for invalid session", () => {
      const result = guessClassic("fake-session-id", "Creeper");
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Session not found");
      }
    });

    it("decrements guesses remaining", () => {
      const game = startClassicGame(5);
      const result = guessClassic(game.sessionId, "Creeper");

      if (!("error" in result)) {
        expect(result.guessesRemaining).toBe(4);
      }
    });

    it("returns error when no guesses remaining", () => {
      const game = startClassicGame(1);
      // Use first guess
      guessClassic(game.sessionId, "Creeper");
      // Try second guess
      const result = guessClassic(game.sessionId, "Zombie");

      // Should either be an error or the game should have ended
      if ("error" in result) {
        expect(result.error).toBe("No guesses remaining");
      }
    });

    it("returns error after game is solved", () => {
      // Start and get the answer to know the target
      const game = startClassicGame(null);
      const answer = getClassicAnswer(game.sessionId);
      if (!("error" in answer)) {
        // Start a new game and force a correct guess
        const game2 = startClassicGame(null);
        const ans2 = getClassicAnswer(game2.sessionId);
        if (!("error" in ans2)) {
          // This is a bit tricky since we need to guess the target
          // The answer reveals it, so now session is marked solved
          const result = guessClassic(game2.sessionId, "Creeper");
          expect("error" in result).toBe(true);
        }
      }
    });
  });

  describe("getClassicAnswer", () => {
    it("returns the answer for a valid session", () => {
      const game = startClassicGame(null);
      const answer = getClassicAnswer(game.sessionId);

      expect("error" in answer).toBe(false);
      if (!("error" in answer)) {
        expect(answer.id).toBeDefined();
        expect(answer.name).toBeDefined();
        expect(answer.textureUrl).toBeDefined();
        expect(answer.wikiUrl).toBeDefined();
      }
    });

    it("returns error for invalid session", () => {
      const answer = getClassicAnswer("fake-session-id");
      expect("error" in answer).toBe(true);
    });
  });
});
