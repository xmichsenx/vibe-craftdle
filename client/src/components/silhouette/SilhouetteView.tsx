import React from "react";

interface SilhouetteViewProps {
  textureUrl: string;
  opacity: number; // 1.0 = fully black, 0.0 = fully revealed
}

/**
 * Renders a mob texture as a silhouette by overlaying a black layer with variable opacity.
 * When opacity is 1.0, the mob appears as a pure black shape.
 * As opacity decreases, the mob's colors become visible.
 */
export default function SilhouetteView({
  textureUrl,
  opacity,
}: SilhouetteViewProps) {
  if (!textureUrl) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-48 h-48 sm:w-64 sm:h-64">
        {/* The mob texture with brightness filter for silhouette effect */}
        <img
          src={textureUrl}
          alt="Mystery mob"
          className="w-full h-full object-contain transition-all duration-500"
          style={{
            imageRendering: "pixelated",
            filter: `brightness(${1 - opacity})`,
          }}
          draggable={false}
        />
      </div>
      {/* Opacity indicator — placed outside the image container */}
      <span className="font-minecraft text-xs text-mc-gray">
        Visibility:{" "}
        <span className="text-mc-gold">
          {Math.round((1 - opacity) * 100)}%
        </span>
      </span>
    </div>
  );
}
