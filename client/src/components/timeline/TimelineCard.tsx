import React, { useState } from "react";

interface TimelineEntity {
  id: string;
  name: string;
  textureUrl: string;
  versionAdded: string;
}

interface TimelineCardProps {
  entity: TimelineEntity;
  showVersion: boolean;
  label: string;
}

/**
 * Displays a Minecraft entity card with its texture, name, and optionally version.
 */
export default function TimelineCard({
  entity,
  showVersion,
  label,
}: TimelineCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="mc-card flex flex-col items-center gap-2 p-4 min-w-[140px]">
      <span className="font-minecraft text-[10px] text-mc-gray uppercase">
        {label}
      </span>
      {entity.textureUrl && !imgError ? (
        <img
          src={entity.textureUrl}
          alt={entity.name}
          className="w-16 h-16 object-contain"
          style={{ imageRendering: "pixelated" }}
          draggable={false}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-mc-dark border border-mc-stone text-mc-gray font-minecraft text-[10px] text-center">
          {entity.name.charAt(0)}
        </div>
      )}
      <span className="font-minecraft text-sm text-mc-gold text-center">
        {entity.name}
      </span>
      {showVersion && (
        <span className="font-minecraft text-xs text-mc-green">
          v{entity.versionAdded}
        </span>
      )}
    </div>
  );
}
