import { getMobs } from "../data/dataLoader";
import {
  createSession,
  getSession,
  getGuessesRemaining,
} from "./sessionService";
import {
  Mob,
  SilhouetteSession,
  SilhouetteStartResponse,
  SilhouetteGuessResponse,
  AnswerResponse,
} from "../types";

/** Opacity levels from fully blacked out to visible */
export const OPACITY_LEVELS = [1.0, 0.85, 0.7, 0.55, 0.4, 0.0];
export const MAX_REVEAL_STEP = OPACITY_LEVELS.length - 1;

function getRandomMob(): Mob {
  const mobs = getMobs();
  return mobs[Math.floor(Math.random() * mobs.length)];
}

function findMobById(id: string): Mob | undefined {
  return getMobs().find((m) => m.id === id);
}

function findMobByName(name: string): Mob | undefined {
  return getMobs().find((m) => m.name.toLowerCase() === name.toLowerCase());
}

/**
 * Start a new silhouette game round.
 * The mob's texture is returned but the client renders it as a black silhouette.
 */
export function startSilhouetteGame(
  guessLimit: number | null,
): SilhouetteStartResponse {
  const mob = getRandomMob();
  const sessionId = createSession("silhouette", mob.id, guessLimit, {
    opacity: OPACITY_LEVELS[0],
  } as Partial<SilhouetteSession>);

  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    textureUrl: mob.textureUrl,
    opacity: OPACITY_LEVELS[0],
  };
}

/**
 * Process a guess in silhouette mode.
 * On wrong guess, reduce the blackout opacity to reveal more of the mob.
 */
export function guessSilhouette(
  sessionId: string,
  guessName: string,
): SilhouetteGuessResponse | { error: string } {
  const session = getSession(sessionId) as SilhouetteSession | undefined;
  if (!session) return { error: "Session not found" };
  if (session.solved) return { error: "Game already completed" };

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    return { error: "No guesses remaining" };

  const target = findMobById(session.targetId);
  if (!target) return { error: "Mob not found" };

  const guessMob = findMobByName(guessName);
  session.guesses.push(guessName);

  const correct = guessMob?.id === target.id;
  if (correct) {
    session.solved = true;
    session.opacity = 0; // fully revealed
  } else {
    // Find current step and advance
    const currentStep = OPACITY_LEVELS.indexOf(session.opacity);
    const nextStep = Math.min(
      (currentStep === -1 ? 0 : currentStep) + 1,
      MAX_REVEAL_STEP,
    );
    session.opacity = OPACITY_LEVELS[nextStep];
  }

  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    opacity: session.opacity,
  };
}

/**
 * Reveal the answer for a silhouette game session.
 */
export function getSilhouetteAnswer(
  sessionId: string,
): AnswerResponse | { error: string } {
  const session = getSession(sessionId);
  if (!session) return { error: "Session not found" };

  const target = findMobById(session.targetId);
  if (!target) return { error: "Mob not found" };

  session.solved = true;

  return {
    id: target.id,
    name: target.name,
    textureUrl: target.textureUrl,
    wikiUrl: target.wikiUrl,
  };
}
