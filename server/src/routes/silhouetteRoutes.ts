import { createGameRouter } from "./createGameRouter";
import {
  startSilhouetteGame,
  guessSilhouette,
  getSilhouetteAnswer,
} from "../services/silhouetteService";

export default createGameRouter({
  start: startSilhouetteGame,
  guess: guessSilhouette,
  answer: getSilhouetteAnswer,
});
