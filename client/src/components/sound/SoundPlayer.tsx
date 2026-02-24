import React from 'react';

interface SoundPlayerProps {
  soundUrl: string;
}

export default function SoundPlayer({ soundUrl }: SoundPlayerProps) {
  function handlePlay() {
    const audio = new Audio(soundUrl);
    audio.play().catch(() => {
      // Browser may block autoplay
    });
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-48 h-48 bg-mc-dark border-2 border-mc-stone flex items-center justify-center">
        <button
          onClick={handlePlay}
          className="mc-btn-primary text-2xl w-20 h-20 flex items-center justify-center rounded-full"
          aria-label="Play sound"
        >
          ▶
        </button>
      </div>
      <span className="font-minecraft text-xs text-mc-gray">Click to play</span>
    </div>
  );
}
