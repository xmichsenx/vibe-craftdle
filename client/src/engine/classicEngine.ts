/**
 * Client-side Classic mode engine.
 */
import { getClassicEntities, ClassicEntity } from "./dataStore";
import {
  createSession,
  getSession,
  getGuessesRemaining,
} from "./sessionManager";
import type {
  ClassicStartResponse,
  ClassicGuessResponse,
  AnswerResponse,
} from "../types";

const ATTRIBUTES = [
  "type",
  "dimension",
  "behavior",
  "stackable",
  "renewable",
  "versionAdded",
];

function compareAttribute(
  guessVal: unknown,
  targetVal: unknown,
): { value: unknown; match: boolean } {
  if (Array.isArray(guessVal) && Array.isArray(targetVal)) {
    const match =
      guessVal.length === targetVal.length &&
      guessVal.every((v) => targetVal.includes(v));
    return { value: guessVal, match };
  }
  return { value: guessVal, match: guessVal === targetVal };
}

function compareClassicEntities(guess: ClassicEntity, target: ClassicEntity) {
  return {
    name: guess.name,
    textureUrl: guess.textureUrl,
    type: compareAttribute(guess.type, target.type),
    dimension: compareAttribute(guess.dimension, target.dimension),
    behavior: compareAttribute(guess.behavior, target.behavior),
    stackable: compareAttribute(guess.stackable, target.stackable),
    renewable: compareAttribute(guess.renewable, target.renewable),
    versionAdded: compareAttribute(guess.versionAdded, target.versionAdded),
  };
}

function getRandomEntity(): ClassicEntity {
  const entities = getClassicEntities();
  return entities[Math.floor(Math.random() * entities.length)];
}

function findEntityById(id: string): ClassicEntity | undefined {
  return getClassicEntities().find((e) => e.id === id);
}

function findEntityByName(name: string): ClassicEntity | undefined {
  return getClassicEntities().find(
    (e) => e.name.toLowerCase() === name.toLowerCase(),
  );
}

export function startClassicGame(
  guessLimit: number | null,
): ClassicStartResponse {
  const target = getRandomEntity();
  const sessionId = createSession("classic", target.id, guessLimit);
  return {
    sessionId,
    guessLimit,
    guessesRemaining: guessLimit,
    attributes: ATTRIBUTES,
  };
}

export function guessClassic(
  sessionId: string,
  guessName: string,
): ClassicGuessResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (session.solved) throw new Error("Game already completed");

  const remaining = getGuessesRemaining(session);
  if (remaining !== null && remaining <= 0)
    throw new Error("No guesses remaining");

  const guessEntity = findEntityByName(guessName);
  if (!guessEntity) throw new Error("Unknown entity");

  const target = findEntityById(session.targetId)!;
  session.guesses.push(guessEntity.id);

  const correct = guessEntity.id === target.id;
  if (correct) session.solved = true;

  const feedback = compareClassicEntities(guessEntity, target);
  return {
    correct,
    guessesRemaining: getGuessesRemaining(session),
    feedback: feedback as ClassicGuessResponse["feedback"],
  };
}

export function getClassicAnswer(sessionId: string): AnswerResponse {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const target = findEntityById(session.targetId);
  if (!target) throw new Error("Target not found");

  session.solved = true;
  return {
    id: target.id,
    name: target.name,
    textureUrl: target.textureUrl,
    wikiUrl: target.wikiUrl,
  };
}
