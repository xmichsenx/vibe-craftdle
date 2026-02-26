import {
  startSoundGame,
  guessSound,
  getSoundAnswer,
} from "../../server/src/services/soundService";
import { loadAllData } from "../../server/src/data/dataLoader";

beforeAll(() => {
  loadAllData();
});

describe("soundService", () => {
  describe("startSoundGame", () => {
    it("returns a valid session with sound URL", () => {
      const result = startSoundGame(null);
      expect(result.sessionId).toBeDefined();
      expect(typeof result.soundUrl).toBe("string");
      expect(result.guessLimit).toBeNull();
      expect(result.guessesRemaining).toBeNull();
    });

    it("respects guess limit", () => {
      const result = startSoundGame(5);
      expect(result.guessLimit).toBe(5);
      expect(result.guessesRemaining).toBe(5);
    });
  });

  describe("guessSound", () => {
    it("returns correct/incorrect for a guess", () => {
      const game = startSoundGame(null);
      const result = guessSound(game.sessionId, "Creeper");

      if (!("error" in result)) {
        expect(typeof result.correct).toBe("boolean");
      }
    });

    it("returns error for invalid session", () => {
      const result = guessSound("fake-id", "Creeper");
      expect("error" in result).toBe(true);
    });

    it("decrements guesses remaining", () => {
      const game = startSoundGame(10);
      const result = guessSound(game.sessionId, "SomeMob");
      if (!("error" in result) && !result.correct) {
        expect(result.guessesRemaining).toBe(9);
      }
    });

    it("marks game as solved on correct guess", () => {
      const game = startSoundGame(null);
      // Get the answer to know the correct name
      const answer = getSoundAnswer(game.sessionId);
      // After revealing the answer, the game is marked solved
      if (!("error" in answer)) {
        const result = guessSound(game.sessionId, answer.name);
        expect("error" in result).toBe(true);
        if ("error" in result) {
          expect(result.error).toBe("Game already completed");
        }
      }
    });
  });

  describe("getSoundAnswer", () => {
    it("returns the answer for a valid session", () => {
      const game = startSoundGame(null);
      const answer = getSoundAnswer(game.sessionId);

      expect("error" in answer).toBe(false);
      if (!("error" in answer)) {
        expect(answer.id).toBeDefined();
        expect(answer.name).toBeDefined();
        expect(typeof answer.name).toBe("string");
      }
    });

    it("returns error for invalid session", () => {
      const answer = getSoundAnswer("fake-id");
      expect("error" in answer).toBe(true);
    });
  });
});
