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

const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Search
export function searchItems(
  query: string,
  mode?: string,
): Promise<SearchResult[]> {
  let url = `/items/search?q=${encodeURIComponent(query)}`;
  if (mode) url += `&mode=${encodeURIComponent(mode)}`;
  return request<SearchResult[]>(url);
}

// Classic
export function startClassic(
  guessLimit: number | null,
): Promise<ClassicStartResponse> {
  return request<ClassicStartResponse>("/classic/start", {
    method: "POST",
    body: JSON.stringify({ guessLimit }),
  });
}

export function guessClassic(
  sessionId: string,
  guess: string,
): Promise<ClassicGuessResponse> {
  return request<ClassicGuessResponse>("/classic/guess", {
    method: "POST",
    body: JSON.stringify({ sessionId, guess }),
  });
}

export function getClassicAnswer(sessionId: string): Promise<AnswerResponse> {
  return request<AnswerResponse>(`/classic/answer/${sessionId}`);
}

// Crafting
export function startCrafting(
  guessLimit: number | null,
): Promise<CraftingStartResponse> {
  return request<CraftingStartResponse>("/crafting/start", {
    method: "POST",
    body: JSON.stringify({ guessLimit }),
  });
}

export function guessCrafting(
  sessionId: string,
  guess: string,
): Promise<CraftingGuessResponse> {
  return request<CraftingGuessResponse>("/crafting/guess", {
    method: "POST",
    body: JSON.stringify({ sessionId, guess }),
  });
}

export function getCraftingAnswer(sessionId: string): Promise<AnswerResponse> {
  return request<AnswerResponse>(`/crafting/answer/${sessionId}`);
}

// Texture
export function startTexture(
  guessLimit: number | null,
): Promise<TextureStartResponse> {
  return request<TextureStartResponse>("/texture/start", {
    method: "POST",
    body: JSON.stringify({ guessLimit }),
  });
}

export function guessTexture(
  sessionId: string,
  guess: string,
): Promise<TextureGuessResponse> {
  return request<TextureGuessResponse>("/texture/guess", {
    method: "POST",
    body: JSON.stringify({ sessionId, guess }),
  });
}

export function getTextureAnswer(sessionId: string): Promise<AnswerResponse> {
  return request<AnswerResponse>(`/texture/answer/${sessionId}`);
}

// Sound
export function startSound(
  guessLimit: number | null,
): Promise<SoundStartResponse> {
  return request<SoundStartResponse>("/sound/start", {
    method: "POST",
    body: JSON.stringify({ guessLimit }),
  });
}

export function guessSound(
  sessionId: string,
  guess: string,
): Promise<SoundGuessResponse> {
  return request<SoundGuessResponse>("/sound/guess", {
    method: "POST",
    body: JSON.stringify({ sessionId, guess }),
  });
}

export function getSoundAnswer(sessionId: string): Promise<AnswerResponse> {
  return request<AnswerResponse>(`/sound/answer/${sessionId}`);
}

// Silhouette
export function startSilhouette(
  guessLimit: number | null,
): Promise<SilhouetteStartResponse> {
  return request<SilhouetteStartResponse>("/silhouette/start", {
    method: "POST",
    body: JSON.stringify({ guessLimit }),
  });
}

export function guessSilhouette(
  sessionId: string,
  guess: string,
): Promise<SilhouetteGuessResponse> {
  return request<SilhouetteGuessResponse>("/silhouette/guess", {
    method: "POST",
    body: JSON.stringify({ sessionId, guess }),
  });
}

export function getSilhouetteAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return request<AnswerResponse>(`/silhouette/answer/${sessionId}`);
}

// Timeline
export function startTimeline(): Promise<TimelineStartResponse> {
  return request<TimelineStartResponse>("/timeline/start", {
    method: "POST",
  });
}

export function guessTimeline(
  sessionId: string,
  guess: string,
): Promise<TimelineGuessResponse> {
  return request<TimelineGuessResponse>("/timeline/guess", {
    method: "POST",
    body: JSON.stringify({ sessionId, guess }),
  });
}

export function getTimelineAnswer(sessionId: string): Promise<AnswerResponse> {
  return request<AnswerResponse>(`/timeline/answer/${sessionId}`);
}

// Reverse Crafting
export function startReverseCrafting(
  guessLimit: number | null,
): Promise<ReverseCraftingStartResponse> {
  return request<ReverseCraftingStartResponse>("/reverse-crafting/start", {
    method: "POST",
    body: JSON.stringify({ guessLimit }),
  });
}

export function guessReverseCrafting(
  sessionId: string,
  guess: (string | null)[][],
): Promise<ReverseCraftingGuessResponse> {
  return request<ReverseCraftingGuessResponse>("/reverse-crafting/guess", {
    method: "POST",
    body: JSON.stringify({ sessionId, guess }),
  });
}

export function getReverseCraftingAnswer(
  sessionId: string,
): Promise<AnswerResponse> {
  return request<AnswerResponse>(`/reverse-crafting/answer/${sessionId}`);
}
