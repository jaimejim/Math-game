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
const LB_KEY = "math-race-leaderboard";

type Difficulty = "easy" | "medium" | "hard";
type GameState = "menu" | "playing" | "finished";

interface LeaderboardEntry {
  name: string;
  time: number;
  difficulty: Difficulty;
  charIndex: number;
  date: string;
}

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(LB_KEY, JSON.stringify(entries.slice(0, 5)));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
      b = Math.floor(Math.random() * 9) + 2;
      realAnswer = Math.floor(Math.random() * 10) + 1;
      a = b * realAnswer;
      break;
  }

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

const PIX = { fontFamily: "var(--font-pixel)" };

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
  const [muted, setMuted] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const winnerRef = useRef<null | 1 | 2>(null);
  const diffRef = useRef<Difficulty>("easy");

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  // Settings panel
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Winner initials input
  const [initials, setInitials] = useState("");
  const [savedScore, setSavedScore] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { setLeaderboard(loadLeaderboard()); }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

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
    setInitials("");
    setSavedScore(false);
    setSettingsOpen(false);
    setShowLeaderboard(false);
    setP1Equation(generateEquation(diff));
    setP2Equation(generateEquation(diff));
    startBGM();
    setVolume(muted ? 0 : 0.3);
    startTimer();
  }, [startTimer, muted]);

  const goToMenu = useCallback(() => {
    stopBGM();
    stopTimer();
    setGameState("menu");
    setWinner(null);
    winnerRef.current = null;
    setSettingsOpen(false);
    setShowLeaderboard(false);
  }, [stopTimer]);

  const checkWinner = useCallback((player: 1 | 2, newProgress: number) => {
    if (winnerRef.current !== null) return;
    if (newProgress >= TOTAL_QUESTIONS) {
      winnerRef.current = player;
      setWinner(player);
      setGameState("finished");
      stopBGM();
      stopTimer();
      playWinSFX();
    }
  }, [stopTimer]);

  const handleSaveScore = useCallback(() => {
    if (!initials.trim() || !winner) return;
    const entry: LeaderboardEntry = {
      name: initials.toUpperCase().slice(0, 3),
      time: elapsed,
      difficulty,
      charIndex: winner === 1 ? p1Char : p2Char,
      date: new Date().toISOString(),
    };
    const updated = [...leaderboard, entry].sort((a, b) => a.time - b.time).slice(0, 5);
    saveLeaderboard(updated);
    setLeaderboard(updated);
    setSavedScore(true);
  }, [initials, winner, elapsed, difficulty, p1Char, p2Char, leaderboard]);

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
        case "q": handleP1Answer(true); break;
        case "a": handleP1Answer(false); break;
        case "p": handleP2Answer(true); break;
        case "l": handleP2Answer(false); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, handleP1Answer, handleP2Answer]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      setVolume(next ? 0 : 0.3);
      return next;
    });
  }, []);

  // Stop music + timer on unmount
  useEffect(() => {
    return () => { stopBGM(); stopTimer(); };
  }, [stopTimer]);

  // ── Leaderboard overlay (shared between menu and game) ──
  const leaderboardOverlay = showLeaderboard && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-indigo-950 border-2 border-yellow-400/50 rounded-2xl p-6 max-w-xs w-full mx-4">
        <h2 className="text-yellow-300 text-center mb-4" style={{ ...PIX, fontSize: "12px" }}>
          TOP 5
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-white/50 text-center" style={{ ...PIX, fontSize: "8px" }}>
            No scores yet!
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-white" style={{ ...PIX, fontSize: "8px" }}>
                <span className="text-yellow-400 w-4">{i + 1}.</span>
                <PixelCharacter charIndex={e.charIndex} isRunning={false} isCelebrating={false} size={20} />
                <span className="flex-1">{e.name}</span>
                <span className="text-green-400">{formatTime(e.time)}</span>
                <span className="text-white/40">{e.difficulty}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowLeaderboard(false)}
          className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          style={{ ...PIX, fontSize: "9px" }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );

  // ── Menu Screen ──
  if (gameState === "menu") {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 overflow-hidden">
        {leaderboardOverlay}

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

        {/* Top bar: leaderboard button */}
        <div className="fixed top-3 right-3 z-50 flex gap-2">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-yellow-300 rounded-lg transition-all"
            style={{ ...PIX, fontSize: "8px" }}
          >
            TOP 5
          </button>
        </div>

        {/* Title */}
        <div className="relative z-10 text-center mb-8">
          <h1
            className="text-yellow-300 mb-4"
            style={{ ...PIX, fontSize: "clamp(20px, 5vw, 36px)", textShadow: "3px 3px 6px rgba(0,0,0,0.7)" }}
          >
            MATH RACE!
          </h1>
          <p
            className="text-white/70 max-w-md mx-auto px-4"
            style={{ ...PIX, fontSize: "clamp(8px, 2vw, 11px)", lineHeight: "1.8" }}
          >
            Two players race by solving math!
            <br />
            Tap ✓ if the answer is RIGHT
            <br />
            Tap ✗ if the answer is WRONG
            <br />
            Wrong = {PENALTY} steps back!
            <br />
            First to {TOTAL_QUESTIONS} wins!
          </p>
        </div>

        {/* Character selector */}
        <div className="relative z-10 flex items-center gap-6 mb-6">
          {/* Player 1 picker */}
          <div className="text-center">
            <span className="text-blue-400 block mb-2" style={{ ...PIX, fontSize: "9px" }}>
              PLAYER 1
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setP1Char((c) => (c - 1 + CHARACTERS.length) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
              >
                ‹
              </button>
              <div className="flex flex-col items-center">
                <PixelCharacter charIndex={p1Char} isRunning={false} isCelebrating={false} size={56} />
                <span className="text-yellow-300 mt-1" style={{ ...PIX, fontSize: "7px" }}>
                  {CHARACTERS[p1Char].name}
                </span>
              </div>
              <button
                onClick={() => setP1Char((c) => (c + 1) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
              >
                ›
              </button>
            </div>
          </div>

          <div className="text-3xl text-yellow-300 self-center" style={PIX}>VS</div>

          {/* Player 2 picker */}
          <div className="text-center">
            <span className="text-red-400 block mb-2" style={{ ...PIX, fontSize: "9px" }}>
              PLAYER 2
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setP2Char((c) => (c - 1 + CHARACTERS.length) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
              >
                ‹
              </button>
              <div className="flex flex-col items-center">
                <PixelCharacter charIndex={p2Char} isRunning={false} isCelebrating={false} size={56} />
                <span className="text-yellow-300 mt-1" style={{ ...PIX, fontSize: "7px" }}>
                  {CHARACTERS[p2Char].name}
                </span>
              </div>
              <button
                onClick={() => setP2Char((c) => (c + 1) % CHARACTERS.length)}
                className="text-white/70 hover:text-white text-2xl px-1"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="relative z-10 text-white/60 mb-3" style={{ ...PIX, fontSize: "10px" }}>
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
                  ...PIX,
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
          style={{ ...PIX, fontSize: "7px", lineHeight: "1.8" }}
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
      {leaderboardOverlay}

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

      {/* Top bar: timer + mute + settings */}
      <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
        {/* Timer */}
        <div className="px-2 py-1 bg-black/40 text-yellow-300 rounded-lg" style={{ ...PIX, fontSize: "9px" }}>
          {formatTime(elapsed)}
        </div>
        {/* Mute */}
        <button
          onClick={toggleMute}
          className="px-2 py-1 bg-black/40 hover:bg-black/60 text-white rounded-lg transition-all"
          style={{ ...PIX, fontSize: "8px" }}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "SND OFF" : "SND ON"}
        </button>
        {/* Settings gear */}
        <button
          onClick={() => setSettingsOpen((s) => !s)}
          className="px-2 py-1 bg-black/40 hover:bg-black/60 text-white rounded-lg transition-all"
          style={{ ...PIX, fontSize: "9px" }}
        >
          :::
        </button>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50">
          <div className="bg-indigo-950 border-2 border-yellow-400/50 rounded-2xl p-5 max-w-[200px] w-full mx-4 space-y-3">
            <h3 className="text-yellow-300 text-center" style={{ ...PIX, fontSize: "10px" }}>SETTINGS</h3>
            <button
              onClick={() => { setSettingsOpen(false); startGame(difficulty); }}
              className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all"
              style={{ ...PIX, fontSize: "8px" }}
            >
              RESTART
            </button>
            <button
              onClick={goToMenu}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
              style={{ ...PIX, fontSize: "8px" }}
            >
              MENU
            </button>
            <button
              onClick={() => { setSettingsOpen(false); setShowLeaderboard(true); }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all"
              style={{ ...PIX, fontSize: "8px" }}
            >
              TOP 5
            </button>
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-all"
              style={{ ...PIX, fontSize: "8px" }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Winner overlay: time, initials input, play again */}
      {winner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-6 pt-3 bg-gradient-to-t from-black/70 to-transparent">
          {/* Time display */}
          <div className="text-yellow-300 mb-2" style={{ ...PIX, fontSize: "10px" }}>
            TIME: {formatTime(elapsed)}
          </div>

          {/* Initials input */}
          {!savedScore ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                maxLength={3}
                value={initials}
                onChange={(e) => setInitials(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                placeholder="AAA"
                className="w-16 text-center py-1 bg-black/60 text-yellow-300 border border-yellow-400/50 rounded-lg uppercase"
                style={{ ...PIX, fontSize: "12px" }}
                autoFocus
              />
              <button
                onClick={handleSaveScore}
                disabled={initials.trim().length === 0}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black rounded-lg transition-all"
                style={{ ...PIX, fontSize: "8px" }}
              >
                SAVE
              </button>
            </div>
          ) : (
            <div className="text-green-400 mb-3" style={{ ...PIX, fontSize: "8px" }}>
              SCORE SAVED!
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => startGame(difficulty)}
              className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-2xl transition-all active:scale-95"
              style={{
                ...PIX,
                fontSize: "11px",
                boxShadow: "0 4px 0 #15803d, 0 6px 12px rgba(0,0,0,0.4)",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={goToMenu}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all active:scale-95"
              style={{
                ...PIX,
                fontSize: "11px",
                boxShadow: "0 4px 0 #1d4ed8, 0 6px 12px rgba(0,0,0,0.4)",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
