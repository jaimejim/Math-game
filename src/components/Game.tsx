"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import MathPanel, { Equation } from "./MathPanel";
import RoadTrack from "./RoadTrack";
import Confetti from "./Confetti";
import {
  startBGM,
  stopBGM,
  playCorrectSFX,
  playWrongSFX,
  playWinSFX,
  setVolume,
} from "./ChiptuneAudio";

const TOTAL_QUESTIONS = 10;
const PENALTY = 2; // go back 2 steps on wrong answer

/** Generate a simple addition or subtraction equation for kids */
function generateEquation(): Equation {
  const op = Math.random() > 0.5 ? "+" : "-";
  let a: number, b: number, realAnswer: number;

  if (op === "+") {
    a = Math.floor(Math.random() * 20) + 1; // 1-20
    b = Math.floor(Math.random() * 20) + 1;
    realAnswer = a + b;
  } else {
    // Ensure non-negative result
    a = Math.floor(Math.random() * 20) + 5; // 5-24
    b = Math.floor(Math.random() * a) + 1; // 1 to a
    realAnswer = a - b;
  }

  // ~50% chance of showing the correct answer
  const isCorrect = Math.random() > 0.45;
  let shown: number;

  if (isCorrect) {
    shown = realAnswer;
  } else {
    // Show a wrong answer (offset by 1-3)
    const offset = Math.floor(Math.random() * 3) + 1;
    shown = Math.random() > 0.5 ? realAnswer + offset : realAnswer - offset;
    // Avoid negative shown values
    if (shown < 0) shown = realAnswer + offset;
  }

  return { a, b, op, shown, isCorrect };
}

