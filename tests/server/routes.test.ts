/* eslint-disable @typescript-eslint/no-var-requires */
const request = require("supertest");
import app from "../../server/src/app";

describe("API Routes", () => {
  describe("GET /api/health", () => {
    it("returns ok status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("GET /api/items/search", () => {
    it("returns empty array for empty query", async () => {
      const res = await request(app).get("/api/items/search?q=");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns results for a valid query", async () => {
      const res = await request(app).get("/api/items/search?q=diamond");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("textureUrl");
      expect(res.body[0]).toHaveProperty("type");
    });

    it("limits results to 10", async () => {
      const res = await request(app).get("/api/items/search?q=i");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Classic mode routes", () => {
    let sessionId: string;

    it("POST /api/classic/start creates a game", async () => {
      const res = await request(app)
        .post("/api/classic/start")
        .send({ guessLimit: 10 });
      expect(res.status).toBe(200);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.guessLimit).toBe(10);
      expect(res.body.attributes).toBeDefined();
      sessionId = res.body.sessionId;
    });

    it("POST /api/classic/guess returns feedback", async () => {
      const res = await request(app)
        .post("/api/classic/guess")
        .send({ sessionId, guess: "Creeper" });
      expect(res.status).toBe(200);
      expect(typeof res.body.correct).toBe("boolean");
      expect(res.body.feedback).toBeDefined();
    });

    it("POST /api/classic/guess returns 400 without params", async () => {
      const res = await request(app).post("/api/classic/guess").send({});
      expect(res.status).toBe(400);
    });

    it("GET /api/classic/answer/:sessionId returns answer", async () => {
      const start = await request(app)
        .post("/api/classic/start")
        .send({ guessLimit: null });
      const res = await request(app).get(
        `/api/classic/answer/${start.body.sessionId}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.name).toBeDefined();
    });

    it("GET /api/classic/answer returns 404 for invalid session", async () => {
      const res = await request(app).get("/api/classic/answer/fake-id");
      expect(res.status).toBe(404);
    });
  });

  describe("Crafting mode routes", () => {
    it("POST /api/crafting/start creates a game", async () => {
      const res = await request(app)
        .post("/api/crafting/start")
        .send({ guessLimit: null });
      expect(res.status).toBe(200);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.grid).toBeDefined();
      expect(res.body.revealedSlots).toEqual([]);
    });

    it("POST /api/crafting/guess works", async () => {
      const start = await request(app)
        .post("/api/crafting/start")
        .send({ guessLimit: null });
      const res = await request(app)
        .post("/api/crafting/guess")
        .send({ sessionId: start.body.sessionId, guess: "Diamond Sword" });
      expect(res.status).toBe(200);
      expect(res.body.grid).toBeDefined();
    });
  });

  describe("Texture mode routes", () => {
    it("POST /api/texture/start creates a game", async () => {
      const res = await request(app)
        .post("/api/texture/start")
        .send({ guessLimit: null });
      expect(res.status).toBe(200);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.cropLevel).toBe(0);
      expect(res.body.imageData).toBeDefined();
    });

    it("POST /api/texture/guess zooms out on wrong guess", async () => {
      const start = await request(app)
        .post("/api/texture/start")
        .send({ guessLimit: null });
      const res = await request(app)
        .post("/api/texture/guess")
        .send({ sessionId: start.body.sessionId, guess: "Dirt" });
      expect(res.status).toBe(200);
    });
  });

  describe("Sound mode routes", () => {
    it("POST /api/sound/start creates a game", async () => {
      const res = await request(app)
        .post("/api/sound/start")
        .send({ guessLimit: null });
      expect(res.status).toBe(200);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.soundUrl).toBeDefined();
    });

    it("POST /api/sound/guess works", async () => {
      const start = await request(app)
        .post("/api/sound/start")
        .send({ guessLimit: null });
      const res = await request(app)
        .post("/api/sound/guess")
        .send({ sessionId: start.body.sessionId, guess: "Creeper" });
      expect(res.status).toBe(200);
      expect(typeof res.body.correct).toBe("boolean");
    });
  });
});
