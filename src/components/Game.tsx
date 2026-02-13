"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import MathPanel, { Equation } from "./MathPanel";
import RoadTrack from "./RoadTrack";
import Confetti from "./Confetti";
import PixelCharacter, { CHARACTERS } from "./PixelCharacter";
import {
  startBGM,
  stopBGM,
  playCorrectSFX,
  playWrongSFX,
  playWinSFX,
  setVolume,
} from "./ChiptuneAudio";

const TOTAL_QUESTIONS = 10;
const PENALTY = 3; // go back 3 steps on wrong answer

type Difficulty = "easy" | "medium" | "hard";
type GameState = "menu" | "playing" | "finished";

/** Pick a random operator based on difficulty */
function pickOp(difficulty: Difficulty): "+" | "-" | "*" | "/" {
  const ops: ("+" | "-" | "*" | "/")[] =
    difficulty === "easy"
      ? ["+", "-"]
      : difficulty === "medium"
      ? ["+", "-", "*"]
      : ["+", "-", "*", "/"];
  return ops[Math.floor(Math.random() * ops.length)];
}

/** Generate an equation appropriate for the chosen difficulty */
function generateEquation(difficulty: Difficulty): Equation {
  const op = pickOp(difficulty);
  let a: number, b: number, realAnswer: number;

  const easy = difficulty === "easy";

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * (easy ? 9 : 20)) + 1;
      b = Math.floor(Math.random() * (easy ? 9 : 20)) + 1;
      realAnswer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * (easy ? 7 : 20)) + (easy ? 2 : 5);
      b = Math.floor(Math.random() * (a - 1)) + 1;
      realAnswer = a - b;
      break;
    case "*":
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      realAnswer = a * b;
      break;
    case "/":
      // Generate clean division: pick b and result, then a = b * result
      b = Math.floor(Math.random() * 9) + 2; // 2-10
      realAnswer = Math.floor(Math.random() * 10) + 1; // 1-10
      a = b * realAnswer;
      break;
  }

  // ~50% chance of showing the correct answer
  const isCorrect = Math.random() > 0.45;
  let shown: number;

  if (isCorrect) {
    shown = realAnswer;
  } else {
    const offset = Math.floor(Math.random() * 3) + 1;
    shown = Math.random() > 0.5 ? realAnswer + offset : realAnswer - offset;
    if (shown < 0) shown = realAnswer + offset;
  }

  return { a, b, op, shown, isCorrect };
}

