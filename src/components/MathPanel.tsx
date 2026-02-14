"use client";

import React, { useState, useCallback, useRef } from "react";

export interface Equation {
  a: number;
  b: number;
  op: "+" | "-" | "*" | "/";
  shown: number; // the result displayed (may be wrong)
  isCorrect: boolean; // whether shown === real answer
}

interface MathPanelProps {
  player: 1 | 2;
  equation: Equation | null;
  progress: number;
  totalQuestions: number;
  onAnswer: (answeredCorrectly: boolean) => void;
  disabled: boolean;
  color: string;
  bgColor: string;
}

/**
 * Side panel showing a math equation and ✓ / ✗ buttons.
 * Player taps ✓ if the shown answer is correct, ✗ if it's wrong.
 * Gives instant visual feedback (green flash / red flash).
 */
export default function MathPanel({
  player,
  equation,
  progress,
  totalQuestions,
  onAnswer,
  disabled,
  color,
  bgColor,
}: MathPanelProps) {
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const lockedRef = useRef(false);

  const handleAnswer = useCallback(
    (playerSaysCorrect: boolean) => {
      if (disabled || !equation || lockedRef.current) return;

      // Lock to prevent double-tap registering on the next equation
      lockedRef.current = true;
      setTimeout(() => { lockedRef.current = false; }, 350);

      // Did the player judge correctly?
      const judgedRight =
        (playerSaysCorrect && equation.isCorrect) ||
        (!playerSaysCorrect && !equation.isCorrect);

      setFlash(judgedRight ? "correct" : "wrong");
      setTimeout(() => setFlash(null), 400);

      onAnswer(judgedRight);
    },
    [disabled, equation, onAnswer]
  );

  // Use onTouchStart for multi-touch support (iPad two-player simultaneous taps).
  // preventDefault stops the browser from synthesizing a click (no double-fire).
  // onClick is kept as fallback for mouse / desktop.
  const handleTouch = useCallback(
    (playerSaysCorrect: boolean) => (e: React.TouchEvent) => {
      e.preventDefault();
      handleAnswer(playerSaysCorrect);
    },
    [handleAnswer]
  );

  return (
    <div
      className={`math-panel relative flex flex-col items-center justify-between h-full px-2 py-4 ${
        flash === "correct" ? "flash-correct" : flash === "wrong" ? "flash-wrong" : ""
      }`}
      style={{ background: bgColor }}
    >
      {/* Player label */}
      <div
        className="player-label text-white text-center px-3 py-2 rounded-lg w-full"
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "11px",
          background: color,
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        PLAYER {player}
      </div>

      {/* Progress dots */}
      <div className="progress-dots flex gap-1.5 flex-wrap justify-center mt-2 px-1">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < progress
                ? "dot-done"
                : i === progress
                ? "dot-current"
                : "dot-pending"
            }`}
          />
        ))}
      </div>

      {/* Equation display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
        {equation ? (
          <div className="text-center">
            <div
              className="eq-text text-white mb-2"
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "24px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {equation.a} {equation.op === "*" ? "\u00d7" : equation.op === "/" ? "\u00f7" : equation.op} {equation.b}
            </div>
            <div className="eq-equals text-white/60 text-lg mb-1" style={{ fontFamily: "var(--font-pixel)", fontSize: "14px" }}>
              =
            </div>
            <div
              className="eq-answer text-yellow-300 font-bold"
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "28px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {equation.shown}
            </div>
          </div>
        ) : (
          <div
            className="text-white/50 text-center"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "10px" }}
          >
            {progress >= totalQuestions ? "DONE! 🎉" : "GET READY!"}
          </div>
        )}
      </div>

      {/* Answer buttons */}
      <div className="btn-row flex gap-3 w-full px-2 mt-2">
        <button
          className="btn-correct btn-answer flex-1 rounded-xl py-4 text-white text-3xl font-bold disabled:opacity-40"
          onTouchStart={handleTouch(true)}
          onClick={() => handleAnswer(true)}
          disabled={disabled || !equation}
          aria-label="Correct"
        >
          ✓
        </button>
        <button
          className="btn-wrong btn-answer flex-1 rounded-xl py-4 text-white text-3xl font-bold disabled:opacity-40"
          onTouchStart={handleTouch(false)}
          onClick={() => handleAnswer(false)}
          disabled={disabled || !equation}
          aria-label="Wrong"
        >
          ✗
        </button>
      </div>

      {/* Score indicator */}
      <div
        className="score-text text-white/70 mt-2"
        style={{ fontFamily: "var(--font-pixel)", fontSize: "8px" }}
      >
        {progress}/{totalQuestions}
      </div>
    </div>
  );
}
