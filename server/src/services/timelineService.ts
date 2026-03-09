import { getClassicEntities } from "../data/dataLoader";
import { createSession, getSession, updateSession } from "./sessionService";
import {
  ClassicEntity,
  TimelineSession,
  TimelineStartResponse,
  TimelineGuessResponse,
  AnswerResponse,
} from "../types";

/**
 * Compare two version strings (e.g. "1.0", "1.19.3").
 * Returns negative if a < b, positive if a > b, 0 if equal.
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

function getRandomEntity(): ClassicEntity {
  const entities = getClassicEntities();
  return entities[Math.floor(Math.random() * entities.length)];
}

function getRandomEntityExcluding(excludeId: string): ClassicEntity {
  const entities = getClassicEntities().filter((e) => e.id !== excludeId);
  return entities[Math.floor(Math.random() * entities.length)];
}

function findEntityById(id: string): ClassicEntity | undefined {
  return getClassicEntities().find((e) => e.id === id);
}

function entityInfo(entity: ClassicEntity) {
  return {
    id: entity.id,
    name: entity.name,
    textureUrl: entity.textureUrl,
    versionAdded: entity.versionAdded,
  };
}

/**
 * Start a new timeline game round.
 * Shows an entity and prepares a next entity for comparison.
 */
export function startTimelineGame(): TimelineStartResponse {
  const current = getRandomEntity();
  const next = getRandomEntityExcluding(current.id);

  const sessionId = createSession("timeline", current.id, null, {
    currentEntityId: current.id,
    nextEntityId: next.id,
    streak: 0,
    bestStreak: 0,
    lastResult: null,
  } as Partial<TimelineSession>);

  return {
    sessionId,
    currentEntity: entityInfo(current),
    nextEntity: {
      id: next.id,
      name: next.name,
      textureUrl: next.textureUrl,
    },
    streak: 0,
    bestStreak: 0,
  };
}

/**
 * Process a timeline guess ("higher" or "lower").
 * The player guesses whether the next entity's versionAdded is higher or lower.
 */
export function guessTimeline(
  sessionId: string,
  guess: string,
): TimelineGuessResponse | { error: string } {
  const session = getSession(sessionId) as TimelineSession | undefined;
  if (!session) return { error: "Session not found" };
  if (session.solved) return { error: "Game already completed" };

  if (guess !== "higher" && guess !== "lower") {
    return { error: "Guess must be 'higher' or 'lower'" };
  }

  const currentEntity = findEntityById(session.currentEntityId);
  const nextEntity = findEntityById(session.nextEntityId);
  if (!currentEntity || !nextEntity) return { error: "Entity not found" };

  const cmp = compareVersions(
    nextEntity.versionAdded,
    currentEntity.versionAdded,
  );

  let correctAnswer: "higher" | "lower" | "same";
  if (cmp > 0) correctAnswer = "higher";
  else if (cmp < 0) correctAnswer = "lower";
  else correctAnswer = "same";

  // "same" counts as correct for either guess
  const correct = correctAnswer === "same" || guess === correctAnswer;

  session.guesses.push(guess);

  if (correct) {
    session.streak += 1;
    if (session.streak > session.bestStreak) {
      session.bestStreak = session.streak;
    }

    // Advance: the next entity becomes the current, pick a new next
    session.currentEntityId = session.nextEntityId;
    const newNext = getRandomEntityExcluding(session.currentEntityId);
    session.nextEntityId = newNext.id;

    return {
      correct: true,
      correctAnswer,
      previousEntity: entityInfo(currentEntity),
      nextEntity: entityInfo(findEntityById(session.currentEntityId)!),
      upcomingEntity: {
        id: newNext.id,
        name: newNext.name,
        textureUrl: newNext.textureUrl,
      },
      streak: session.streak,
      bestStreak: session.bestStreak,
      gameOver: false,
    };
  } else {
    // Wrong — game over
    session.solved = true;
    return {
      correct: false,
      correctAnswer,
      previousEntity: entityInfo(currentEntity),
      nextEntity: entityInfo(nextEntity),
      streak: session.streak,
      bestStreak: session.bestStreak,
      gameOver: true,
    };
  }
}

/**
 * Reveal the answer (returns the current target entity info).
 */
export function getTimelineAnswer(
  sessionId: string,
): AnswerResponse | { error: string } {
  const session = getSession(sessionId) as TimelineSession | undefined;
  if (!session) return { error: "Session not found" };

  const entity = findEntityById(session.nextEntityId);
  if (!entity) return { error: "Entity not found" };

  session.solved = true;

  return {
    id: entity.id,
    name: entity.name,
    textureUrl: entity.textureUrl,
    wikiUrl: entity.wikiUrl,
  };
}
