import React from "react";

interface ReverseCraftingGridProps {
  playerGrid: (string | null)[][];
  lockedSlots: number[];
  ingredientIcons: Record<string, string>;
  availableIngredients: string[];
  selectedIngredient: string | null;
  onSlotClick: (row: number, col: number) => void;
}

/**
 * Interactive 3x3 crafting grid for reverse crafting mode.
 * Players click on slots to place the currently selected ingredient.
 * Locked slots (from progressive assist) are highlighted.
 */
export default function ReverseCraftingGrid({
  playerGrid,
  lockedSlots,
  ingredientIcons,
  availableIngredients,
  selectedIngredient,
  onSlotClick,
}: ReverseCraftingGridProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-48 h-48 sm:w-56 sm:h-56 bg-mc-dark border-2 border-mc-stone p-2">
      {playerGrid.flat().map((cell, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const isLocked = lockedSlots.includes(index);
        const iconUrl = cell ? ingredientIcons[cell] : undefined;

        return (
          <button
            key={index}
            onClick={() => !isLocked && onSlotClick(row, col)}
            disabled={isLocked}
            className={`flex items-center justify-center aspect-square border transition-colors ${
              isLocked
                ? "border-mc-green bg-[#2a3a2a] cursor-not-allowed"
                : cell
                  ? "border-mc-stone bg-[#373737] cursor-pointer hover:border-mc-gold"
                  : selectedIngredient
                    ? "border-mc-stone bg-mc-dark cursor-pointer hover:border-mc-gold hover:bg-[#2a2a2a]"
                    : "border-mc-stone bg-mc-dark"
            }`}
          >
            {cell ? (
              iconUrl ? (
                <img
                  src={iconUrl}
                  alt={cell.replace(/_/g, " ")}
                  title={cell.replace(/_/g, " ")}
                  className="w-full h-full object-contain p-0.5"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <span className="text-center text-[8px] leading-tight break-all font-minecraft text-mc-gold">
                  {cell.replace(/_/g, " ")}
                </span>
              )
            ) : isLocked ? (
              <span className="text-mc-green">—</span>
            ) : null}
            {isLocked && (
              <span className="absolute text-[6px] text-mc-green font-minecraft">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
