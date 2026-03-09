/**
 * Client-side Timeline mode engine.
 */
import { getClassicEntities, ClassicEntity } from "./dataStore";
import { createSession, getSession } from "./sessionManager";
import type {
  TimelineStartResponse,
  TimelineGuessResponse,
  AnswerResponse,
} from "../types";

function compareVersions(a: string, b: string): number {
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

export function startTimelineGame(): TimelineStartResponse {
  const current = getRandomEntity();
  const next = getRandomEntityExcluding(current.id);

  const sessionId = createSession("timeline", current.id, null, {
    currentEntityId: current.id,
    nextEntityId: next.id,
    streak: 0,
    bestStreak: 0,
    lastResult: null,
  });

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

export function guessTimeline(
  sessionId: string,
  guess: string,
): TimelineGuessResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.solved) throw new Error("Game already completed");

  if (guess !== "higher" && guess !== "lower") {
    throw new Error("Guess must be 'higher' or 'lower'");
  }

  const currentEntity = findEntityById(session.currentEntityId as string);
  const nextEntity = findEntityById(session.nextEntityId as string);
  if (!currentEntity || !nextEntity) throw new Error("Entity not found");

  const cmp = compareVersions(
    nextEntity.versionAdded,
    currentEntity.versionAdded,
  );

  let correctAnswer: "higher" | "lower" | "same";
  if (cmp > 0) correctAnswer = "higher";
  else if (cmp < 0) correctAnswer = "lower";
  else correctAnswer = "same";

  const correct = correctAnswer === "same" || guess === correctAnswer;

  session.guesses.push(guess);

  if (correct) {
    session.streak = ((session.streak as number) || 0) + 1;
    if ((session.streak as number) > ((session.bestStreak as number) || 0)) {
      session.bestStreak = session.streak;
    }

    session.currentEntityId = session.nextEntityId;
    const newNext = getRandomEntityExcluding(session.currentEntityId as string);
    session.nextEntityId = newNext.id;

    return {
      correct: true,
      correctAnswer,
      previousEntity: entityInfo(currentEntity),
      nextEntity: entityInfo(
        findEntityById(session.currentEntityId as string)!,
      ),
      upcomingEntity: {
        id: newNext.id,
        name: newNext.name,
        textureUrl: newNext.textureUrl,
      },
      streak: session.streak as number,
      bestStreak: session.bestStreak as number,
      gameOver: false,
    };
  } else {
    session.solved = true;
    return {
      correct: false,
      correctAnswer,
      previousEntity: entityInfo(currentEntity),
      nextEntity: entityInfo(nextEntity),
      streak: session.streak as number,
      bestStreak: session.bestStreak as number,
      gameOver: true,
    };
  }
}

export function getTimelineAnswer(sessionId: string): AnswerResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const entity = findEntityById(session.nextEntityId as string);
  if (!entity) throw new Error("Entity not found");

  session.solved = true;
  return {
    id: entity.id,
    name: entity.name,
    textureUrl: entity.textureUrl,
    wikiUrl: entity.wikiUrl,
  };
}
