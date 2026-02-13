"use client";

import React, { useMemo } from "react";
import PixelCharacter from "./PixelCharacter";

interface RoadTrackProps {
  p1Progress: number; // 0-10
  p2Progress: number;
  totalQuestions: number;
  winner: null | 1 | 2;
  isPlaying: boolean;
}

/**
 * The center column: a scrolling grass/road with two runners.
 * Characters' vertical positions reflect their progress toward the finish line.
 * Road background scrolls upward continuously while the game is active.
 */
export default function RoadTrack({
  p1Progress,
  p2Progress,
  totalQuestions,
  winner,
  isPlaying,
}: RoadTrackProps) {
  // Scenery elements that scroll down the road
  const sceneryItems = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: Math.random() > 0.5 ? `${5 + Math.random() * 15}%` : `${80 + Math.random() * 15}%`,
      delay: `${i * 1.2}s`,
      type: i % 3, // 0=tree, 1=flower, 2=rock
    }));
  }, []);

  // Convert progress to vertical position percentage (bottom = start, top = finish)
  const p1Pct = Math.min((p1Progress / totalQuestions) * 100, 100);
  const p2Pct = Math.min((p2Progress / totalQuestions) * 100, 100);

  // Position: at 0% progress, char is near bottom; at 100% near top
  const trackHeight = 75; // percentage of the track area used
  const topOffset = 8; // leave room for finish line at top

  const p1Bottom = topOffset + (p1Pct / 100) * trackHeight;
  const p2Bottom = topOffset + (p2Pct / 100) * trackHeight;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Road/grass background */}
      <div
        className={`absolute inset-0 ${isPlaying || winner ? "road-bg" : ""}`}
        style={{
          backgroundColor: "#6b7b3a",
          animationPlayState: isPlaying ? "running" : "paused",
        }}
      />

      {/* Scrolling scenery */}
      {isPlaying &&
        sceneryItems.map((item) => (
          <div
            key={item.id}
            className="absolute text-2xl"
            style={{
              left: item.left,
              animation: `scenery-scroll 4s linear ${item.delay} infinite`,
            }}
          >
            {item.type === 0 ? "🌳" : item.type === 1 ? "🌻" : "🪨"}
          </div>
        ))}

      {/* Lane markings / center divider */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 opacity-30"
        style={{
          backgroundImage: "repeating-linear-gradient(180deg, #fff 0px, #fff 15px, transparent 15px, transparent 35px)",
          backgroundSize: "100% 50px",
          animation: isPlaying ? "road-scroll 0.6s linear infinite" : "none",
        }}
      />

      {/* Finish line at top */}
      <div className="absolute top-[5%] left-[5%] right-[5%] h-6 finish-line rounded z-10 opacity-90" />
      <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20 text-xs text-white font-bold whitespace-nowrap"
        style={{ fontFamily: "var(--font-pixel)", fontSize: "8px", textShadow: "1px 1px 2px #000" }}
      >
        FINISH
      </div>

      {/* Start line at bottom */}
      <div className="absolute bottom-[5%] left-[10%] right-[10%] h-2 bg-white/40 rounded z-10" />
      <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-20 text-xs text-white/60 whitespace-nowrap"
        style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", textShadow: "1px 1px 2px #000" }}
      >
        START
      </div>

      {/* Player 1 (left lane) - Blue */}
      <div
        className="absolute z-30 transition-all duration-500 ease-out"
        style={{
          left: "15%",
          bottom: `${p1Bottom}%`,
          transform: "translateX(-50%)",
        }}
      >
        <PixelCharacter
          color="blue"
          isRunning={isPlaying && winner === null}
          isCelebrating={winner === 1}
          size={64}
        />
        <div
          className="text-center mt-1 text-white font-bold"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "6px", textShadow: "1px 1px 2px #000" }}
        >
          P1
        </div>
      </div>

      {/* Player 2 (right lane) - Red */}
      <div
        className="absolute z-30 transition-all duration-500 ease-out"
        style={{
          right: "15%",
          bottom: `${p2Bottom}%`,
          transform: "translateX(50%)",
        }}
      >
        <PixelCharacter
          color="red"
          isRunning={isPlaying && winner === null}
          isCelebrating={winner === 2}
          size={64}
        />
        <div
          className="text-center mt-1 text-white font-bold"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "6px", textShadow: "1px 1px 2px #000" }}
        >
          P2
        </div>
      </div>

      {/* Winner trophy overlay */}
      {winner && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40">
          <div className="trophy-bounce text-7xl mb-4">🏆</div>
          <div
            className="text-white text-center px-4 py-2 rounded-lg"
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "14px",
              textShadow: "2px 2px 4px #000",
              background: winner === 1
                ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                : "linear-gradient(135deg, #ef4444, #b91c1c)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            PLAYER {winner} WINS!
          </div>
        </div>
      )}
    </div>
  );
}
