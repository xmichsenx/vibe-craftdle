import { createGameRouter } from "./createGameRouter";
import {
  startSoundGame,
  guessSound,
  getSoundAnswer,
} from "../services/soundService";

export default createGameRouter({
  start: startSoundGame,
  guess: guessSound,
  answer: getSoundAnswer,
});
