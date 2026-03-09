/**
 * Client-side Silhouette mode engine.
 */
import { getMobs } from "./dataStore";
import {
  createSession,
  getSession,
  getGuessesRemaining,
} from "./sessionManager";
import type {
  SilhouetteStartResponse,
  SilhouetteGuessResponse,
  AnswerResponse,
} from "../types";

const OPACITY_LEVELS = [1.0, 0.85, 0.7, 0.55, 0.4, 0.0];
const MAX_REVEAL_STEP = OPACITY_LEVELS.length - 1;

function getRandomMob() {
  const m = getMobs();
  return m[Math.floor(Math.random() * m.length)];
}

function findMobById(id: string) {
  return getMobs().find((m) => m.id === id);
}

function findMobByName(name: string) {
  return getMobs().find((m) => m.name.toLowerCase() === name.toLowerCase());
}

export function startSilhouetteGame(
  guessLimit: number | null,
): SilhouetteStartResponse {
  const mob = getRandomMob();
  const sessionId = createSession("silhouette", mob.id, guessLimit, {
    opacity: OPACITY_LEVELS[0],
  });

  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    textureUrl: mob.textureUrl,
    opacity: OPACITY_LEVELS[0],
  };
}

export function guessSilhouette(
  sessionId: string,
  guessName: string,
): SilhouetteGuessResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.solved) throw new Error("Game already completed");

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    throw new Error("No guesses remaining");

  const target = findMobById(session.targetId);
  if (!target) throw new Error("Mob not found");

  const guessMob = findMobByName(guessName);
  session.guesses.push(guessName);

  const correct = guessMob?.id === target.id;
  if (correct) {
    session.solved = true;
    session.opacity = 0;
  } else {
    const currentStep = OPACITY_LEVELS.indexOf(session.opacity as number);
    const nextStep = Math.min(
      (currentStep === -1 ? 0 : currentStep) + 1,
      MAX_REVEAL_STEP,
    );
    session.opacity = OPACITY_LEVELS[nextStep];
  }

  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    opacity: session.opacity as number,
  };
}

export function getSilhouetteAnswer(sessionId: string): AnswerResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const target = findMobById(session.targetId);
  if (!target) throw new Error("Mob not found");

  session.solved = true;
  return {
    id: target.id,
    name: target.name,
    textureUrl: target.textureUrl,
    wikiUrl: target.wikiUrl,
  };
}
