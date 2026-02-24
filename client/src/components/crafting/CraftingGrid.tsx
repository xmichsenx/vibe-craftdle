import React from 'react';

interface CraftingGridProps {
  grid: (string | null)[][];
  revealedSlots: number[];
}

export default function CraftingGrid({ grid, revealedSlots }: CraftingGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 w-48 h-48 bg-mc-dark border-2 border-mc-stone p-2">
      {grid.flat().map((cell, index) => {
        const isRevealed = revealedSlots.includes(index);
        return (
          <div
            key={index}
            className={`flex items-center justify-center border border-mc-stone text-xs font-minecraft ${
              isRevealed
                ? cell
                  ? 'bg-mc-wood text-mc-dark'
                  : 'bg-mc-dark text-mc-gray'
                : 'bg-mc-obsidian text-mc-gold'
            }`}
          >
            {isRevealed ? (
              cell ? (
                <span className="text-center text-[8px] leading-tight break-all">
                  {cell.replace(/_/g, ' ')}
                </span>
              ) : (
                <span className="text-mc-gray">—</span>
              )
            ) : (
              <span className="text-lg">?</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
