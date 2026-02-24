import React from 'react';

interface TextureCropProps {
  imageData: string;
  cropLevel: number;
}

const CROP_SIZES = [4, 6, 8, 10, 12, 16];

export default function TextureCrop({ imageData, cropLevel }: TextureCropProps) {
  const size = CROP_SIZES[Math.min(cropLevel, CROP_SIZES.length - 1)];
  const zoomPercent = Math.round((size / 16) * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-48 h-48 bg-mc-dark border-2 border-mc-stone flex items-center justify-center"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* For now show a placeholder since we don't have real cropped textures */}
        <div className="flex flex-col items-center gap-2 text-mc-gray">
          <div
            className="bg-mc-obsidian border border-mc-stone flex items-center justify-center font-minecraft text-xs"
            style={{
              width: `${(size / 16) * 192}px`,
              height: `${(size / 16) * 192}px`,
            }}
          >
            {size}×{size}
          </div>
        </div>
      </div>
      <span className="font-minecraft text-xs text-mc-gray">
        Visible: {zoomPercent}%
      </span>
    </div>
  );
}
