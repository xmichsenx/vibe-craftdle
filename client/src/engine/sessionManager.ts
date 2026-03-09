/**
 * Client-side session manager.
 * Stores game sessions in memory (same as the server did, but in the browser).
 */

interface BaseSession {
  id: string;
  mode: string;
  targetId: string;
  guessLimit: number | null;
  guesses: string[];
  solved: boolean;
  [key: string]: unknown;
}

const sessions = new Map<string, BaseSession>();

let idCounter = 0;

function generateId(): string {
  idCounter++;
  return `s_${Date.now()}_${idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createSession(
  mode: string,
  targetId: string,
  guessLimit: number | null,
  extra?: Record<string, unknown>,
): string {
  const id = generateId();
  const session: BaseSession = {
    id,
    mode,
    targetId,
    guessLimit,
    guesses: [],
    solved: false,
    ...extra,
  };
  sessions.set(id, session);
  return id;
}

export function getSession(id: string): BaseSession | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

export function getGuessesRemaining(session: BaseSession): number | null {
  if (session.guessLimit === null) return null;
  return Math.max(0, session.guessLimit - session.guesses.length);
}
