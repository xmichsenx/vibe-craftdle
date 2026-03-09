import { Router, Request, Response } from "express";
import {
  startTimelineGame,
  guessTimeline,
  getTimelineAnswer,
} from "../services/timelineService";

const router = Router();

/** Start a new timeline round */
router.post("/start", (_req: Request, res: Response) => {
  const result = startTimelineGame();
  res.json(result);
});

/** Guess "higher" or "lower" */
router.post("/guess", (req: Request, res: Response) => {
  const { sessionId, guess } = req.body;
  if (
    !sessionId ||
    !guess ||
    typeof sessionId !== "string" ||
    typeof guess !== "string" ||
    sessionId.length > 100
  ) {
    return res.status(400).json({ error: "sessionId and guess are required" });
  }
  const result = guessTimeline(sessionId, guess);
  if ("error" in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

/** Reveal the answer */
router.get("/answer/:sessionId", (req: Request, res: Response) => {
  const result = getTimelineAnswer(req.params.sessionId);
  if ("error" in result) {
    return res.status(404).json(result);
  }
  res.json(result);
});

export default router;
