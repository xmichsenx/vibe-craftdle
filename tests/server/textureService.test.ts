import {
  startTextureGame,
  guessTexture,
  getTextureAnswer,
  CROP_SIZES,
  MAX_CROP_LEVEL,
} from "../../server/src/services/textureService";
import { loadAllData } from "../../server/src/data/dataLoader";

beforeAll(() => {
  loadAllData();
});

describe("textureService", () => {
  describe("constants", () => {
    it("has valid crop sizes", () => {
      expect(CROP_SIZES).toEqual([4, 6, 8, 10, 12, 16]);
      expect(MAX_CROP_LEVEL).toBe(5);
    });
  });

  describe("startTextureGame", () => {
    it("returns a valid session at crop level 0", () => {
      const result = startTextureGame(null);
      expect(result.sessionId).toBeDefined();
      expect(result.cropLevel).toBe(0);
      expect(result.imageData).toBeDefined();
      expect(typeof result.imageData).toBe("string");
      expect(result.centerX).toBeGreaterThanOrEqual(0.2);
      expect(result.centerX).toBeLessThanOrEqual(0.8);
      expect(result.centerY).toBeGreaterThanOrEqual(0.2);
      expect(result.centerY).toBeLessThanOrEqual(0.8);
    });

    it("respects guess limit", () => {
      const result = startTextureGame(15);
      expect(result.guessLimit).toBe(15);
      expect(result.guessesRemaining).toBe(15);
    });
  });

  describe("guessTexture", () => {
    it("zooms out on wrong guess (increases crop level)", () => {
      const game = startTextureGame(null);
      const result = guessTexture(game.sessionId, "Dirt");

      if (!("error" in result) && !result.correct) {
        expect(result.cropLevel).toBeGreaterThan(0);
      }
    });

    it("returns error for invalid session", () => {
      const result = guessTexture("fake-id", "Dirt");
      expect("error" in result).toBe(true);
    });

    it("preserves centerX/centerY across guesses", () => {
      const game = startTextureGame(null);
      const result = guessTexture(game.sessionId, "Dirt");

      if (!("error" in result)) {
        expect(result.centerX).toBe(game.centerX);
        expect(result.centerY).toBe(game.centerY);
      }
    });
  });

  describe("getTextureAnswer", () => {
    it("returns the answer for a valid session", () => {
      const game = startTextureGame(null);
      const answer = getTextureAnswer(game.sessionId);

      expect("error" in answer).toBe(false);
      if (!("error" in answer)) {
        expect(answer.id).toBeDefined();
        expect(answer.name).toBeDefined();
        expect(answer.textureUrl).toBeDefined();
        expect(answer.wikiUrl).toBeDefined();
      }
    });

    it("returns error for invalid session", () => {
      const answer = getTextureAnswer("fake-id");
      expect("error" in answer).toBe(true);
    });
  });
});
