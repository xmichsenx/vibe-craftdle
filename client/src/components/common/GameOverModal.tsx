import React from 'react';
import { AnswerResponse } from '../../types';

interface GameOverModalProps {
  answer: AnswerResponse;
  won: boolean;
  onPlayAgain: () => void;
}

export default function GameOverModal({ answer, won, onPlayAgain }: GameOverModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="mc-card max-w-sm w-full text-center">
        <h2 className="font-minecraft text-lg mb-4">
          {won ? (
            <span className="text-mc-green">You got it!</span>
          ) : (
            <span className="text-mc-red">Game Over</span>
          )}
        </h2>

        <div className="mb-4">
          <p className="font-minecraft text-sm text-mc-gold mb-2">{answer.name}</p>
          <a
            href={answer.wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs"
          >
            View on Minecraft Wiki →
          </a>
        </div>

        <button onClick={onPlayAgain} className="mc-btn-primary">
          Play Again
        </button>
      </div>
    </div>
  );
}
