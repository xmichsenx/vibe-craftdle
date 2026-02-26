import { useState, useCallback } from "react";
import { AnswerResponse, SearchResult } from "../types";

/**
 * Generic game state hook shared by all 4 game modes.
 *
 * Each mode provides its own `startApi`, `guessApi`, and `answerApi` functions,
 * plus an `onStartResponse` and `onGuessResponse` callback to extract mode-specific
 * data from the API responses.
 *
 * Returns all shared state (sessionId, guessLimit, gameOver, won, answer, error,
 * guessesRemaining, pastGuesses) and handlers (setGuessLimit, start, guess, giveUp, playAgain).
 */

interface UseGameOptions<TStartRes, TGuessRes> {
  /** API call to start a new round */
  startApi: (guessLimit: number | null) => Promise<TStartRes>;
  /** API call to submit a guess */
  guessApi: (sessionId: string, guess: string) => Promise<TGuessRes>;
  /** API call to reveal the answer */
  answerApi: (sessionId: string) => Promise<AnswerResponse>;
  /** Extract sessionId and guessesRemaining from the start response */
  onStartResponse: (res: TStartRes) => {
    sessionId: string;
    guessesRemaining: number | null;
  };
  /** Extract correct, guessesRemaining from the guess response */
  onGuessResponse: (res: TGuessRes) => {
    correct: boolean;
    guessesRemaining: number | null;
  };
}

export interface GameState {
  sessionId: string | null;
  guessLimit: number | null;
  guessesRemaining: number | null;
  pastGuesses: string[];
  gameOver: boolean;
  won: boolean;
  answer: AnswerResponse | null;
  error: string;
}

export interface GameActions {
  setGuessLimit: (val: number | null) => void;
  start: () => Promise<void>;
  guess: (item: SearchResult) => Promise<void>;
  giveUp: () => Promise<void>;
  playAgain: () => void;
}

export function useGame<TStartRes, TGuessRes>(
  options: UseGameOptions<TStartRes, TGuessRes>,
): GameState &
  GameActions & {
    startResponse: TStartRes | null;
    lastGuessResponse: TGuessRes | null;
  } {
  const { startApi, guessApi, answerApi, onStartResponse, onGuessResponse } =
    options;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [guessLimit, setGuessLimit] = useState<number | null>(null);
  const [guessesRemaining, setGuessesRemaining] = useState<number | null>(null);
  const [pastGuesses, setPastGuesses] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [answer, setAnswer] = useState<AnswerResponse | null>(null);
  const [error, setError] = useState("");
  const [startResponse, setStartResponse] = useState<TStartRes | null>(null);
  const [lastGuessResponse, setLastGuessResponse] = useState<TGuessRes | null>(
    null,
  );

  const start = useCallback(async () => {
    try {
      const res = await startApi(guessLimit);
      const { sessionId: sid, guessesRemaining: gr } = onStartResponse(res);
      setSessionId(sid);
      setGuessesRemaining(gr);
      setStartResponse(res);
      setLastGuessResponse(null);
      setPastGuesses([]);
      setGameOver(false);
      setWon(false);
      setAnswer(null);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }, [guessLimit, startApi, onStartResponse]);

  const guess = useCallback(
    async (item: SearchResult) => {
      if (!sessionId || gameOver) return;
      try {
        const res = await guessApi(sessionId, item.name);
        setLastGuessResponse(res);
        const { correct, guessesRemaining: gr } = onGuessResponse(res);
        setGuessesRemaining(gr);
        setPastGuesses((prev) => [...prev, item.name]);

        if (correct) {
          setWon(true);
          setGameOver(true);
          const ans = await answerApi(sessionId);
          setAnswer(ans);
        } else if (gr !== null && gr <= 0) {
          setGameOver(true);
          const ans = await answerApi(sessionId);
          setAnswer(ans);
        }
        setError("");
      } catch (e: any) {
        setError(e.message);
      }
    },
    [sessionId, gameOver, guessApi, answerApi, onGuessResponse],
  );

  const giveUp = useCallback(async () => {
    if (!sessionId) return;
    setGameOver(true);
    const ans = await answerApi(sessionId);
    setAnswer(ans);
  }, [sessionId, answerApi]);

  const playAgain = useCallback(() => {
    setSessionId(null);
    setStartResponse(null);
    setLastGuessResponse(null);
    setPastGuesses([]);
    setGameOver(false);
    setWon(false);
    setAnswer(null);
  }, []);

  return {
    sessionId,
    guessLimit,
    guessesRemaining,
    pastGuesses,
    gameOver,
    won,
    answer,
    error,
    startResponse,
    lastGuessResponse,
    setGuessLimit,
    start,
    guess,
    giveUp,
    playAgain,
  };
}
