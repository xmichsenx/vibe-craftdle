import React, { useState } from "react";
import AutocompleteSearch from "../common/AutocompleteSearch";
import GuessLimitSelector from "../common/GuessLimitSelector";
import GameOverModal from "../common/GameOverModal";
import AttributeRow, { ATTRIBUTE_LABELS } from "./AttributeRow";
import {
  startClassic,
  guessClassic,
  getClassicAnswer,
} from "../../services/api";
import { useGame } from "../../hooks/useGame";
import {
  ClassicGuessFeedback,
  ClassicStartResponse,
  ClassicGuessResponse,
} from "../../types";

export default function ClassicGame() {
  const [guesses, setGuesses] = useState<ClassicGuessFeedback[]>([]);

  const game = useGame<ClassicStartResponse, ClassicGuessResponse>({
    startApi: startClassic,
    guessApi: guessClassic,
    answerApi: getClassicAnswer,
    onStartResponse: (res) => {
      setGuesses([]);
      return {
        sessionId: res.sessionId,
        guessesRemaining: res.guessesRemaining,
      };
    },
    onGuessResponse: (res) => {
      setGuesses((prev) => [...prev, res.feedback]);
      return { correct: res.correct, guessesRemaining: res.guessesRemaining };
    },
  });

  const {
    sessionId,
    guessLimit,
    guessesRemaining,
    gameOver,
    won,
    answer,
    error,
    setGuessLimit,
    start,
    guess,
    giveUp,
    playAgain,
  } = game;

  function handlePlayAgain() {
    setGuesses([]);
    playAgain();
  }

  // Pre-game: show start screen
  if (!sessionId) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="font-minecraft text-xl text-mc-gold">Classic Mode</h2>
        <p className="text-mc-gray text-sm max-w-md text-center">
          Guess the Minecraft item, block, or mob! After each guess you'll see
          which attributes match.
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
      <div className="flex items-center justify-between w-full px-4">
        <h2 className="font-minecraft text-sm text-mc-gold">Classic Mode</h2>
        <div className="flex gap-4 items-center">
          {guessesRemaining !== null && (
            <span className="font-minecraft text-xs text-mc-gray">
              Guesses left:{" "}
              <span className="text-mc-gold">{guessesRemaining}</span>
            </span>
          )}
          {!gameOver && (
            <button onClick={giveUp} className="mc-btn text-xs py-1 px-3">
              Give Up
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-mc-red text-xs">{error}</p>}

      {/* Guess history table */}
      {guesses.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-xs text-mc-gray font-minecraft">
                <th className="px-3 py-2 text-left">Name</th>
                {ATTRIBUTE_LABELS.map(({ key, label }) => (
                  <th key={key} className="px-3 py-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guesses.map((fb, i) => (
                <AttributeRow key={i} feedback={fb} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guess input */}
      {!gameOver && (
        <AutocompleteSearch
          onSelect={guess}
          placeholder="Search for an item, block, or mob..."
        />
      )}

      {/* Game over modal */}
      {gameOver && answer && (
        <GameOverModal
          answer={answer}
          won={won}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
