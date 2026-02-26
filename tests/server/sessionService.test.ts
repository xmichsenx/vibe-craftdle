import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  getGuessesRemaining,
} from "../../server/src/services/sessionService";
import { GameSession } from "../../server/src/types";

describe("sessionService", () => {
  describe("createSession", () => {
    it("creates a session and returns an id string", () => {
      const id = createSession("classic", "diamond_sword", 10);
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("creates a session that can be retrieved", () => {
      const id = createSession("classic", "creeper", null);
      const session = getSession(id);
      expect(session).toBeDefined();
      expect(session!.mode).toBe("classic");
      expect(session!.targetId).toBe("creeper");
      expect(session!.guessLimit).toBeNull();
      expect(session!.guesses).toEqual([]);
      expect(session!.solved).toBe(false);
    });

    it("creates sessions with unique IDs", () => {
      const id1 = createSession("classic", "a", null);
      const id2 = createSession("classic", "b", null);
      expect(id1).not.toBe(id2);
    });

    it("stores extra properties for crafting sessions", () => {
      const id = createSession("crafting", "sword", 5, {
        revealedSlots: [1, 2],
      } as any);
      const session = getSession(id) as any;
      expect(session.revealedSlots).toEqual([1, 2]);
    });

    it("stores extra properties for texture sessions", () => {
      const id = createSession("texture", "stone", null, {
        cropLevel: 0,
        centerX: 0.5,
        centerY: 0.5,
      } as any);
      const session = getSession(id) as any;
      expect(session.cropLevel).toBe(0);
      expect(session.centerX).toBe(0.5);
    });
  });

  describe("getSession", () => {
    it("returns undefined for non-existent session", () => {
      const session = getSession("nonexistent-id");
      expect(session).toBeUndefined();
    });
  });

  describe("updateSession", () => {
    it("updates session properties", () => {
      const id = createSession("classic", "diamond", null);
      updateSession(id, { solved: true });
      const session = getSession(id);
      expect(session!.solved).toBe(true);
    });

    it("does nothing for non-existent session", () => {
      expect(() => updateSession("fake", { solved: true })).not.toThrow();
    });
  });

  describe("deleteSession", () => {
    it("removes the session", () => {
      const id = createSession("classic", "diamond", null);
      expect(getSession(id)).toBeDefined();
      deleteSession(id);
      expect(getSession(id)).toBeUndefined();
    });

    it("does nothing for non-existent session", () => {
      expect(() => deleteSession("fake")).not.toThrow();
    });
  });

  describe("getGuessesRemaining", () => {
    it("returns null for unlimited sessions", () => {
      const id = createSession("classic", "diamond", null);
      const session = getSession(id)!;
      expect(getGuessesRemaining(session)).toBeNull();
    });

    it("returns correct remaining count", () => {
      const id = createSession("classic", "diamond", 5);
      const session = getSession(id)!;
      expect(getGuessesRemaining(session)).toBe(5);

      session.guesses.push("guess1");
      expect(getGuessesRemaining(session)).toBe(4);

      session.guesses.push("guess2", "guess3");
      expect(getGuessesRemaining(session)).toBe(2);
    });

    it("returns 0 when all guesses are used", () => {
      const id = createSession("classic", "diamond", 2);
      const session = getSession(id)!;
      session.guesses.push("g1", "g2");
      expect(getGuessesRemaining(session)).toBe(0);
    });

    it("never returns negative", () => {
      const id = createSession("classic", "diamond", 1);
      const session = getSession(id)!;
      session.guesses.push("g1", "g2", "g3");
      expect(getGuessesRemaining(session)).toBe(0);
    });
  });
});
