import { createGameRouter } from "./createGameRouter";
import {
  startClassicGame,
  guessClassic,
  getClassicAnswer,
} from "../services/classicService";

export default createGameRouter({
  start: startClassicGame,
  guess: guessClassic,
  answer: getClassicAnswer,
});
