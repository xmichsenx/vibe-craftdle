import { Router, Request, Response } from "express";

/**
 * Creates a standard game mode router with start/guess/answer endpoints.
 *
 * Every game mode follows the same REST pattern:
 *   POST /start  → startFn(guessLimit) → response
 *   POST /guess  → guessFn(sessionId, guess) → response | { error }
 *   GET  /answer/:sessionId → answerFn(sessionId) → response | { error }
 */
export function createGameRouter(handlers: {
  start: (guessLimit: number | null) => any;
  guess: (sessionId: string, guessName: string) => any;
  answer: (sessionId: string) => any;
}): Router {
  const router = Router();

  router.post("/start", (req: Request, res: Response) => {
    const { guessLimit = null } = req.body;
    const result = handlers.start(guessLimit);
    res.json(result);
  });

  router.post("/guess", (req: Request, res: Response) => {
    const { sessionId, guess } = req.body;
    if (!sessionId || !guess) {
      return res
        .status(400)
        .json({ error: "sessionId and guess are required" });
    }
    const result = handlers.guess(sessionId, guess);
    if ("error" in result) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  router.get("/answer/:sessionId", (req: Request, res: Response) => {
    const result = handlers.answer(req.params.sessionId);
    if ("error" in result) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  return router;
}
