import { v4 as uuidv4 } from "uuid";
import {
  GameSession,
  CraftingSession,
  TextureSession,
  SilhouetteSession,
  TimelineSession,
  ReverseCraftingSession,
} from "../types";

type AnySession =
  | GameSession
  | CraftingSession
  | TextureSession
  | SilhouetteSession
  | TimelineSession
  | ReverseCraftingSession;

const sessions = new Map<string, AnySession>();

// Auto-clean sessions older than 1 hour
const SESSION_TTL = 60 * 60 * 1000;
// Maximum number of concurrent sessions to prevent memory exhaustion
const MAX_SESSIONS = 10000;

/**
 * Periodically prune expired sessions to prevent memory leaks.
 */
function pruneExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(id);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(pruneExpiredSessions, 10 * 60 * 1000).unref();

export function createSession(
  mode: GameSession["mode"],
  targetId: string,
  guessLimit: number | null,
  extra?: Partial<AnySession>,
): string {
  // Prevent unbounded session growth
  if (sessions.size >= MAX_SESSIONS) {
    pruneExpiredSessions();
  }
  const id = uuidv4();
  const session: GameSession = {
    id,
    mode,
    targetId,
    guessLimit,
    guesses: [],
    solved: false,
    createdAt: Date.now(),
    ...extra,
  };
  sessions.set(id, session);
  return id;
}

export function getSession(id: string): AnySession | undefined {
  const session = sessions.get(id);
  if (session && Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(id);
    return undefined;
  }
  return session;
}

export function updateSession(id: string, updates: Partial<GameSession>): void {
  const session = sessions.get(id);
  if (session) {
    Object.assign(session, updates);
  }
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

export function getGuessesRemaining(session: GameSession): number | null {
  if (session.guessLimit === null) return null;
  return Math.max(0, session.guessLimit - session.guesses.length);
}
