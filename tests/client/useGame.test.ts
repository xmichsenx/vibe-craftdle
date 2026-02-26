/**
 * Tests for client/src/hooks/useGame.ts
 *
 * Uses @testing-library/react renderHook to exercise the
 * generic game state hook used by all four game modes.
 */
import { renderHook, act } from "@testing-library/react";
import { useGame } from "../../client/src/hooks/useGame";
import { AnswerResponse } from "../../client/src/types";

// ------- helpers -------
function makeOptions(overrides: Record<string, any> = {}) {
  const startApi = jest.fn().mockResolvedValue({
    sessionId: "s1",
    guessesRemaining: 5,
    extra: "data",
  });
  const guessApi = jest.fn().mockResolvedValue({
    correct: false,
    guessesRemaining: 4,
  });
  const answerApi = jest.fn().mockResolvedValue({
    id: "1",
    name: "Stone",
    textureUrl: "",
    wikiUrl: "",
  } as AnswerResponse);
  const onStartResponse = jest.fn((res: any) => ({
    sessionId: res.sessionId,
    guessesRemaining: res.guessesRemaining,
  }));
  const onGuessResponse = jest.fn((res: any) => ({
    correct: res.correct,
    guessesRemaining: res.guessesRemaining,
  }));

  return {
    startApi,
    guessApi,
    answerApi,
    onStartResponse,
    onGuessResponse,
    ...overrides,
  };
}

// ------- tests -------
describe("useGame", () => {
  it("starts with idle state", () => {
    const { result } = renderHook(() => useGame(makeOptions()));
    expect(result.current.sessionId).toBeNull();
    expect(result.current.guessLimit).toBeNull();
    expect(result.current.guessesRemaining).toBeNull();
    expect(result.current.pastGuesses).toEqual([]);
    expect(result.current.gameOver).toBe(false);
    expect(result.current.won).toBe(false);
    expect(result.current.answer).toBeNull();
    expect(result.current.error).toBe("");
    expect(result.current.startResponse).toBeNull();
    expect(result.current.lastGuessResponse).toBeNull();
  });

  it("setGuessLimit updates guessLimit", () => {
    const { result } = renderHook(() => useGame(makeOptions()));
    act(() => result.current.setGuessLimit(10));
    expect(result.current.guessLimit).toBe(10);
  });

  it("start() calls startApi and sets sessionId", async () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useGame(opts));
    act(() => result.current.setGuessLimit(5));
    await act(async () => result.current.start());

    expect(opts.startApi).toHaveBeenCalledWith(5);
    expect(opts.onStartResponse).toHaveBeenCalled();
    expect(result.current.sessionId).toBe("s1");
    expect(result.current.guessesRemaining).toBe(5);
    expect(result.current.startResponse).toEqual(
      expect.objectContaining({ sessionId: "s1" }),
    );
    expect(result.current.error).toBe("");
  });

  it("start() sets error on failure", async () => {
    const opts = makeOptions({
      startApi: jest.fn().mockRejectedValue(new Error("Network")),
    });
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    expect(result.current.error).toBe("Network");
    expect(result.current.sessionId).toBeNull();
  });

  it("guess() calls guessApi and appends to pastGuesses", async () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    await act(async () =>
      result.current.guess({
        id: "2",
        name: "Dirt",
        textureUrl: "",
        type: "block",
      }),
    );

    expect(opts.guessApi).toHaveBeenCalledWith("s1", "Dirt");
    expect(result.current.pastGuesses).toEqual(["Dirt"]);
    expect(result.current.guessesRemaining).toBe(4);
    expect(result.current.gameOver).toBe(false);
  });

  it("guess() does nothing before start", async () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useGame(opts));
    await act(async () =>
      result.current.guess({
        id: "2",
        name: "Dirt",
        textureUrl: "",
        type: "block",
      }),
    );
    expect(opts.guessApi).not.toHaveBeenCalled();
  });

  it("guess() sets won and gameOver on correct guess", async () => {
    const opts = makeOptions({
      guessApi: jest
        .fn()
        .mockResolvedValue({ correct: true, guessesRemaining: 4 }),
    });
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    await act(async () =>
      result.current.guess({
        id: "1",
        name: "Stone",
        textureUrl: "",
        type: "block",
      }),
    );

    expect(result.current.won).toBe(true);
    expect(result.current.gameOver).toBe(true);
    expect(opts.answerApi).toHaveBeenCalledWith("s1");
    expect(result.current.answer).toEqual(
      expect.objectContaining({ name: "Stone" }),
    );
  });

  it("guess() sets gameOver when guessesRemaining hits 0", async () => {
    const opts = makeOptions({
      guessApi: jest
        .fn()
        .mockResolvedValue({ correct: false, guessesRemaining: 0 }),
    });
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    await act(async () =>
      result.current.guess({
        id: "2",
        name: "Dirt",
        textureUrl: "",
        type: "block",
      }),
    );

    expect(result.current.won).toBe(false);
    expect(result.current.gameOver).toBe(true);
    expect(result.current.answer).toBeTruthy();
  });

  it("guess() does nothing when gameOver is true", async () => {
    const opts = makeOptions({
      guessApi: jest
        .fn()
        .mockResolvedValue({ correct: true, guessesRemaining: 4 }),
    });
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    // First guess wins
    await act(async () =>
      result.current.guess({
        id: "1",
        name: "Stone",
        textureUrl: "",
        type: "block",
      }),
    );
    // Second guess should be ignored
    opts.guessApi.mockClear();
    await act(async () =>
      result.current.guess({
        id: "2",
        name: "Dirt",
        textureUrl: "",
        type: "block",
      }),
    );
    expect(opts.guessApi).not.toHaveBeenCalled();
  });

  it("guess() sets error on failure", async () => {
    const opts = makeOptions({
      guessApi: jest.fn().mockRejectedValue(new Error("Server error")),
    });
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    await act(async () =>
      result.current.guess({
        id: "2",
        name: "Dirt",
        textureUrl: "",
        type: "block",
      }),
    );
    expect(result.current.error).toBe("Server error");
  });

  it("giveUp() sets gameOver and fetches answer", async () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    await act(async () => result.current.giveUp());

    expect(result.current.gameOver).toBe(true);
    expect(result.current.won).toBe(false);
    expect(opts.answerApi).toHaveBeenCalledWith("s1");
    expect(result.current.answer).toBeTruthy();
  });

  it("giveUp() does nothing before start", async () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.giveUp());
    expect(opts.answerApi).not.toHaveBeenCalled();
  });

  it("playAgain() resets all state", async () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    await act(async () =>
      result.current.guess({
        id: "2",
        name: "Dirt",
        textureUrl: "",
        type: "block",
      }),
    );
    act(() => result.current.playAgain());

    expect(result.current.sessionId).toBeNull();
    expect(result.current.pastGuesses).toEqual([]);
    expect(result.current.gameOver).toBe(false);
    expect(result.current.won).toBe(false);
    expect(result.current.answer).toBeNull();
    expect(result.current.startResponse).toBeNull();
    expect(result.current.lastGuessResponse).toBeNull();
  });

  it("unlimited guesses don't end the game", async () => {
    const opts = makeOptions({
      guessApi: jest
        .fn()
        .mockResolvedValue({ correct: false, guessesRemaining: null }),
    });
    const { result } = renderHook(() => useGame(opts));
    await act(async () => result.current.start());
    await act(async () =>
      result.current.guess({
        id: "2",
        name: "Dirt",
        textureUrl: "",
        type: "block",
      }),
    );
    expect(result.current.gameOver).toBe(false);
    expect(result.current.won).toBe(false);
  });
});
