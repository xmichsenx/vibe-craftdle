// ============================================================
// Craftdle — Frontend TypeScript Types
// ============================================================

export interface SearchResult {
  id: string;
  name: string;
  textureUrl: string;
  type: string;
}

export interface AttributeFeedback {
  value: string | string[] | boolean;
  match: boolean;
}

export interface ClassicGuessFeedback {
  name: string;
  textureUrl: string;
  type: AttributeFeedback;
  dimension: AttributeFeedback;
  behavior: AttributeFeedback;
  stackable: AttributeFeedback;
  renewable: AttributeFeedback;
  versionAdded: AttributeFeedback;
}

// Classic mode
export interface ClassicStartResponse {
  sessionId: string;
  guessLimit: number | null;
  guessesRemaining: number | null;
  attributes: string[];
}

export interface ClassicGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  feedback: ClassicGuessFeedback;
}

// Crafting mode
export interface CraftingStartResponse {
  sessionId: string;
  guessLimit: number | null;
  guessesRemaining: number | null;
  grid: (string | null)[][];
  revealedSlots: number[];
  ingredientIcons: Record<string, string>;
}

export interface CraftingGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  grid: (string | null)[][];
  revealedSlots: number[];
  ingredientIcons: Record<string, string>;
}

// Texture mode
export interface TextureStartResponse {
  sessionId: string;
  guessLimit: number | null;
  guessesRemaining: number | null;
  cropLevel: number;
  imageData: string;
  centerX: number;
  centerY: number;
}

export interface TextureGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  cropLevel: number;
  imageData: string;
  centerX: number;
  centerY: number;
}

// Sound mode
export interface SoundStartResponse {
  sessionId: string;
  guessLimit: number | null;
  guessesRemaining: number | null;
  soundUrl: string;
}

export interface SoundGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
}

// Silhouette mode
export interface SilhouetteStartResponse {
  sessionId: string;
  guessLimit: number | null;
  guessesRemaining: number | null;
  textureUrl: string;
  opacity: number;
}

export interface SilhouetteGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  opacity: number;
}

// Timeline mode
export interface TimelineStartResponse {
  sessionId: string;
  currentEntity: {
    id: string;
    name: string;
    textureUrl: string;
    versionAdded: string;
  };
  nextEntity: {
    id: string;
    name: string;
    textureUrl: string;
  };
  streak: number;
  bestStreak: number;
}

export interface TimelineGuessResponse {
  correct: boolean;
  correctAnswer: "higher" | "lower" | "same";
  previousEntity: {
    id: string;
    name: string;
    textureUrl: string;
    versionAdded: string;
  };
  nextEntity: {
    id: string;
    name: string;
    textureUrl: string;
    versionAdded: string;
  } | null;
  upcomingEntity?: {
    id: string;
    name: string;
    textureUrl: string;
  };
  streak: number;
  bestStreak: number;
  gameOver: boolean;
}

// Reverse crafting mode
export interface ReverseCraftingStartResponse {
  sessionId: string;
  guessLimit: number | null;
  guessesRemaining: number | null;
  outputItem: { id: string; name: string; textureUrl: string };
  gridSize: number;
  availableIngredients: string[];
  ingredientIcons: Record<string, string>;
  lockedSlots: number[];
  playerGrid: (string | null)[][];
}

export interface ReverseCraftingGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  correctCount: number;
  totalFilledSlots: number;
  lockedSlots: number[];
  playerGrid: (string | null)[][];
  ingredientIcons: Record<string, string>;
}

// Answer (shared)
export interface AnswerResponse {
  id: string;
  name: string;
  textureUrl: string;
  wikiUrl: string;
}

export type GameMode =
  | "classic"
  | "crafting"
  | "texture"
  | "sound"
  | "silhouette"
  | "timeline"
  | "reverse-crafting";
