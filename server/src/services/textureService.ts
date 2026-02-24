import { getItems } from '../data/dataLoader';
import { createSession, getSession, getGuessesRemaining } from './sessionService';
import { ItemOrBlock, TextureSession, TextureStartResponse, TextureGuessResponse, AnswerResponse } from '../types';

// Crop levels: 0 = 4x4 crop, 1 = 6x6, 2 = 8x8, 3 = 10x10, 4 = 12x12, 5 = full 16x16
export const CROP_SIZES = [4, 6, 8, 10, 12, 16];
export const MAX_CROP_LEVEL = CROP_SIZES.length - 1;

function getRandomItem(): ItemOrBlock {
  const items = getItems();
  return items[Math.floor(Math.random() * items.length)];
}

function findItemById(id: string): ItemOrBlock | undefined {
  return getItems().find((i) => i.id === id);
}

function findItemByName(name: string): ItemOrBlock | undefined {
  return getItems().find(
    (i) => i.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Generate crop data for a given crop level.
 * In a real implementation this would crop the actual texture image.
 * For now we return metadata about the crop.
 */
function getCropData(item: ItemOrBlock, cropLevel: number) {
  const size = CROP_SIZES[Math.min(cropLevel, MAX_CROP_LEVEL)];
  return {
    cropLevel,
    cropSize: size,
    textureUrl: item.textureUrl,
    // In production, this would be a base64 image of the crop
    imageData: `crop:${item.id}:${size}x${size}`,
  };
}

export function startTextureGame(guessLimit: number | null): TextureStartResponse {
  const item = getRandomItem();
  const sessionId = createSession('texture', item.id, guessLimit, {
    cropLevel: 0,
  } as Partial<TextureSession>);

  const cropData = getCropData(item, 0);

  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    cropLevel: cropData.cropLevel,
    imageData: cropData.imageData,
  };
}

export function guessTexture(sessionId: string, guessName: string): TextureGuessResponse | { error: string } {
  const session = getSession(sessionId) as TextureSession | undefined;
  if (!session) return { error: 'Session not found' };
  if (session.solved) return { error: 'Game already completed' };

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0) return { error: 'No guesses remaining' };

  const target = findItemById(session.targetId);
  if (!target) return { error: 'Item not found' };

  const guessItem = findItemByName(guessName);
  session.guesses.push(guessName);

  const correct = guessItem?.id === target.id;
  if (correct) {
    session.solved = true;
    session.cropLevel = MAX_CROP_LEVEL;
  } else {
    // Zoom out
    session.cropLevel = Math.min((session.cropLevel || 0) + 1, MAX_CROP_LEVEL);
  }

  const cropData = getCropData(target, session.cropLevel);

  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    cropLevel: cropData.cropLevel,
    imageData: cropData.imageData,
  };
}

export function getTextureAnswer(sessionId: string): AnswerResponse | { error: string } {
  const session = getSession(sessionId);
  if (!session) return { error: 'Session not found' };

  const target = findItemById(session.targetId);
  if (!target) return { error: 'Item not found' };

  session.solved = true;

  return {
    id: target.id,
    name: target.name,
    textureUrl: target.textureUrl,
    wikiUrl: target.wikiUrl,
  };
}
