/**
 * Client-side Sound mode engine.
 */
import { getSounds, getMobs } from "./dataStore";
import {
  createSession,
  getSession,
  getGuessesRemaining,
} from "./sessionManager";
import type {
  SoundStartResponse,
  SoundGuessResponse,
  AnswerResponse,
} from "../types";

function getRandomSound() {
  const s = getSounds();
  return s[Math.floor(Math.random() * s.length)];
}

function findSoundByEntityId(entityId: string) {
  return getSounds().find((s) => s.entityId === entityId);
}

export function startSoundGame(guessLimit: number | null): SoundStartResponse {
  const sound = getRandomSound();
  const sessionId = createSession("sound", sound.entityId, guessLimit);
  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    soundUrl: sound.soundFile,
  };
}

export function guessSound(
  sessionId: string,
  guessName: string,
): SoundGuessResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.solved) throw new Error("Game already completed");

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    throw new Error("No guesses remaining");

  const targetSound = findSoundByEntityId(session.targetId);
  if (!targetSound) throw new Error("Sound not found");

  session.guesses.push(guessName);

  const correct = guessName.toLowerCase() === targetSound.name.toLowerCase();
  if (correct) session.solved = true;

  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
  };
}

export function getSoundAnswer(sessionId: string): AnswerResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const targetSound = findSoundByEntityId(session.targetId);
  if (!targetSound) throw new Error("Sound not found");

  session.solved = true;
  const mob = getMobs().find((m) => m.id === targetSound.entityId);

  return {
    id: targetSound.entityId,
    name: targetSound.name,
    textureUrl: mob?.textureUrl || "",
    wikiUrl:
      mob?.wikiUrl ||
      `https://minecraft.wiki/w/${targetSound.name.replace(/ /g, "_")}`,
  };
}
