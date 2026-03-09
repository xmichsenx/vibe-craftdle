/**
 * Client-side Texture Close-up mode engine.
 */
import { getItems, ItemOrBlock } from "./dataStore";
import {
  createSession,
  getSession,
  getGuessesRemaining,
} from "./sessionManager";
import type {
  TextureStartResponse,
  TextureGuessResponse,
  AnswerResponse,
} from "../types";

const CROP_SIZES = [4, 6, 8, 10, 12, 16];
const MAX_CROP_LEVEL = CROP_SIZES.length - 1;

function getRandomItem(): ItemOrBlock {
  const items = getItems();
  return items[Math.floor(Math.random() * items.length)];
}

function findItemById(id: string): ItemOrBlock | undefined {
  return getItems().find((i) => i.id === id);
}

function findItemByName(name: string): ItemOrBlock | undefined {
  return getItems().find((i) => i.name.toLowerCase() === name.toLowerCase());
}

export function startTextureGame(
  guessLimit: number | null,
): TextureStartResponse {
  const item = getRandomItem();
  const centerX = 0.2 + Math.random() * 0.6;
  const centerY = 0.2 + Math.random() * 0.6;

  const sessionId = createSession("texture", item.id, guessLimit, {
    cropLevel: 0,
    centerX,
    centerY,
  });

  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    cropLevel: 0,
    imageData: item.textureUrl,
    centerX,
    centerY,
  };
}

export function guessTexture(
  sessionId: string,
  guessName: string,
): TextureGuessResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.solved) throw new Error("Game already completed");

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    throw new Error("No guesses remaining");

  const target = findItemById(session.targetId);
  if (!target) throw new Error("Item not found");

  const guessItem = findItemByName(guessName);
  session.guesses.push(guessName);

  const correct = guessItem?.id === target.id;
  if (correct) {
    session.solved = true;
    session.cropLevel = MAX_CROP_LEVEL;
  } else {
    session.cropLevel = Math.min(
      ((session.cropLevel as number) || 0) + 1,
      MAX_CROP_LEVEL,
    );
  }

  const cX = (session.centerX as number) ?? 0.5;
  const cY = (session.centerY as number) ?? 0.5;

  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    cropLevel: session.cropLevel as number,
    imageData: target.textureUrl,
    centerX: cX,
    centerY: cY,
  };
}

export function getTextureAnswer(sessionId: string): AnswerResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const target = findItemById(session.targetId);
  if (!target) throw new Error("Item not found");

  session.solved = true;
  return {
    id: target.id,
    name: target.name,
    textureUrl: target.textureUrl,
    wikiUrl: target.wikiUrl,
  };
}
