// ============================================================
// Craftdle — Shared TypeScript Types (Server)
// ============================================================

// --------------- Data Model Types ---------------

export interface ItemOrBlock {
  id: string;
  name: string;
  type: EntityType;
  dimension: Dimension[];
  stackable: boolean;
  renewable: boolean;
  versionAdded: string;
  textureUrl: string;
  wikiUrl: string;
}

export interface Mob {
  id: string;
  name: string;
  type: "Mob";
  dimension: Dimension[];
  behavior: MobBehavior;
  stackable: false;
  renewable: boolean;
  versionAdded: string;
  textureUrl: string;
  soundUrl?: string;
  wikiUrl: string;
}

export interface Biome {
  id: string;
  name: string;
  dimension: Dimension[];
  versionAdded: string;
  wikiUrl: string;
}

export interface CraftingRecipe {
  itemId: string;
  name: string;
  grid: (string | null)[][];
  shapeless: boolean;
}

export interface SoundEntry {
  id: string;
  entityId: string;
  name: string;
  soundFile: string;
  category: string;
}

// --------------- Enum-like Types ---------------

export type EntityType =
  | "Block"
  | "Item"
  | "Tool"
  | "Weapon"
  | "Armor"
  | "Food"
  | "Mob";
export type Dimension = "Overworld" | "Nether" | "End";
export type MobBehavior = "Hostile" | "Passive" | "Neutral";

// --------------- Classic Mode ---------------

export interface ClassicEntity {
  id: string;
  name: string;
  type: EntityType;
  dimension: Dimension[];
  behavior: MobBehavior | "N/A";
  stackable: boolean;
  renewable: boolean;
  versionAdded: string;
  textureUrl: string;
  wikiUrl: string;
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

// --------------- Game Session ---------------

export interface GameSession {
  id: string;
  mode:
    | "classic"
    | "crafting"
    | "texture"
    | "sound"
    | "silhouette"
    | "timeline"
    | "reverse-crafting";
  targetId: string;
  guessLimit: number | null; // null = unlimited
  guesses: string[];
  solved: boolean;
  createdAt: number;
}

export interface CraftingSession extends GameSession {
  mode: "crafting";
  revealedSlots: number[];
}

export interface TextureSession extends GameSession {
  mode: "texture";
  cropLevel: number; // 0 = most zoomed in, increases with wrong guesses
  centerX: number; // 0.0-1.0, crop center position
  centerY: number;
}

export interface SilhouetteSession extends GameSession {
  mode: "silhouette";
  opacity: number; // 1.0 = fully black, decreases with wrong guesses
}

export interface TimelineSession extends GameSession {
  mode: "timeline";
  currentEntityId: string; // entity currently shown
  nextEntityId: string; // upcoming entity for comparison
  streak: number;
  bestStreak: number;
  lastResult: "higher" | "lower" | null; // correct answer for last round
}

export interface ReverseCraftingSession extends GameSession {
  mode: "reverse-crafting";
  lockedSlots: number[]; // slots correctly placed (progressive assist)
  playerGrid: (string | null)[][]; // player's current placement
}

// --------------- API Request/Response ---------------

export interface StartGameRequest {
  guessLimit?: number | null;
}

export interface GuessRequest {
  sessionId: string;
  guess: string;
}

export interface StartGameResponse {
  sessionId: string;
  guessLimit: number | null;
  guessesRemaining: number | null;
}

export interface ClassicStartResponse extends StartGameResponse {
  attributes: string[];
}

export interface ClassicGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  feedback: ClassicGuessFeedback;
}

export interface CraftingStartResponse extends StartGameResponse {
  grid: (string | null)[][]; // all null initially
  revealedSlots: number[];
  ingredientIcons: Record<string, string>; // ingredient id → icon URL
}

export interface CraftingGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  grid: (string | null)[][];
  revealedSlots: number[];
  ingredientIcons: Record<string, string>;
}

export interface TextureStartResponse extends StartGameResponse {
  cropLevel: number;
  imageData: string; // URL of texture image
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

export interface SoundStartResponse extends StartGameResponse {
  soundUrl: string;
}

export interface SoundGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
}

// --------------- Silhouette Mode ---------------

export interface SilhouetteStartResponse extends StartGameResponse {
  textureUrl: string;
  opacity: number; // 1.0 = fully blacked out
}

export interface SilhouetteGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  opacity: number;
}

// --------------- Timeline Mode ---------------

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

// --------------- Reverse Crafting Mode ---------------

export interface ReverseCraftingStartResponse extends StartGameResponse {
  outputItem: { id: string; name: string; textureUrl: string };
  gridSize: number; // always 3
  availableIngredients: string[]; // ingredient IDs the player can place
  ingredientIcons: Record<string, string>;
  lockedSlots: number[];
  playerGrid: (string | null)[][];
}

export interface ReverseCraftingGuessResponse {
  correct: boolean;
  guessesRemaining: number | null;
  correctCount: number; // how many slots are correct
  totalFilledSlots: number; // total non-null slots in actual recipe
  lockedSlots: number[]; // slots that are now locked in (correct)
  playerGrid: (string | null)[][];
  ingredientIcons: Record<string, string>;
}

export interface AnswerResponse {
  id: string;
  name: string;
  textureUrl: string;
  wikiUrl: string;
}

export interface SearchResult {
  id: string;
  name: string;
  textureUrl: string;
  type: string;
}
