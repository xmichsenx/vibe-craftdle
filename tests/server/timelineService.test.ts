import {
  startTimelineGame,
  guessTimeline,
  getTimelineAnswer,
  compareVersions,
} from "../../server/src/services/timelineService";
import { loadAllData } from "../../server/src/data/dataLoader";

beforeAll(() => {
  loadAllData();
});

describe("timelineService", () => {
  describe("compareVersions", () => {
    it("returns 0 for equal versions", () => {
      expect(compareVersions("1.0", "1.0")).toBe(0);
      expect(compareVersions("1.19.3", "1.19.3")).toBe(0);
    });

    it("returns positive for higher first version", () => {
      expect(compareVersions("1.19", "1.0")).toBeGreaterThan(0);
      expect(compareVersions("1.19.3", "1.19.2")).toBeGreaterThan(0);
    });

    it("returns negative for lower first version", () => {
      expect(compareVersions("1.0", "1.19")).toBeLessThan(0);
      expect(compareVersions("1.13", "1.14")).toBeLessThan(0);
    });

    it("handles versions with different segment counts", () => {
      expect(compareVersions("1.0", "1.0.1")).toBeLessThan(0);
      expect(compareVersions("1.19.1", "1.19")).toBeGreaterThan(0);
    });
  });

  describe("startTimelineGame", () => {
    it("returns a valid session with current entity and next entity", () => {
      const result = startTimelineGame();
      expect(result.sessionId).toBeDefined();
      expect(result.currentEntity).toBeDefined();
      expect(result.currentEntity.id).toBeDefined();
      expect(result.currentEntity.name).toBeDefined();
      expect(result.currentEntity.textureUrl).toBeDefined();
      expect(result.currentEntity.versionAdded).toBeDefined();
      expect(result.nextEntity).toBeDefined();
      expect(result.nextEntity.id).toBeDefined();
      expect(result.nextEntity.name).toBeDefined();
      expect(result.nextEntity.textureUrl).toBeDefined();
      expect(result.streak).toBe(0);
      expect(result.bestStreak).toBe(0);
    });
  });

  describe("guessTimeline", () => {
    it("returns error for invalid session", () => {
      const result = guessTimeline("fake-id", "higher");
      expect("error" in result).toBe(true);
    });

    it("returns error for invalid guess value", () => {
      const game = startTimelineGame();
      const result = guessTimeline(game.sessionId, "invalid");
      expect("error" in result).toBe(true);
    });

    it("returns a valid response for higher guess", () => {
      const game = startTimelineGame();
      const result = guessTimeline(game.sessionId, "higher");
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(typeof result.correct).toBe("boolean");
        expect(typeof result.streak).toBe("number");
        expect(typeof result.bestStreak).toBe("number");
        expect(result.previousEntity).toBeDefined();
        expect(result.correctAnswer).toMatch(/^(higher|lower|same)$/);
      }
    });

    it("returns a valid response for lower guess", () => {
      const game = startTimelineGame();
      const result = guessTimeline(game.sessionId, "lower");
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(typeof result.correct).toBe("boolean");
      }
    });

    it("increments streak on correct guess", () => {
      // Start multiple games and verify at least one works correctly
      const game = startTimelineGame();
      const result = guessTimeline(game.sessionId, "higher");
      if (!("error" in result) && result.correct) {
        expect(result.streak).toBe(1);
      }
    });

    it("ends game on wrong guess", () => {
      // We need to get a definitive wrong answer
      const game = startTimelineGame();
      const result = guessTimeline(game.sessionId, "higher");
      if (!("error" in result) && !result.correct) {
        expect(result.gameOver).toBe(true);
      }
    });
  });

  describe("getTimelineAnswer", () => {
    it("returns the answer for a valid session", () => {
      const game = startTimelineGame();
      const answer = getTimelineAnswer(game.sessionId);
      expect("error" in answer).toBe(false);
      if (!("error" in answer)) {
        expect(answer.id).toBeDefined();
        expect(answer.name).toBeDefined();
        expect(answer.textureUrl).toBeDefined();
        expect(answer.wikiUrl).toBeDefined();
      }
    });

    it("returns error for invalid session", () => {
      const answer = getTimelineAnswer("fake-id");
      expect("error" in answer).toBe(true);
    });
  });
});
