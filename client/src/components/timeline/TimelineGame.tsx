import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TimelineCard from "./TimelineCard";
import GuessLimitSelector from "../common/GuessLimitSelector";
import { startTimeline, guessTimeline } from "../../services/api";
import { TimelineStartResponse, TimelineGuessResponse } from "../../types";

/**
 * Timeline / "Higher or Lower" game mode.
 * Players see an entity and guess whether the next one was added in a
 * higher or lower Minecraft version. Streak-based — game ends on first wrong answer.
 */
export default function TimelineGame() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentEntity, setCurrentEntity] = useState<
    TimelineStartResponse["currentEntity"] | null
  >(null);
  const [nextEntity, setNextEntity] = useState<
    TimelineStartResponse["nextEntity"] | null
  >(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastResult, setLastResult] = useState<TimelineGuessResponse | null>(
    null,
  );
  const [error, setError] = useState("");

  const start = useCallback(async () => {
    try {
      const res = await startTimeline();
      setSessionId(res.sessionId);
      setCurrentEntity(res.currentEntity);
      setNextEntity(res.nextEntity);
      setStreak(0);
      setBestStreak(0);
      setGameOver(false);
      setLastResult(null);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const guess = useCallback(
    async (choice: "higher" | "lower") => {
      if (!sessionId || gameOver) return;
      try {
        const res = await guessTimeline(sessionId, choice);
        setLastResult(res);
        setStreak(res.streak);
        setBestStreak(res.bestStreak);

        if (res.correct && res.nextEntity) {
          // Advance to next entity
          setCurrentEntity(res.nextEntity);
          setNextEntity(res.upcomingEntity ?? null);
        }
        if (res.gameOver) {
          setGameOver(true);
        }
        setError("");
      } catch (e: any) {
        setError(e.message);
      }
    },
    [sessionId, gameOver],
  );

  // Pre-game start screen
  if (!sessionId) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="font-minecraft text-xl text-mc-gold">Higher or Lower</h2>
        <p className="text-mc-gray text-sm max-w-md text-center">
          Was this item added in a higher or lower Minecraft version? Build your
          streak!
        </p>
        <button onClick={start} className="mc-btn-primary">
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4">
        <h2 className="font-minecraft text-sm text-mc-gold">Higher or Lower</h2>
        <div className="flex gap-4 items-center">
          <span className="font-minecraft text-xs text-mc-gray">
            Streak: <span className="text-mc-green">{streak}</span>
          </span>
          <span className="font-minecraft text-xs text-mc-gray">
            Best: <span className="text-mc-gold">{bestStreak}</span>
          </span>
        </div>
      </div>

      {error && <p className="text-mc-red text-xs">{error}</p>}

      {/* Last result feedback */}
      {lastResult && !lastResult.gameOver && (
        <div className="text-center">
          <span className="font-minecraft text-xs text-mc-green">
            Correct! {lastResult.previousEntity.name} was v
            {lastResult.previousEntity.versionAdded}
          </span>
        </div>
      )}

      {/* Entity display: current (with version) and next (without version) */}
      {currentEntity && !gameOver && (
        <>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <TimelineCard
              entity={currentEntity}
              showVersion={true}
              label="Current"
            />

            <span className="font-minecraft text-2xl text-mc-gray">vs</span>

            {nextEntity && (
              <TimelineCard
                entity={{ ...nextEntity, versionAdded: "???" }}
                showVersion={false}
                label="Next"
              />
            )}
          </div>

          <p className="font-minecraft text-sm text-mc-gray text-center">
            Was{" "}
            <span className="text-mc-gold">
              {nextEntity?.name ?? "the next item"}
            </span>{" "}
            added in a <span className="text-mc-gold">higher</span> or{" "}
            <span className="text-mc-gold">lower</span> version?
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => guess("higher")}
              className="mc-btn-primary px-8 py-3"
            >
              ↑ Higher
            </button>
            <button
              onClick={() => guess("lower")}
              className="mc-btn-primary px-8 py-3"
            >
              ↓ Lower
            </button>
          </div>
        </>
      )}

      {/* Game over state */}
      {gameOver && lastResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="mc-card max-w-sm w-full text-center mx-4">
            <h2 className="font-minecraft text-lg mb-4 text-mc-red">
              Game Over!
            </h2>

            <div className="mb-4">
              <p className="text-mc-gray text-sm mb-2">
                <span className="text-mc-gold">
                  {lastResult.previousEntity.name}
                </span>{" "}
                = v{lastResult.previousEntity.versionAdded}
              </p>
              {lastResult.nextEntity && (
                <p className="text-mc-gray text-sm mb-2">
                  <span className="text-mc-gold">
                    {lastResult.nextEntity.name}
                  </span>{" "}
                  = v{lastResult.nextEntity.versionAdded}
                </p>
              )}
              <p className="text-mc-gray text-sm">
                The answer was{" "}
                <span className="text-mc-green font-minecraft">
                  {lastResult.correctAnswer}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <p className="font-minecraft text-sm text-mc-gray">
                Final streak:{" "}
                <span className="text-mc-green">{lastResult.streak}</span>
              </p>
              <p className="font-minecraft text-sm text-mc-gray">
                Best streak:{" "}
                <span className="text-mc-gold">{lastResult.bestStreak}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={start} className="mc-btn-primary">
                Play Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="mc-btn text-xs py-2"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
