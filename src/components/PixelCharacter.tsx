"use client";

import React, { useState, useEffect } from "react";

interface PixelCharacterProps {
  color: "blue" | "red";
  isRunning: boolean;
  isCelebrating: boolean;
  isStumbling?: boolean;
  size?: number;
}

/**
 * Chibi-style pixel-art runner inspired by casual character pixel art.
 * Big round head, rosy cheeks, colorful shirt, dark pants, chunky sneakers.
 * 16x16 grid rendered as SVG rects.
 */
export default function PixelCharacter({
  color,
  isRunning,
  isCelebrating,
  isStumbling = false,
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

  // 0=transparent 1=hair 2=skin 3=eye 4=body 5=dark-body
  // 6=pants 7=shoe 8=mouth 9=blush/cheek
  const palette =
    color === "blue"
      ? {
          hair: "#8B5E3C", skin: "#FFD5A5", eye: "#222034",
          body: "#4A9EFF", dark: "#2563EB", pants: "#2D3A4F",
          shoe: "#FF6B6B", mouth: "#FF6B6B", blush: "#FFB3B3",
        }
      : {
          hair: "#2D1B2E", skin: "#FFD5A5", eye: "#222034",
          body: "#FF5757", dark: "#D92B2B", pants: "#3D2D4F",
          shoe: "#5BA3FF", mouth: "#FF6B6B", blush: "#FFB3B3",
        };

  // Head + torso rows (shared across all frames) — rows 0-10
  // Chibi proportions: large round head (rows 0-6), small torso (rows 7-10)
  const upper = [
    /*  0 */ [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    /*  1 */ [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    /*  2 */ [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    /*  3 */ [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
    /*  4 */ [0,0,1,2,2,3,2,2,2,2,3,2,2,1,0,0],
    /*  5 */ [0,0,0,2,2,2,9,2,2,9,2,2,2,0,0,0],
    /*  6 */ [0,0,0,0,2,2,2,8,8,2,2,2,0,0,0,0],
    /*  7 */ [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    /*  8 */ [0,0,0,2,4,4,5,4,4,5,4,4,2,0,0,0],
    /*  9 */ [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    /* 10 */ [0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,0],
  ];

  // Neutral legs (standing still) — pants + chunky sneakers
  const legsNeutral = [
    /* 11 */ [0,0,0,0,0,6,6,0,0,6,6,0,0,0,0,0],
    /* 12 */ [0,0,0,0,0,6,6,0,0,6,6,0,0,0,0,0],
    /* 13 */ [0,0,0,0,0,6,6,0,0,6,6,0,0,0,0,0],
    /* 14 */ [0,0,0,0,0,7,7,0,0,7,7,0,0,0,0,0],
    /* 15 */ [0,0,0,0,7,7,7,0,0,7,7,7,0,0,0,0],
  ];

  // Frame A: left leg forward, right leg back
  const legsFrameA = [
    /* 11 */ [0,0,0,0,6,6,0,0,0,0,6,6,0,0,0,0],
    /* 12 */ [0,0,0,6,6,0,0,0,0,0,0,6,0,0,0,0],
    /* 13 */ [0,0,6,6,0,0,0,0,0,0,0,6,6,0,0,0],
    /* 14 */ [0,7,7,7,0,0,0,0,0,0,0,0,7,0,0,0],
    /* 15 */ [7,7,7,0,0,0,0,0,0,0,0,0,7,7,0,0],
  ];

  // Frame B: right leg forward, left leg back
  const legsFrameB = [
    /* 11 */ [0,0,0,0,6,6,0,0,0,0,6,6,0,0,0,0],
    /* 12 */ [0,0,0,0,6,0,0,0,0,0,6,6,0,0,0,0],
    /* 13 */ [0,0,0,6,6,0,0,0,0,0,0,6,6,0,0,0],
    /* 14 */ [0,0,0,7,0,0,0,0,0,0,7,7,7,0,0,0],
    /* 15 */ [0,0,7,7,0,0,0,0,0,0,0,7,7,7,0,0],
  ];

  // Stumble legs: splayed out flat (fallen over)
  const legsStumble = [
    /* 11 */ [0,0,0,0,0,6,6,0,0,6,6,0,0,0,0,0],
    /* 12 */ [0,0,0,0,6,6,0,0,0,0,6,6,0,0,0,0],
    /* 13 */ [0,0,6,6,0,0,0,0,0,0,0,0,6,6,0,0],
    /* 14 */ [0,7,7,0,0,0,0,0,0,0,0,0,0,7,7,0],
    /* 15 */ [7,7,0,0,0,0,0,0,0,0,0,0,0,0,7,7],
  ];

  let legs: number[][];
  if (isStumbling) {
    legs = legsStumble;
  } else if (!isRunning && !isCelebrating) {
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
    6: palette.pants,
    7: palette.shoe,
    8: palette.mouth,
    9: palette.blush,
  };

  const px = size / 16;

  const animClass = isStumbling
    ? "char-stumble"
    : isCelebrating
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
