import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReverseCraftingGrid from "./ReverseCraftingGrid";
import GuessLimitSelector from "../common/GuessLimitSelector";
import GameOverModal from "../common/GameOverModal";
import {
  startReverseCrafting,
  guessReverseCrafting,
  getReverseCraftingAnswer,
} from "../../services/api";
import {
  ReverseCraftingStartResponse,
  ReverseCraftingGuessResponse,
  AnswerResponse,
} from "../../types";

/**
 * Reverse Crafting mode — the player is shown the output item and
 * must place/guess the ingredients in the correct grid positions.
 */
export default function ReverseCraftingGame() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [guessLimit, setGuessLimit] = useState<number | null>(null);
  const [guessesRemaining, setGuessesRemaining] = useState<number | null>(null);
  const [outputItem, setOutputItem] = useState<
    ReverseCraftingStartResponse["outputItem"] | null
  >(null);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>(
    [],
  );
  const [ingredientIcons, setIngredientIcons] = useState<
    Record<string, string>
  >({});
  const [playerGrid, setPlayerGrid] = useState<(string | null)[][]>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [lockedSlots, setLockedSlots] = useState<number[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null,
  );
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [answer, setAnswer] = useState<AnswerResponse | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<string>("");

  const start = useCallback(async () => {
    try {
      const res = await startReverseCrafting(guessLimit);
      setSessionId(res.sessionId);
      setGuessesRemaining(res.guessesRemaining);
      setOutputItem(res.outputItem);
      setAvailableIngredients(res.availableIngredients);
      setIngredientIcons(res.ingredientIcons);
      setPlayerGrid([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      setLockedSlots([]);
      setSelectedIngredient(null);
      setGameOver(false);
      setWon(false);
      setAnswer(null);
      setError("");
      setFeedback("");
    } catch (e: any) {
      setError(e.message);
    }
  }, [guessLimit]);

  const handleSlotClick = useCallback(
    (row: number, col: number) => {
      setPlayerGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        if (newGrid[row][col] === selectedIngredient) {
          // Toggle off: if clicking same ingredient, clear the slot
          newGrid[row][col] = null;
        } else {
          newGrid[row][col] = selectedIngredient;
        }
        return newGrid;
      });
    },
    [selectedIngredient],
  );

  const submitGuess = useCallback(async () => {
    if (!sessionId || gameOver) return;
    try {
      const res = await guessReverseCrafting(sessionId, playerGrid);
      setGuessesRemaining(res.guessesRemaining);
      setLockedSlots(res.lockedSlots);
      setIngredientIcons((prev) => ({ ...prev, ...res.ingredientIcons }));
      setFeedback(
        `${res.correctCount}/9 slots correct (${res.totalFilledSlots} ingredients)`,
      );

      // Preserve locked slots in the player grid
      setPlayerGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        for (const slot of res.lockedSlots) {
          const r = Math.floor(slot / 3);
          const c = slot % 3;
          newGrid[r][c] = res.playerGrid[r][c];
        }
        return newGrid;
      });

      if (res.correct) {
        setWon(true);
        setGameOver(true);
        const ans = await getReverseCraftingAnswer(sessionId);
        setAnswer(ans);
      } else if (res.guessesRemaining !== null && res.guessesRemaining <= 0) {
        setGameOver(true);
        const ans = await getReverseCraftingAnswer(sessionId);
        setAnswer(ans);
      }
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }, [sessionId, gameOver, playerGrid]);

  const clearGrid = useCallback(() => {
    setPlayerGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const slotIndex = row * 3 + col;
          if (!lockedSlots.includes(slotIndex)) {
            newGrid[row][col] = null;
          }
        }
      }
      return newGrid;
    });
  }, [lockedSlots]);

  const playAgain = useCallback(() => {
    setSessionId(null);
    setOutputItem(null);
    setGameOver(false);
    setWon(false);
    setAnswer(null);
  }, []);

  // Pre-game start screen
  if (!sessionId) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="font-minecraft text-xl text-mc-gold">
          Reverse Crafting
        </h2>
        <p className="text-mc-gray text-sm max-w-md text-center">
          You see the crafted item — place the ingredients in the correct grid
          positions!
        </p>
        <GuessLimitSelector value={guessLimit} onChange={setGuessLimit} />
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
        <h2 className="font-minecraft text-sm text-mc-gold">
          Reverse Crafting
        </h2>
        <div className="flex gap-4 items-center">
          {guessesRemaining !== null && (
            <span className="font-minecraft text-xs text-mc-gray">
              Left: <span className="text-mc-gold">{guessesRemaining}</span>
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-mc-red text-xs">{error}</p>}

      {/* Output item display */}
      {outputItem && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-minecraft text-xs text-mc-gray">
            Craft this item:
          </span>
          <div className="mc-card flex items-center gap-3 px-4 py-2">
            <img
              src={outputItem.textureUrl}
              alt={outputItem.name}
              className="w-12 h-12 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="font-minecraft text-sm text-mc-gold">
              {outputItem.name}
            </span>
          </div>
        </div>
      )}

      {/* Interactive crafting grid */}
      <ReverseCraftingGrid
        playerGrid={playerGrid}
        lockedSlots={lockedSlots}
        ingredientIcons={ingredientIcons}
        availableIngredients={availableIngredients}
        selectedIngredient={selectedIngredient}
        onSlotClick={handleSlotClick}
      />

      {/* Ingredient palette */}
      {!gameOver && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-minecraft text-xs text-mc-gray">
            Select an ingredient:
          </span>
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {/* "Eraser" / empty tool */}
            <button
              onClick={() => setSelectedIngredient(null)}
              className={`w-10 h-10 flex items-center justify-center border-2 transition-colors ${
                selectedIngredient === null
                  ? "border-mc-gold bg-[#373737]"
                  : "border-mc-stone bg-mc-dark hover:border-mc-gold"
              }`}
              title="Eraser (clear slot)"
            >
              <span className="text-mc-red font-minecraft text-xs">✕</span>
            </button>
            {availableIngredients.map((ing) => {
              const iconUrl = ingredientIcons[ing];
              return (
                <button
                  key={ing}
                  onClick={() => setSelectedIngredient(ing)}
                  className={`w-10 h-10 flex items-center justify-center border-2 transition-colors ${
                    selectedIngredient === ing
                      ? "border-mc-gold bg-[#373737]"
                      : "border-mc-stone bg-mc-dark hover:border-mc-gold"
                  }`}
                  title={ing.replace(/_/g, " ")}
                >
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={ing.replace(/_/g, " ")}
                      className="w-full h-full object-contain p-0.5"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <span className="text-[7px] font-minecraft text-mc-gold break-all leading-tight">
                      {ing.replace(/_/g, " ")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <p className="font-minecraft text-xs text-mc-gray">{feedback}</p>
      )}

      {/* Action buttons */}
      {!gameOver && (
        <div className="flex gap-3">
          <button onClick={submitGuess} className="mc-btn-primary">
            Check Placement
          </button>
          <button onClick={clearGrid} className="mc-btn text-xs py-2 px-3">
            Clear Grid
          </button>
        </div>
      )}

      {/* Game over */}
      {gameOver && answer && (
        <GameOverModal answer={answer} won={won} onPlayAgain={playAgain} />
      )}
    </div>
  );
}
