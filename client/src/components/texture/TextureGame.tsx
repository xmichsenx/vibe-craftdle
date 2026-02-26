import React, { useState } from "react";
import GameLayout from "../common/GameLayout";
import TextureCrop from "./TextureCrop";
import {
  startTexture,
  guessTexture,
  getTextureAnswer,
} from "../../services/api";
import { useGame } from "../../hooks/useGame";
import { TextureStartResponse, TextureGuessResponse } from "../../types";

export default function TextureGame() {
  const [cropLevel, setCropLevel] = useState(0);
  const [imageData, setImageData] = useState("");
  const [centerX, setCenterX] = useState(0.5);
  const [centerY, setCenterY] = useState(0.5);

  const game = useGame<TextureStartResponse, TextureGuessResponse>({
    startApi: startTexture,
    guessApi: guessTexture,
    answerApi: getTextureAnswer,
    onStartResponse: (res) => {
      setCropLevel(res.cropLevel);
      setImageData(res.imageData);
      setCenterX(res.centerX ?? 0.5);
      setCenterY(res.centerY ?? 0.5);
      return {
        sessionId: res.sessionId,
        guessesRemaining: res.guessesRemaining,
      };
    },
    onGuessResponse: (res) => {
      setCropLevel(res.cropLevel);
      setImageData(res.imageData);
      setCenterX(res.centerX ?? centerX);
      setCenterY(res.centerY ?? centerY);
      return { correct: res.correct, guessesRemaining: res.guessesRemaining };
    },
  });

  return (
    <GameLayout
      title="Texture Close-up"
      description="Identify the block or item from a zoomed-in crop of its texture!"
      placeholder="Guess the item or block..."
      game={game}
    >
      <TextureCrop
        imageData={imageData}
        cropLevel={cropLevel}
        centerX={centerX}
        centerY={centerY}
      />
    </GameLayout>
  );
}
