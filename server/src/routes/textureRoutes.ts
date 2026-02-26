import { createGameRouter } from "./createGameRouter";
import {
  startTextureGame,
  guessTexture,
  getTextureAnswer,
} from "../services/textureService";

export default createGameRouter({
  start: startTextureGame,
  guess: guessTexture,
  answer: getTextureAnswer,
});
