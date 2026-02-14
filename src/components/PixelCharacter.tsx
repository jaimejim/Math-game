"use client";

import React, { useState, useEffect } from "react";

export interface CharacterPalette {
  name: string;
  hair: string;
  skin: string;
  eye: string;
  body: string;
  dark: string;
  pants: string;
  shoe: string;
  mouth: string;
  blush: string;
  stick?: string;
  hairStyle?: "long" | "mushroom";
}

/** 15 selectable character palettes */
export const CHARACTERS: CharacterPalette[] = [
  { name: "Alex",     hair: "#8B5E3C", skin: "#FFD5A5", eye: "#222034", body: "#4A9EFF", dark: "#2563EB", pants: "#2D3A4F", shoe: "#FF6B6B", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Ruby",     hair: "#2D1B2E", skin: "#FFD5A5", eye: "#222034", body: "#FF5757", dark: "#D92B2B", pants: "#3D2D4F", shoe: "#5BA3FF", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Sunny",    hair: "#E8C858", skin: "#FFD5A5", eye: "#222034", body: "#FFC107", dark: "#E6A800", pants: "#3B5249", shoe: "#4CAF50", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Jade",     hair: "#1A1A2E", skin: "#FFD5A5", eye: "#222034", body: "#2ECC71", dark: "#1FA855", pants: "#2D3A4F", shoe: "#FF9800", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Coral",    hair: "#D46A3A", skin: "#FFD5A5", eye: "#222034", body: "#FF8A9E", dark: "#E5667A", pants: "#4A3A50", shoe: "#4DD0C9", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Storm",    hair: "#9CA3AF", skin: "#FFD5A5", eye: "#222034", body: "#8B5CF6", dark: "#6D28D9", pants: "#1E293B", shoe: "#FBBF24", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Mint",     hair: "#5C3317", skin: "#FFD5A5", eye: "#222034", body: "#14B8A6", dark: "#0D9488", pants: "#3D2D4F", shoe: "#F472B6", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Blaze",    hair: "#6B2020", skin: "#FFD5A5", eye: "#222034", body: "#FF7B00", dark: "#E66A00", pants: "#2D3A4F", shoe: "#3B82F6", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Giulia",   hair: "#8B5E3C", skin: "#FFD5A5", eye: "#222034", body: "#FF69B4", dark: "#E5507A", pants: "#FF8AC4", shoe: "#FFFFFF", mouth: "#FF6B6B", blush: "#FFB3B3", hairStyle: "long" },
  { name: "Giacomo",  hair: "#8B5E3C", skin: "#FFD5A5", eye: "#222034", body: "#FF8C00", dark: "#E67700", pants: "#2563EB", shoe: "#1D4ED8", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Giovanni", hair: "#1A1A2E", skin: "#FFD5A5", eye: "#222034", body: "#FFD5A5", dark: "#F0C090", pants: "#FFFFFF", shoe: "#FFD5A5", mouth: "#FF6B6B", blush: "#FFB3B3", hairStyle: "mushroom" },
  { name: "Papa",     hair: "#FFD5A5", skin: "#FFD5A5", eye: "#222034", body: "#1A1A2E", dark: "#111111", pants: "#F0F0F0", shoe: "#111111", mouth: "#FF6B6B", blush: "#FFB3B3" },
  { name: "Mamma",    hair: "#8B5E3C", skin: "#FFD5A5", eye: "#222034", body: "#009246", dark: "#007A3A", pants: "#FFFFFF", shoe: "#CE2B37", mouth: "#FF6B6B", blush: "#FFB3B3", hairStyle: "long" },
  { name: "Nonno",    hair: "#D4D4D4", skin: "#FFD5A5", eye: "#222034", body: "#6B7280", dark: "#4B5563", pants: "#4A3A3A", shoe: "#5C3A1E", mouth: "#FF6B6B", blush: "#FFB3B3", stick: "#8B5A2B" },
  { name: "Nonna",    hair: "#D4D4D4", skin: "#FFD5A5", eye: "#222034", body: "#6B7280", dark: "#4B5563", pants: "#4A3A3A", shoe: "#5C3A1E", mouth: "#FF6B6B", blush: "#FFB3B3", stick: "#8B5A2B", hairStyle: "long" },
];

interface PixelCharacterProps {
  /** Index into CHARACTERS array */
  charIndex: number;
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
  charIndex,
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
  const palette = CHARACTERS[charIndex] ?? CHARACTERS[0];

  // Head + torso rows — rows 0-10
  // Chibi proportions: large round head (rows 0-6), small torso (rows 7-10)

  // Default short hair
  const upperDefault = [
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

  // Long hair: cascades down the sides past shoulders
  const upperLong = [
    /*  0 */ [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    /*  1 */ [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    /*  2 */ [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    /*  3 */ [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
    /*  4 */ [0,0,1,2,2,3,2,2,2,2,3,2,2,1,0,0],
    /*  5 */ [0,0,1,2,2,2,9,2,2,9,2,2,2,1,0,0],
    /*  6 */ [0,0,1,0,2,2,2,8,8,2,2,2,0,1,0,0],
    /*  7 */ [0,0,1,0,4,4,4,4,4,4,4,4,0,1,0,0],
    /*  8 */ [0,0,1,2,4,4,5,4,4,5,4,4,2,1,0,0],
    /*  9 */ [0,0,1,0,4,4,4,4,4,4,4,4,0,1,0,0],
    /* 10 */ [0,0,1,0,0,6,6,6,6,6,6,0,0,1,0,0],
  ];

  // Mushroom / bowl-cut hair: wide dome cap with straight fringe
  const upperMushroom = [
    /*  0 */ [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    /*  1 */ [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    /*  2 */ [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    /*  3 */ [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    /*  4 */ [0,0,0,2,2,3,2,2,2,2,3,2,2,0,0,0],
    /*  5 */ [0,0,0,2,2,2,9,2,2,9,2,2,2,0,0,0],
    /*  6 */ [0,0,0,0,2,2,2,8,8,2,2,2,0,0,0,0],
    /*  7 */ [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    /*  8 */ [0,0,0,2,4,4,5,4,4,5,4,4,2,0,0,0],
    /*  9 */ [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    /* 10 */ [0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,0],
  ];

  const upper = palette.hairStyle === "long"
    ? upperLong
    : palette.hairStyle === "mushroom"
    ? upperMushroom
    : upperDefault;

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
        {/* Walking stick overlay for characters with stick */}
        {palette.stick && (
          <>
            {/* Handle (T-shape at top) */}
            <rect x={13 * px} y={7 * px} width={px + 0.5} height={px + 0.5} fill={palette.stick} />
            <rect x={14 * px} y={7 * px} width={px + 0.5} height={px + 0.5} fill={palette.stick} />
            {/* Shaft */}
            {[8, 9, 10, 11, 12, 13, 14, 15].map((y) => (
              <rect
                key={`stick-${y}`}
                x={13 * px}
                y={y * px}
                width={px + 0.5}
                height={px + 0.5}
                fill={palette.stick!}
              />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
