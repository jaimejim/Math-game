"use client";

import React, { useState, useEffect } from "react";

interface PixelCharacterProps {
  color: "blue" | "red";
  isRunning: boolean;
  isCelebrating: boolean;
  size?: number;
}

/**
 * Pixel-art runner with two alternating leg frames for a proper running look.
 * Frame A: left leg forward / right leg back
 * Frame B: right leg forward / left leg back
 * When standing still, both legs are centered (neutral).
 */
export default function PixelCharacter({
  color,
  isRunning,
  isCelebrating,
  size = 80,
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0);

  // Alternate frames while running
  useEffect(() => {
    if (!isRunning) {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 2);
    }, 180); // swap legs every 180ms
    return () => clearInterval(interval);
  }, [isRunning]);

  const palette =
    color === "blue"
      ? { body: "#3b82f6", dark: "#1d4ed8", skin: "#fcd34d", eye: "#1e293b", hair: "#92400e", shoe: "#1e3a5f" }
      : { body: "#ef4444", dark: "#b91c1c", skin: "#fcd34d", eye: "#1e293b", hair: "#4a2000", shoe: "#7f1d1d" };

  // Head + torso rows (shared across all frames) — rows 0-10
  // 0=transparent, 1=hair, 2=skin, 3=eye, 4=body, 5=dark body, 7=shoe, 8=mouth
  const upper = [
    /*  0 */ [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    /*  1 */ [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    /*  2 */ [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    /*  3 */ [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
    /*  4 */ [0,0,0,2,2,3,2,2,2,2,3,2,2,0,0,0],
    /*  5 */ [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
    /*  6 */ [0,0,0,0,2,2,2,8,8,2,2,2,0,0,0,0],
    /*  7 */ [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
    /*  8 */ [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    /*  9 */ [0,0,0,4,4,5,4,4,4,4,5,4,4,0,0,0],
    /* 10 */ [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
  ];

  // Neutral legs (standing still)
  const legsNeutral = [
    /* 11 */ [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    /* 12 */ [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    /* 13 */ [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    /* 14 */ [0,0,0,0,0,7,7,0,0,7,7,0,0,0,0,0],
    /* 15 */ [0,0,0,0,0,7,7,0,0,7,7,0,0,0,0,0],
  ];

  // Frame A: left leg extended forward, right leg extended back
  const legsFrameA = [
    /* 11 */ [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
    /* 12 */ [0,0,0,2,2,0,0,0,0,0,0,2,0,0,0,0],
    /* 13 */ [0,0,2,2,0,0,0,0,0,0,0,2,2,0,0,0],
    /* 14 */ [0,7,7,7,0,0,0,0,0,0,0,0,7,0,0,0],
    /* 15 */ [0,7,7,0,0,0,0,0,0,0,0,0,7,7,0,0],
  ];

  // Frame B: right leg extended forward, left leg extended back
  const legsFrameB = [
    /* 11 */ [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
    /* 12 */ [0,0,0,0,2,0,0,0,0,0,2,2,0,0,0,0],
    /* 13 */ [0,0,0,2,2,0,0,0,0,0,0,2,2,0,0,0],
    /* 14 */ [0,0,0,7,0,0,0,0,0,0,7,7,7,0,0,0],
    /* 15 */ [0,0,7,7,0,0,0,0,0,0,0,7,7,0,0,0],
  ];

  let legs: number[][];
  if (!isRunning && !isCelebrating) {
    legs = legsNeutral;
  } else if (isCelebrating) {
    // Celebration: wide stance
    legs = legsFrameA;
  } else {
    legs = frame === 0 ? legsFrameA : legsFrameB;
  }

  const sprite = [...upper, ...legs];

  const colorMap: Record<number, string> = {
    0: "transparent",
    1: palette.hair,
    2: palette.skin,
    3: palette.eye,
    4: palette.body,
    5: palette.dark,
    7: palette.shoe,
    8: "#ef4444",
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