const DIFFICULTY_META: Record<Difficulty, { label: string; desc: string; color: string; shadow: string }> = {
  easy:   { label: "EASY",   desc: "+ and -",          color: "#22c55e", shadow: "#15803d" },
  medium: { label: "MEDIUM", desc: "+ - and x",        color: "#f59e0b", shadow: "#b45309" },
  hard:   { label: "HARD",   desc: "+ - x and \u00f7", color: "#ef4444", shadow: "#b91c1c" },
};

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [p1Progress, setP1Progress] = useState(0);
  const [p2Progress, setP2Progress] = useState(0);
  const [p1Equation, setP1Equation] = useState<Equation | null>(null);
  const [p2Equation, setP2Equation] = useState<Equation | null>(null);
  const [winner, setWinner] = useState<null | 1 | 2>(null);
  const [p1Answered, setP1Answered] = useState(0);
  const [p2Answered, setP2Answered] = useState(0);

  const [p1Stumble, setP1Stumble] = useState(false);
  const [p2Stumble, setP2Stumble] = useState(false);
  const [p1Char, setP1Char] = useState(0);
  const [p2Char, setP2Char] = useState(1);
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const winnerRef = useRef<null | 1 | 2>(null);
  const diffRef = useRef<Difficulty>("easy");

  const startGame = useCallback((diff: Difficulty) => {
    diffRef.current = diff;
    setDifficulty(diff);
    setGameState("playing");
    setP1Progress(0);
    setP2Progress(0);
    setP1Answered(0);
    setP2Answered(0);
    setWinner(null);
    winnerRef.current = null;
    setP1Equation(generateEquation(diff));
    setP2Equation(generateEquation(diff));
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
          setP1Equation(generateEquation(diffRef.current));
        } else {
          setP1Equation(null);
        }
      } else {
        playWrongSFX();
        const newProgress = Math.max(0, p1Progress - PENALTY);
        setP1Progress(newProgress);
        setP1Equation(generateEquation(diffRef.current));
        setP1Stumble(true);
        setTimeout(() => setP1Stumble(false), 600);
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
          setP2Equation(generateEquation(diffRef.current));
        } else {
          setP2Equation(null);
        }
      } else {
        playWrongSFX();
        const newProgress = Math.max(0, p2Progress - PENALTY);
        setP2Progress(newProgress);
        setP2Equation(generateEquation(diffRef.current));
        setP2Stumble(true);
        setTimeout(() => setP2Stumble(false), 600);
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

        {/* Character selector */}
        <div className="relative z-10 flex items-center gap-6 mb-6">
          {/* Player 1 picker */}
          <div className="text-center">
            <span className="text-blue-400 block mb-2" style={{ fontFamily: "var(--font-pixel)", fontSize: "9px" }}>
              PLAYER 1
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setP1Char((c) => (c - 1 + CHARACTERS.length) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
                aria-label="Previous character"
              >
                ‹
              </button>
              <div className="flex flex-col items-center">
                <PixelCharacter charIndex={p1Char} isRunning={false} isCelebrating={false} size={56} />
                <span className="text-yellow-300 mt-1" style={{ fontFamily: "var(--font-pixel)", fontSize: "7px" }}>
                  {CHARACTERS[p1Char].name}
                </span>
              </div>
              <button
                onClick={() => setP1Char((c) => (c + 1) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
                aria-label="Next character"
              >
                ›
              </button>
            </div>
          </div>

          <div className="text-3xl text-yellow-300 self-center" style={{ fontFamily: "var(--font-pixel)" }}>
            VS
          </div>

          {/* Player 2 picker */}
          <div className="text-center">
            <span className="text-red-400 block mb-2" style={{ fontFamily: "var(--font-pixel)", fontSize: "9px" }}>
              PLAYER 2
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setP2Char((c) => (c - 1 + CHARACTERS.length) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
                aria-label="Previous character"
              >
                ‹
              </button>
              <div className="flex flex-col items-center">
                <PixelCharacter charIndex={p2Char} isRunning={false} isCelebrating={false} size={56} />
                <span className="text-yellow-300 mt-1" style={{ fontFamily: "var(--font-pixel)", fontSize: "7px" }}>
                  {CHARACTERS[p2Char].name}
                </span>
              </div>
              <button
                onClick={() => setP2Char((c) => (c + 1) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
                aria-label="Next character"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Difficulty selector */}
        <div
          className="relative z-10 text-white/60 mb-3"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "10px" }}
        >
          CHOOSE DIFFICULTY
        </div>
        <div className="relative z-10 flex gap-4">
          {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => {
            const meta = DIFFICULTY_META[diff];
            return (
              <button
                key={diff}
                onClick={() => startGame(diff)}
                className="px-6 py-4 text-white rounded-2xl transition-all active:scale-95"
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "14px",
                  background: meta.color,
                  boxShadow: `0 6px 0 ${meta.shadow}, 0 8px 20px rgba(0,0,0,0.4)`,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {meta.label}
                <div style={{ fontSize: "7px", marginTop: "6px", opacity: 0.8 }}>
                  {meta.desc}
                </div>
              </button>
            );
          })}
        </div>

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
          p1Stumble={p1Stumble}
          p2Stumble={p2Stumble}
          p1Char={p1Char}
          p2Char={p2Char}
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
          onClick={() => startGame(difficulty)}
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
