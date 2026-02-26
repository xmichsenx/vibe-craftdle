import React, { useState } from "react";
import GameLayout from "../common/GameLayout";
import SoundPlayer from "./SoundPlayer";
import { startSound, guessSound, getSoundAnswer } from "../../services/api";
import { useGame } from "../../hooks/useGame";
import { SoundStartResponse, SoundGuessResponse } from "../../types";

export default function SoundGame() {
  const [soundUrl, setSoundUrl] = useState("");

  const game = useGame<SoundStartResponse, SoundGuessResponse>({
    startApi: startSound,
    guessApi: guessSound,
    answerApi: getSoundAnswer,
    onStartResponse: (res) => {
      setSoundUrl(res.soundUrl);
      return {
        sessionId: res.sessionId,
        guessesRemaining: res.guessesRemaining,
      };
    },
    onGuessResponse: (res) => {
      return { correct: res.correct, guessesRemaining: res.guessesRemaining };
    },
  });

  return (
    <GameLayout
      title="Sound Mode"
      description="Listen to a Minecraft sound and identify which mob, block, or item it belongs to!"
      placeholder="Guess the sound source..."
      game={game}
    >
      <SoundPlayer soundUrl={soundUrl} />
    </GameLayout>
  );
}
