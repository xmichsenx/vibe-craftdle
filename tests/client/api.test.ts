/**
 * Tests for client/src/services/api.ts
 *
 * Validates that each API function delegates to the correct
 * client-side engine after ensuring data is loaded.
 */

// ---------- mock all engine modules ----------
jest.mock("../../client/src/engine/dataStore", () => ({
  loadAllData: jest.fn().mockResolvedValue(undefined),
  isDataLoaded: jest.fn().mockReturnValue(false),
  searchEntities: jest.fn(),
  searchCraftableItems: jest.fn(),
  searchMobs: jest.fn(),
}));

jest.mock("../../client/src/engine/classicEngine", () => ({
  startClassicGame: jest.fn(),
  guessClassic: jest.fn(),
  getClassicAnswer: jest.fn(),
}));

jest.mock("../../client/src/engine/craftingEngine", () => ({
  startCraftingGame: jest.fn(),
  guessCrafting: jest.fn(),
  getCraftingAnswer: jest.fn(),
}));

jest.mock("../../client/src/engine/textureEngine", () => ({
  startTextureGame: jest.fn(),
  guessTexture: jest.fn(),
  getTextureAnswer: jest.fn(),
}));

jest.mock("../../client/src/engine/soundEngine", () => ({
  startSoundGame: jest.fn(),
  guessSound: jest.fn(),
  getSoundAnswer: jest.fn(),
}));

jest.mock("../../client/src/engine/silhouetteEngine", () => ({
  startSilhouetteGame: jest.fn(),
  guessSilhouette: jest.fn(),
  getSilhouetteAnswer: jest.fn(),
}));

jest.mock("../../client/src/engine/timelineEngine", () => ({
  startTimelineGame: jest.fn(),
  guessTimeline: jest.fn(),
  getTimelineAnswer: jest.fn(),
}));

jest.mock("../../client/src/engine/reverseCraftingEngine", () => ({
  startReverseCraftingGame: jest.fn(),
  guessReverseCrafting: jest.fn(),
  getReverseCraftingAnswer: jest.fn(),
}));

import {
  searchItems,
  startClassic,
  guessClassic,
  getClassicAnswer,
  startCrafting,
  guessCrafting,
  getCraftingAnswer,
  startTexture,
  guessTexture,
  getTextureAnswer,
  startSound,
  guessSound,
  getSoundAnswer,
  startSilhouette,
  guessSilhouette,
  getSilhouetteAnswer,
  startTimeline,
  guessTimeline,
  getTimelineAnswer,
  startReverseCrafting,
  guessReverseCrafting,
  getReverseCraftingAnswer,
} from "../../client/src/services/api";

import {
  loadAllData,
  isDataLoaded,
  searchEntities,
  searchCraftableItems,
  searchMobs,
} from "../../client/src/engine/dataStore";

import {
  startClassicGame,
  guessClassic as classicGuessEngine,
  getClassicAnswer as classicAnswerEngine,
} from "../../client/src/engine/classicEngine";
import {
  startCraftingGame,
  guessCrafting as craftingGuessEngine,
  getCraftingAnswer as craftingAnswerEngine,
} from "../../client/src/engine/craftingEngine";
import {
  startTextureGame,
  guessTexture as textureGuessEngine,
  getTextureAnswer as textureAnswerEngine,
} from "../../client/src/engine/textureEngine";
import {
  startSoundGame,
  guessSound as soundGuessEngine,
  getSoundAnswer as soundAnswerEngine,
} from "../../client/src/engine/soundEngine";
import {
  startSilhouetteGame,
  guessSilhouette as silhouetteGuessEngine,
  getSilhouetteAnswer as silhouetteAnswerEngine,
} from "../../client/src/engine/silhouetteEngine";
import {
  startTimelineGame,
  guessTimeline as timelineGuessEngine,
  getTimelineAnswer as timelineAnswerEngine,
} from "../../client/src/engine/timelineEngine";
import {
  startReverseCraftingGame,
  guessReverseCrafting as reverseCraftingGuessEngine,
  getReverseCraftingAnswer as reverseCraftingAnswerEngine,
} from "../../client/src/engine/reverseCraftingEngine";