type GameState = "menu" | "playing" | "finished";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [p1Progress, setP1Progress] = useState(0);
  const [p2Progress, setP2Progress] = useState(0);
  const [p1Equation, setP1Equation] = useState<Equation | null>(null);
  const [p2Equation, setP2Equation] = useState<Equation | null>(null);
  const [winner, setWinner] = useState<null | 1 | 2>(null);
  const [p1Answered, setP1Answered] = useState(0); // questions answered
  const [p2Answered, setP2Answered] = useState(0);

  const [muted, setMuted] = useState(false);
  const winnerRef = useRef<null | 1 | 2>(null);

  const startGame = useCallback(() => {
    setGameState("playing");
    setP1Progress(0);
    setP2Progress(0);
    setP1Answered(0);
    setP2Answered(0);
    setWinner(null);
    winnerRef.current = null;
    setP1Equation(generateEquation());
    setP2Equation(generateEquation());
    startBGM();
  }, []);

  const checkWinner = useCallback((player: 1 | 2, newProgress: number) => {
    if (winnerRef.current !== null) return;
    if (newProgress >= TOTAL_QUESTIONS) {
      winnerRef.current = player;
      setWinner(player);
      setGameState("finished");
      stopBGM();
      playWinSFX();
    }
  }, []);

  const handleP1Answer = useCallback(
    (correct: boolean) => {
      if (winnerRef.current !== null) return;

      const newAnswered = p1Answered + 1;
      setP1Answered(newAnswered);

      if (correct) {
        playCorrectSFX();
        const newProgress = p1Progress + 1;
        setP1Progress(newProgress);
        checkWinner(1, newProgress);
        if (newProgress < TOTAL_QUESTIONS) {
          setP1Equation(generateEquation());
        } else {
          setP1Equation(null);
        }
      } else {
        playWrongSFX();
        const newProgress = Math.max(0, p1Progress - PENALTY);
        setP1Progress(newProgress);
        setP1Equation(generateEquation());
      }
    },
    [p1Progress, p1Answered, checkWinner]
  );

  const handleP2Answer = useCallback(
    (correct: boolean) => {
      if (winnerRef.current !== null) return;

      const newAnswered = p2Answered + 1;
      setP2Answered(newAnswered);

      if (correct) {
        playCorrectSFX();
        const newProgress = p2Progress + 1;
        setP2Progress(newProgress);
        checkWinner(2, newProgress);
        if (newProgress < TOTAL_QUESTIONS) {
          setP2Equation(generateEquation());
        } else {
          setP2Equation(null);
        }
      } else {
        playWrongSFX();
        const newProgress = Math.max(0, p2Progress - PENALTY);
        setP2Progress(newProgress);
        setP2Equation(generateEquation());
      }
    },
    [p2Progress, p2Answered, checkWinner]
  );

  // Keyboard support for testing (Q/A for P1, P/L for P2)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      switch (e.key.toLowerCase()) {
        case "q": handleP1Answer(true); break; // P1 says ✓ (q key)
        case "a": handleP1Answer(false); break; // P1 says ✗ (a key)
        case "p": handleP2Answer(true); break; // P2 says ✓ (p key)
        case "l": handleP2Answer(false); break; // P2 says ✗ (l key)
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, handleP1Answer, handleP2Answer]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      setVolume(next ? 0 : 0.3);
      return next;
    });
  }, []);

  // Stop music on unmount
  useEffect(() => {
    return () => stopBGM();
  }, []);

  // ── Menu Screen ──
  if (gameState === "menu") {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 overflow-hidden">
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${1 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div className="relative z-10 text-center mb-8">
          <h1
            className="text-yellow-300 mb-4"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "clamp(20px, 5vw, 36px)", textShadow: "3px 3px 6px rgba(0,0,0,0.7)" }}
          >
            🏃 MATH RACE! 🏃
          </h1>
          <p
            className="text-white/70 max-w-md mx-auto px-4"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "clamp(8px, 2vw, 11px)", lineHeight: "1.8" }}
          >
            Two players race by solving math!
            <br />
            Tap ✓ if the answer is RIGHT
            <br />
            Tap ✗ if the answer is WRONG
            <br />
            Wrong = {PENALTY} steps back!
            <br />
            First to {TOTAL_QUESTIONS} wins! 🏆
          </p>
        </div>

        {/* Characters preview */}
        <div className="relative z-10 flex gap-12 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-2">🧑‍🦱</div>
            <span className="text-blue-400" style={{ fontFamily: "var(--font-pixel)", fontSize: "10px" }}>
              PLAYER 1
            </span>
          </div>
          <div className="text-4xl text-yellow-300 self-center" style={{ fontFamily: "var(--font-pixel)" }}>
            VS
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">👩‍🦰</div>
            <span className="text-red-400" style={{ fontFamily: "var(--font-pixel)", fontSize: "10px" }}>
              PLAYER 2
            </span>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          className="relative z-10 px-10 py-5 bg-green-500 hover:bg-green-400 text-white rounded-2xl transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "18px",
            boxShadow: "0 6px 0 #15803d, 0 8px 20px rgba(0,0,0,0.4)",
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          START RACE!
        </button>

        {/* Keyboard hint */}
        <div
          className="relative z-10 mt-6 text-white/30 text-center"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", lineHeight: "1.8" }}
        >
          Keyboard: P1 → Q(✓) A(✗) | P2 → P(✓) L(✗)
        </div>
      </div>
    );
  }

  // ── Game / Finished Screen ──
  const isPlaying = gameState === "playing" && winner === null;

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Confetti active={winner !== null} />

      {/* Left panel - Player 1 */}
      <div className="w-[30%] min-w-0 h-full">
        <MathPanel
          player={1}
          equation={p1Equation}
          progress={p1Progress}
          totalQuestions={TOTAL_QUESTIONS}
          onAnswer={handleP1Answer}
          disabled={!isPlaying}
          color="#2563eb"
          bgColor="linear-gradient(180deg, #1e3a5f 0%, #1e293b 100%)"
        />
      </div>

      {/* Center - Road Track */}
      <div className="w-[40%] min-w-0 h-full border-x-4 border-yellow-400/50">
        <RoadTrack
          p1Progress={p1Progress}
          p2Progress={p2Progress}
          totalQuestions={TOTAL_QUESTIONS}
          winner={winner}
          isPlaying={isPlaying}
        />
      </div>

      {/* Right panel - Player 2 */}
      <div className="w-[30%] min-w-0 h-full">
        <MathPanel
          player={2}
          equation={p2Equation}
          progress={p2Progress}
          totalQuestions={TOTAL_QUESTIONS}
          onAnswer={handleP2Answer}
          disabled={!isPlaying}
          color="#dc2626"
          bgColor="linear-gradient(180deg, #5f1e1e 0%, #1e293b 100%)"
        />
      </div>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all text-xl"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* Play Again button when finished */}
      {winner && (
        <button
          onClick={startGame}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "14px",
            boxShadow: "0 6px 0 #15803d, 0 8px 20px rgba(0,0,0,0.4)",
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          PLAY AGAIN! 🔄
        </button>
      )}
    </div>
  );
}
