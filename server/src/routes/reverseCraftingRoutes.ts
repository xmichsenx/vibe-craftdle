import { Router, Request, Response } from "express";
import {
  startReverseCraftingGame,
  guessReverseCrafting,
  getReverseCraftingAnswer,
} from "../services/reverseCraftingService";

const router = Router();

/** Start a new reverse crafting round */
router.post("/start", (req: Request, res: Response) => {
  const rawLimit = req.body.guessLimit ?? null;
  const guessLimit =
    rawLimit === null
      ? null
      : Number.isInteger(Number(rawLimit)) &&
          Number(rawLimit) > 0 &&
          Number(rawLimit) <= 100
        ? Number(rawLimit)
        : null;
  const result = startReverseCraftingGame(guessLimit);
  res.json(result);
});

/** Submit a grid placement guess (guess is a JSON-encoded 3x3 grid) */
router.post("/guess", (req: Request, res: Response) => {
  const { sessionId, guess } = req.body;
  if (
    !sessionId ||
    guess === undefined ||
    typeof sessionId !== "string" ||
    sessionId.length > 100
  ) {
    return res.status(400).json({ error: "sessionId and guess are required" });
  }
  // guess is the grid as a JSON string or object
  const guessStr =
    typeof guess === "string"
      ? guess.slice(0, 2000)
      : JSON.stringify(guess).slice(0, 2000);
  const result = guessReverseCrafting(sessionId, guessStr);
  if ("error" in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

/** Reveal the answer */
router.get("/answer/:sessionId", (req: Request, res: Response) => {
  const result = getReverseCraftingAnswer(req.params.sessionId);
  if ("error" in result) {
    return res.status(404).json(result);
  }
  res.json(result);
});

export default router;