beforeEach(() => {
  jest.clearAllMocks();
  (isDataLoaded as jest.Mock).mockReturnValue(false);
});

// ----- search -----
describe("searchItems", () => {
  it("loads data and calls searchEntities for default mode", async () => {
    const results = [{ id: "1", name: "Stone", textureUrl: "", type: "block" }];
    (searchEntities as jest.Mock).mockReturnValue(results);
    const res = await searchItems("stone");
    expect(loadAllData).toHaveBeenCalled();
    expect(searchEntities).toHaveBeenCalledWith("stone", 10);
    expect(res).toEqual(results);
  });

  it("calls searchCraftableItems when mode is crafting", async () => {
    (searchCraftableItems as jest.Mock).mockReturnValue([]);
    await searchItems("sword", "crafting");
    expect(searchCraftableItems).toHaveBeenCalledWith("sword", 10);
  });

  it("calls searchMobs when mode is silhouette", async () => {
    (searchMobs as jest.Mock).mockReturnValue([]);
    await searchItems("creeper", "silhouette");
    expect(searchMobs).toHaveBeenCalledWith("creeper", 10);
  });

  it("skips loadAllData when data is already loaded", async () => {
    (isDataLoaded as jest.Mock).mockReturnValue(true);
    (searchEntities as jest.Mock).mockReturnValue([]);
    await searchItems("stone");
    expect(loadAllData).not.toHaveBeenCalled();
  });
});

// ----- classic -----
describe("classic", () => {
  it("startClassic delegates to startClassicGame", async () => {
    const response = { sessionId: "s1", guessesRemaining: 10 };
    (startClassicGame as jest.Mock).mockReturnValue(response);
    const res = await startClassic(10);
    expect(startClassicGame).toHaveBeenCalledWith(10);
    expect(res).toEqual(response);
  });

  it("guessClassic delegates to classicGuessEngine", async () => {
    const response = { correct: false, guessesRemaining: 9 };
    (classicGuessEngine as jest.Mock).mockReturnValue(response);
    const res = await guessClassic("s1", "Dirt");
    expect(classicGuessEngine).toHaveBeenCalledWith("s1", "Dirt");
    expect(res.correct).toBe(false);
  });

  it("getClassicAnswer delegates to classicAnswerEngine", async () => {
    const response = { id: "1", name: "Stone", textureUrl: "", wikiUrl: "" };
    (classicAnswerEngine as jest.Mock).mockReturnValue(response);
    const res = await getClassicAnswer("s1");
    expect(classicAnswerEngine).toHaveBeenCalledWith("s1");
    expect(res.name).toBe("Stone");
  });
});

// ----- crafting -----
describe("crafting", () => {
  it("startCrafting delegates to startCraftingGame", async () => {
    const response = { sessionId: "c1" };
    (startCraftingGame as jest.Mock).mockReturnValue(response);
    const res = await startCrafting(null);
    expect(startCraftingGame).toHaveBeenCalledWith(null);
    expect(res).toEqual(response);
  });

  it("guessCrafting delegates to craftingGuessEngine", async () => {
    (craftingGuessEngine as jest.Mock).mockReturnValue({ correct: true });
    await guessCrafting("c1", "Sword");
    expect(craftingGuessEngine).toHaveBeenCalledWith("c1", "Sword");
  });

  it("getCraftingAnswer delegates to craftingAnswerEngine", async () => {
    (craftingAnswerEngine as jest.Mock).mockReturnValue({ name: "Sword" });
    await getCraftingAnswer("c1");
    expect(craftingAnswerEngine).toHaveBeenCalledWith("c1");
  });
});

// ----- texture -----
describe("texture", () => {
  it("startTexture delegates to startTextureGame", async () => {
    (startTextureGame as jest.Mock).mockReturnValue({ sessionId: "t1" });
    await startTexture(5);
    expect(startTextureGame).toHaveBeenCalledWith(5);
  });

  it("guessTexture delegates to textureGuessEngine", async () => {
    (textureGuessEngine as jest.Mock).mockReturnValue({ correct: false });
    await guessTexture("t1", "Grass");
    expect(textureGuessEngine).toHaveBeenCalledWith("t1", "Grass");
  });

  it("getTextureAnswer delegates to textureAnswerEngine", async () => {
    (textureAnswerEngine as jest.Mock).mockReturnValue({ name: "Grass" });
    await getTextureAnswer("t1");
    expect(textureAnswerEngine).toHaveBeenCalledWith("t1");
  });
});

