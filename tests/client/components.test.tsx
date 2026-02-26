/**
 * Tests for shared client components:
 *   - GuessLimitSelector
 *   - GameLayout (start screen & in-game)
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GuessLimitSelector from "../../client/src/components/common/GuessLimitSelector";

// ---- GuessLimitSelector ----
describe("GuessLimitSelector", () => {
  it("renders all limit options", () => {
    render(<GuessLimitSelector value={null} onChange={() => {}} />);
    expect(screen.getByText("Unlimited")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("20")).toBeTruthy();
  });

  it("highlights the selected value", () => {
    const { container } = render(
      <GuessLimitSelector value={10} onChange={() => {}} />,
    );
    const btn10 = screen.getByText("10");
    expect(btn10.className).toContain("bg-mc-grass");
    const btnUnlimited = screen.getByText("Unlimited");
    expect(btnUnlimited.className).toContain("bg-mc-dark");
  });

  it("calls onChange with the selected value", () => {
    const onChange = jest.fn();
    render(<GuessLimitSelector value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText("5"));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("calls onChange with null for Unlimited", () => {
    const onChange = jest.fn();
    render(<GuessLimitSelector value={10} onChange={onChange} />);
    fireEvent.click(screen.getByText("Unlimited"));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

// ---- GameLayout ----
// GameLayout depends on react-router-dom (through GameOverModal).
// We mock it at the module level.
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

// Mock canvas-confetti so it doesn't error in JSDOM
jest.mock("canvas-confetti", () => jest.fn());

import GameLayout from "../../client/src/components/common/GameLayout";
import { GameState, GameActions } from "../../client/src/hooks/useGame";

function makeGame(
  overrides: Partial<GameState & GameActions> = {},
): GameState & GameActions {
  return {
    sessionId: null,
    guessLimit: null,
    guessesRemaining: null,
    pastGuesses: [],
    gameOver: false,
    won: false,
    answer: null,
    error: "",
    setGuessLimit: jest.fn(),
    start: jest.fn(),
    guess: jest.fn(),
    giveUp: jest.fn(),
    playAgain: jest.fn(),
    ...overrides,
  };
}

describe("GameLayout", () => {
  it("renders start screen when sessionId is null", () => {
    render(
      <GameLayout
        title="Test Mode"
        description="A test description"
        placeholder="search..."
        game={makeGame()}
      >
        <div>child</div>
      </GameLayout>,
    );
    expect(screen.getByText("Test Mode")).toBeTruthy();
    expect(screen.getByText("A test description")).toBeTruthy();
    expect(screen.getByText("Start Game")).toBeTruthy();
    // Children should not appear on start screen
    expect(screen.queryByText("child")).toBeNull();
  });

  it("calls start when Start Game is clicked", () => {
    const game = makeGame();
    render(
      <GameLayout title="T" description="D" placeholder="p" game={game}>
        <div />
      </GameLayout>,
    );
    fireEvent.click(screen.getByText("Start Game"));
    expect(game.start).toHaveBeenCalled();
  });

  it("renders in-game layout with children when session exists", () => {
    render(
      <GameLayout
        title="Test Mode"
        description="D"
        placeholder="search..."
        game={makeGame({ sessionId: "abc", guessesRemaining: 3 })}
      >
        <div data-testid="game-content">Game Content</div>
      </GameLayout>,
    );
    expect(screen.getByTestId("game-content")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy(); // guesses remaining
    expect(screen.getByText("Give Up")).toBeTruthy();
    // Search input should be present
    expect(screen.getByPlaceholderText("search...")).toBeTruthy();
  });

  it("shows past guesses", () => {
    render(
      <GameLayout
        title="T"
        description="D"
        placeholder="p"
        game={makeGame({ sessionId: "abc", pastGuesses: ["Dirt", "Stone"] })}
      >
        <div />
      </GameLayout>,
    );
    expect(screen.getByText("Dirt")).toBeTruthy();
    expect(screen.getByText("Stone")).toBeTruthy();
  });

  it("shows error message", () => {
    render(
      <GameLayout
        title="T"
        description="D"
        placeholder="p"
        game={makeGame({ sessionId: "abc", error: "Something went wrong" })}
      >
        <div />
      </GameLayout>,
    );
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("hides autocomplete and give up when game is over", () => {
    render(
      <GameLayout
        title="T"
        description="D"
        placeholder="search..."
        game={makeGame({
          sessionId: "abc",
          gameOver: true,
          answer: { id: "1", name: "Stone", textureUrl: "", wikiUrl: "" },
        })}
      >
        <div />
      </GameLayout>,
    );
    expect(screen.queryByPlaceholderText("search...")).toBeNull();
    expect(screen.queryByText("Give Up")).toBeNull();
    // Game over modal should show the answer name
    expect(screen.getByText("Stone")).toBeTruthy();
  });

  it("shows win state in game over modal", () => {
    render(
      <GameLayout
        title="T"
        description="D"
        placeholder="p"
        game={makeGame({
          sessionId: "abc",
          gameOver: true,
          won: true,
          answer: { id: "1", name: "Stone", textureUrl: "", wikiUrl: "" },
        })}
      >
        <div />
      </GameLayout>,
    );
    expect(screen.getByText(/You Win/)).toBeTruthy();
  });
});
