import React, { useState } from "react";
import GameLayout from "../common/GameLayout";
import SilhouetteView from "./SilhouetteView";
import {
  startSilhouette,
  guessSilhouette,
  getSilhouetteAnswer,
} from "../../services/api";
import { useGame } from "../../hooks/useGame";
import { SilhouetteStartResponse, SilhouetteGuessResponse } from "../../types";

export default function SilhouetteGame() {
  const [textureUrl, setTextureUrl] = useState("");
  const [opacity, setOpacity] = useState(1.0);

  const game = useGame<SilhouetteStartResponse, SilhouetteGuessResponse>({
    startApi: startSilhouette,
    guessApi: guessSilhouette,
    answerApi: getSilhouetteAnswer,
    onStartResponse: (res) => {
      setTextureUrl(res.textureUrl);
      setOpacity(res.opacity);
      return {
        sessionId: res.sessionId,
        guessesRemaining: res.guessesRemaining,
      };
    },
    onGuessResponse: (res) => {
      setOpacity(res.opacity);
      return { correct: res.correct, guessesRemaining: res.guessesRemaining };
    },
  });

  return (
    <GameLayout
      title="Silhouette Mode"
      description="Identify the mob from its blacked-out silhouette! Each wrong guess reveals more color."
      placeholder="Guess the mob..."
      game={game}
      searchMode="silhouette"
    >
      <SilhouetteView textureUrl={textureUrl} opacity={opacity} />
    </GameLayout>
  );
}