// ----- sound -----
describe("sound", () => {
  it("startSound delegates to startSoundGame", async () => {
    (startSoundGame as jest.Mock).mockReturnValue({ sessionId: "snd1" });
    await startSound(null);
    expect(startSoundGame).toHaveBeenCalledWith(null);
  });

  it("guessSound delegates to soundGuessEngine", async () => {
    (soundGuessEngine as jest.Mock).mockReturnValue({ correct: false });
    await guessSound("snd1", "Creeper");
    expect(soundGuessEngine).toHaveBeenCalledWith("snd1", "Creeper");
  });

  it("getSoundAnswer delegates to soundAnswerEngine", async () => {
    (soundAnswerEngine as jest.Mock).mockReturnValue({ name: "Creeper" });
    await getSoundAnswer("snd1");
    expect(soundAnswerEngine).toHaveBeenCalledWith("snd1");
  });
});

// ----- silhouette -----
describe("silhouette", () => {
  it("startSilhouette delegates to startSilhouetteGame", async () => {
    (startSilhouetteGame as jest.Mock).mockReturnValue({ sessionId: "sil1" });
    await startSilhouette(null);
    expect(startSilhouetteGame).toHaveBeenCalledWith(null);
  });

  it("guessSilhouette delegates to silhouetteGuessEngine", async () => {
    (silhouetteGuessEngine as jest.Mock).mockReturnValue({ correct: false });
    await guessSilhouette("sil1", "Zombie");
    expect(silhouetteGuessEngine).toHaveBeenCalledWith("sil1", "Zombie");
  });

  it("getSilhouetteAnswer delegates to silhouetteAnswerEngine", async () => {
    (silhouetteAnswerEngine as jest.Mock).mockReturnValue({ name: "Zombie" });
    await getSilhouetteAnswer("sil1");
    expect(silhouetteAnswerEngine).toHaveBeenCalledWith("sil1");
  });
});

// ----- timeline -----
describe("timeline", () => {
  it("startTimeline delegates to startTimelineGame", async () => {
    (startTimelineGame as jest.Mock).mockReturnValue({ sessionId: "tl1" });
    await startTimeline();
    expect(startTimelineGame).toHaveBeenCalled();
  });

  it("guessTimeline delegates to timelineGuessEngine", async () => {
    (timelineGuessEngine as jest.Mock).mockReturnValue({ correct: false });
    await guessTimeline("tl1", "higher");
    expect(timelineGuessEngine).toHaveBeenCalledWith("tl1", "higher");
  });

  it("getTimelineAnswer delegates to timelineAnswerEngine", async () => {
    (timelineAnswerEngine as jest.Mock).mockReturnValue({ name: "Creeper" });
    await getTimelineAnswer("tl1");
    expect(timelineAnswerEngine).toHaveBeenCalledWith("tl1");
  });
});

// ----- reverse crafting -----
describe("reverse crafting", () => {
  it("startReverseCrafting delegates to startReverseCraftingGame", async () => {
    (startReverseCraftingGame as jest.Mock).mockReturnValue({
      sessionId: "rc1",
    });
    await startReverseCrafting(null);
    expect(startReverseCraftingGame).toHaveBeenCalledWith(null);
  });

  it("guessReverseCrafting delegates to reverseCraftingGuessEngine", async () => {
    const grid = [[null, "diamond", null]];
    (reverseCraftingGuessEngine as jest.Mock).mockReturnValue({
      correct: false,
    });
    await guessReverseCrafting("rc1", grid);
    expect(reverseCraftingGuessEngine).toHaveBeenCalledWith("rc1", grid);
  });

  it("getReverseCraftingAnswer delegates to reverseCraftingAnswerEngine", async () => {
    (reverseCraftingAnswerEngine as jest.Mock).mockReturnValue({
      name: "Sword",
    });
    await getReverseCraftingAnswer("rc1");
    expect(reverseCraftingAnswerEngine).toHaveBeenCalledWith("rc1");
  });
});
