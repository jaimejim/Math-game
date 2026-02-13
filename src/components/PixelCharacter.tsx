"use client";

import React from "react";

interface PixelCharacterProps {
  color: "blue" | "red";
  isRunning: boolean;
  isCelebrating: boolean;
  size?: number;
}

/**
 * Renders a cute pixel-art runner character using an SVG grid.
 * Two color variants: blue (Player 1) and red (Player 2).
 * The character has a running bounce or celebration animation applied via CSS class.
 */
export default function PixelCharacter({
  color,
  isRunning,
  isCelebrating,
  size = 80,
}: PixelCharacterProps) {
  // Color palettes
  const palette =
    color === "blue"
      ? { body: "#3b82f6", dark: "#1d4ed8", light: "#93c5fd", shoe: "#1e3a5f", skin: "#fcd34d", eye: "#1e293b", hair: "#92400e" }
      : { body: "#ef4444", dark: "#b91c1c", light: "#fca5a5", shoe: "#7f1d1d", skin: "#fcd34d", eye: "#1e293b", hair: "#4a2000" };

  // 16x16 pixel grid  (0=transparent, 1=hair, 2=skin, 3=eye, 4=body, 5=dark body, 6=light body, 7=shoe)
  const sprite = [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
    [0,0,0,2,2,3,2,2,2,2,3,2,2,0,0,0],
    [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
    [0,0,0,0,2,2,2,8,8,2,2,2,0,0,0,0],
    [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    [0,0,0,4,4,5,4,4,4,4,5,4,4,0,0,0],
    [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
    [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
    [0,0,0,2,2,0,0,0,0,0,0,2,2,0,0,0],
    [0,0,7,7,7,0,0,0,0,0,0,7,7,7,0,0],
    [0,0,7,7,7,0,0,0,0,0,0,7,7,7,0,0],
  ];

  const colorMap: Record<number, string> = {
    0: "transparent",
    1: palette.hair,
    2: palette.skin,
    3: palette.eye,
    4: palette.body,
    5: palette.dark,
    6: palette.light,
    7: palette.shoe,
    8: "#ef4444", // mouth/smile
  };

  const px = size / 16;

  const animClass = isCelebrating
    ? "char-celebrate"
    : isRunning
    ? "char-running"
    : "";

  return (
    <div className={`pixel-char ${animClass}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}
      >
        {sprite.map((row, y) =>
          row.map((cell, x) =>
            cell !== 0 ? (
              <rect
                key={`${x}-${y}`}
                x={x * px}
                y={y * px}
                width={px + 0.5}
                height={px + 0.5}
                fill={colorMap[cell]}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
