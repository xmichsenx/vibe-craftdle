/**
 * Client-side API layer — all game logic runs locally in the browser.
 * No backend server required; data is loaded from static JSON files.
 */
import {
  SearchResult,
  ClassicStartResponse,
  ClassicGuessResponse,
  CraftingStartResponse,
  CraftingGuessResponse,
  TextureStartResponse,
  TextureGuessResponse,
  SoundStartResponse,
  SoundGuessResponse,
  SilhouetteStartResponse,
  SilhouetteGuessResponse,
  TimelineStartResponse,
  TimelineGuessResponse,
  ReverseCraftingStartResponse,
  ReverseCraftingGuessResponse,
  AnswerResponse,
} from "../types";
import {
  loadAllData,
  isDataLoaded,
  searchEntities,
  searchCraftableItems,
  searchMobs,
} from "../engine/dataStore";
import {
  startClassicGame,
  guessClassic as classicGuess,
  getClassicAnswer as classicAnswer,
} from "../engine/classicEngine";
import {
  startCraftingGame,
  guessCrafting as craftingGuess,
  getCraftingAnswer as craftingAnswer,
} from "../engine/craftingEngine";
import {
  startTextureGame,
  guessTexture as textureGuess,
  getTextureAnswer as textureAnswer,
} from "../engine/textureEngine";
import {
  startSoundGame,
  guessSound as soundGuess,
  getSoundAnswer as soundAnswer,
} from "../engine/soundEngine";
import {
  startSilhouetteGame,
  guessSilhouette as silhouetteGuess,
  getSilhouetteAnswer as silhouetteAnswer,
} from "../engine/silhouetteEngine";
import {
  startTimelineGame,
  guessTimeline as timelineGuess,
  getTimelineAnswer as timelineAnswer,
} from "../engine/timelineEngine";
import {
  startReverseCraftingGame,
  guessReverseCrafting as reverseCraftingGuess,
  getReverseCraftingAnswer as reverseCraftingAnswer,
} from "../engine/reverseCraftingEngine";

/** Ensure game data is loaded before any operation. */
async function ensureData(): Promise<void> {
  if (!isDataLoaded()) {
    await loadAllData();
  }
}

// Search
export async function searchItems(
  query: string,
  mode?: string,
): Promise<SearchResult[]> {
  await ensureData();
  if (mode === "crafting") return searchCraftableItems(query, 10);
  if (mode === "silhouette") return searchMobs(query, 10);
  return searchEntities(query, 10);
}

// Classic
export async function startClassic(
  guessLimit: number | null,
): Promise<ClassicStartResponse> {
  await ensureData();
  return startClassicGame(guessLimit);
}

export async function guessClassic(
  sessionId: string,
  guess: string,
): Promise<ClassicGuessResponse> {
  return classicGuess(sessionId, guess);
}

export async function getClassicAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return classicAnswer(sessionId);
}

// Crafting
export async function startCrafting(
  guessLimit: number | null,
): Promise<CraftingStartResponse> {
  await ensureData();
  return startCraftingGame(guessLimit);
}

export async function guessCrafting(
  sessionId: string,
  guess: string,
): Promise<CraftingGuessResponse> {
  return craftingGuess(sessionId, guess);
}

export async function getCraftingAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return craftingAnswer(sessionId);
}

// Texture
export async function startTexture(
  guessLimit: number | null,
): Promise<TextureStartResponse> {
  await ensureData();
  return startTextureGame(guessLimit);
}

export async function guessTexture(
  sessionId: string,
  guess: string,
): Promise<TextureGuessResponse> {
  return textureGuess(sessionId, guess);
}

export async function getTextureAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return textureAnswer(sessionId);
}

// Sound
export async function startSound(
  guessLimit: number | null,
): Promise<SoundStartResponse> {
  await ensureData();
  return startSoundGame(guessLimit);
}

export async function guessSound(
  sessionId: string,
  guess: string,
): Promise<SoundGuessResponse> {
  return soundGuess(sessionId, guess);
}

export async function getSoundAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return soundAnswer(sessionId);
}

// Silhouette
export async function startSilhouette(
  guessLimit: number | null,
): Promise<SilhouetteStartResponse> {
  await ensureData();
  return startSilhouetteGame(guessLimit);
}

export async function guessSilhouette(
  sessionId: string,
  guess: string,
): Promise<SilhouetteGuessResponse> {
  return silhouetteGuess(sessionId, guess);
}

export async function getSilhouetteAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return silhouetteAnswer(sessionId);
}

// Timeline
export async function startTimeline(): Promise<TimelineStartResponse> {
  await ensureData();
  return startTimelineGame();
}

export async function guessTimeline(
  sessionId: string,
  guess: string,
): Promise<TimelineGuessResponse> {
  return timelineGuess(sessionId, guess);
}

export async function getTimelineAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return timelineAnswer(sessionId);
}

// Reverse Crafting
export async function startReverseCrafting(
  guessLimit: number | null,
): Promise<ReverseCraftingStartResponse> {
  await ensureData();
  return startReverseCraftingGame(guessLimit);
}

export async function guessReverseCrafting(
  sessionId: string,
  guess: (string | null)[][],
): Promise<ReverseCraftingGuessResponse> {
  return reverseCraftingGuess(sessionId, guess);
}

export async function getReverseCraftingAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return reverseCraftingAnswer(sessionId);
}
