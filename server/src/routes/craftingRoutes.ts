import { createGameRouter } from "./createGameRouter";
import {
  startCraftingGame,
  guessCrafting,
  getCraftingAnswer,
} from "../services/craftingService";

export default createGameRouter({
  start: startCraftingGame,
  guess: guessCrafting,
  answer: getCraftingAnswer,
});
