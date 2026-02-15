"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

const PIX = { fontFamily: "var(--font-pixel)" };

/* ── Mates leaderboard ── */
const MATES_LB_KEY = "mates-leaderboard";

interface MatesEntry {
  name: string;
  time: number;
  date: string;
}

function loadLeaderboard(): MatesEntry[] {
  try {
    const raw = localStorage.getItem(MATES_LB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: MatesEntry[]) {
  localStorage.setItem(MATES_LB_KEY, JSON.stringify(entries.slice(0, 5)));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Spanish speech ── */
const SPANISH_NUMBERS = [
  "cero", "uno", "dos", "tres", "cuatro", "cinco",
  "seis", "siete", "ocho", "nueve", "diez", "once", "doce",
];

const SPANISH_SYMBOLS: Record<string, string> = {
  "+": "más",
  "-": "menos",
  "=": "igual",
};

function speak(text: string) {
  if (typeof window === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  u.rate = 0.85;
  speechSynthesis.speak(u);
}

/* ── Colors for 0-10 ── */
const NUMBER_COLORS = [
  "#6b7280", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#3b82f6", "#6366f1",
  "#a855f7", "#ec4899", "#f59e0b",
];

/* ── Dot positions in a 3×3 grid (standard domino patterns, 0-6) ── */
type DotPos = [number, number];
const DOT_PATTERNS: Record<number, DotPos[]> = {
  0: [],
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [1, 0], [2, 0], [0, 2], [1, 2], [2, 2]],
};

/* ── Generate 9 random exercises, each addend 1-6 ── */
function generateExercises(): [number, number][] {
  const exercises: [number, number][] = [];
  const used = new Set<string>();
  while (exercises.length < 9) {
    const a = Math.floor(Math.random() * 6) + 1;
    const b = Math.floor(Math.random() * 6) + 1;
    const key = `${a},${b}`;
    if (!used.has(key)) {
      used.add(key);
      exercises.push([a, b]);
    }
  }
  return exercises;
}

/* ── Single domino face (square with dot pattern) ── */
function DominoFace({ count, size }: { count: number; size: number }) {
  const dots = DOT_PATTERNS[count] || [];
  const dotSz = Math.max(Math.round(size * 0.19), 4);
  const pad = Math.round(size * 0.12);
  return (
    <div
      className="inline-grid grid-cols-3 grid-rows-3 bg-white"
      style={{ width: size, height: size, padding: pad, gap: 1 }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const on = dots.some(([dr, dc]) => dr === r && dc === c);
        return (
          <div key={i} className="flex items-center justify-center">
            {on && (
              <div
                className="bg-gray-800 rounded-full"
                style={{ width: dotSz, height: dotSz }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Horizontal domino tile: left face | divider | right face ── */
function DominoTile({
  left,
  right,
  faceSize = 48,
}: {
  left: number;
  right: number;
  faceSize?: number;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        speak(`${SPANISH_NUMBERS[left]} más ${SPANISH_NUMBERS[right]}`)
      }
      className="inline-flex flex-row border-[3px] border-gray-700 rounded-xl overflow-hidden
                 hover:border-yellow-400/70 active:scale-105 transition-all cursor-pointer"
    >
      <DominoFace count={left} size={faceSize} />
      <div className="w-[3px] bg-gray-600" />
      <DominoFace count={right} size={faceSize} />
    </button>
  );
}

/* ── Exercise card ── */
function ExerciseCard({
  a,
  b,
  onCorrect,
}: {
  a: number;
  b: number;
  onCorrect: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const sum = a + b;
  const correct = answer === String(sum);
  const hasValue = answer.length > 0;
  const reportedRef = useRef(false);

  const handleChange = useCallback(
    (val: string) => {
      if (reportedRef.current) return;
      const cleaned = val.replace(/\D/g, "");
      setAnswer(cleaned);
      if (cleaned === String(sum)) {
        speak(SPANISH_NUMBERS[sum]);
        reportedRef.current = true;
        onCorrect();
      }
    },
    [sum, onCorrect]
  );

  return (
    <div className="bg-white/10 rounded-2xl p-3 flex flex-col items-center gap-2 border border-white/10">
      <DominoTile left={a} right={b} faceSize={48} />

      <div className="flex items-center gap-1.5">
        <span className="text-white" style={{ ...PIX, fontSize: "13px" }}>
          {a} + {b} =
        </span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={answer}
          onChange={(e) => handleChange(e.target.value)}
          disabled={correct}
          className={`w-10 h-9 text-center rounded-lg border-2 outline-none transition-colors font-bold ${
            correct
              ? "border-green-400 bg-green-400/20 text-green-300"
              : hasValue
              ? "border-red-400 bg-red-400/20 text-red-300"
              : "border-white/30 bg-white/10 text-white"
          }`}
          style={{ ...PIX, fontSize: "14px" }}
        />
        {correct && <span className="text-green-400 text-lg">✓</span>}
        {hasValue && !correct && (
          <span className="text-red-400 text-lg">✗</span>
        )}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function NumerosPage() {
  const [exercises, setExercises] = useState(() => generateExercises());
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<MatesEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [initials, setInitials] = useState("");
  const [savedScore, setSavedScore] = useState(false);

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
  }, []);

  // Start / restart timer each round
  useEffect(() => {
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [round]);

  const handleCorrect = useCallback(() => {
    setCorrectCount((prev) => {
      const next = prev + 1;
      if (next === 9) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setFinished(true);
      }
      return next;
    });
  }, []);

  const handleShuffle = useCallback(() => {
    setExercises(generateExercises());
    setRound((r) => r + 1);
    setCorrectCount(0);
    setFinished(false);
    setInitials("");
    setSavedScore(false);
  }, []);

  const handleSaveScore = useCallback(() => {
    if (!initials.trim()) return;
    const entry: MatesEntry = {
      name: initials.toUpperCase().slice(0, 3),
      time: elapsed,
      date: new Date().toISOString(),
    };
    const updated = [...leaderboard, entry]
      .sort((a, b) => a.time - b.time)
      .slice(0, 5);
    saveLeaderboard(updated);
    setLeaderboard(updated);
    setSavedScore(true);
  }, [initials, elapsed, leaderboard]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950">
      {/* Leaderboard overlay */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-indigo-950 border-2 border-yellow-400/50 rounded-2xl p-6 max-w-xs w-full mx-4">
            <h2
              className="text-yellow-300 text-center mb-4"
              style={{ ...PIX, fontSize: "12px" }}
            >
              MATES TOP 5
            </h2>
            {leaderboard.length === 0 ? (
              <p
                className="text-white/50 text-center"
                style={{ ...PIX, fontSize: "8px" }}
              >
                No scores yet!
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white"
                    style={{ ...PIX, fontSize: "9px" }}
                  >
                    <span className="text-yellow-400 w-4">{i + 1}.</span>
                    <span className="flex-1">{e.name}</span>
                    <span className="text-green-400">
                      {formatTime(e.time)}
                    </span>
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
      )}

      {/* Completion overlay */}
      {finished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-indigo-950 border-2 border-green-400/50 rounded-2xl p-6 max-w-xs w-full mx-4 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2
              className="text-green-400 mb-2"
              style={{ ...PIX, fontSize: "14px" }}
            >
              ALL CORRECT!
            </h2>
            <div
              className="text-yellow-300 mb-4"
              style={{ ...PIX, fontSize: "11px" }}
            >
              TIME: {formatTime(elapsed)}
            </div>

            {!savedScore ? (
              <div className="flex items-center justify-center gap-2 mb-4">
                <input
                  type="text"
                  maxLength={3}
                  value={initials}
                  onChange={(e) =>
                    setInitials(e.target.value.replace(/[^a-zA-Z]/g, ""))
                  }
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
              <div
                className="text-green-400 mb-4"
                style={{ ...PIX, fontSize: "8px" }}
              >
                SCORE SAVED!
              </div>
            )}

            <button
              onClick={handleShuffle}
              className="w-full py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl transition-all active:scale-95"
              style={{
                ...PIX,
                fontSize: "11px",
                boxShadow: "0 4px 0 #15803d",
              }}
            >
              NEW ROUND
            </button>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-indigo-950/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-2">
          <Link
            href="/"
            className="text-white/70 hover:text-white transition-colors"
            style={{ ...PIX, fontSize: "10px" }}
          >
            ← BACK
          </Link>

          {/* Timer + title + progress */}
          <div className="flex items-center gap-3">
            <span
              className="text-yellow-300"
              style={{ ...PIX, fontSize: "10px" }}
            >
              {formatTime(elapsed)}
            </span>
            <h1
              className="text-yellow-300"
              style={{
                ...PIX,
                fontSize: "14px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              NÚMEROS
            </h1>
            <span
              className="text-white/50"
              style={{ ...PIX, fontSize: "9px" }}
            >
              {correctCount}/9
            </span>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="px-2 py-1 bg-black/40 hover:bg-black/60 text-yellow-300 rounded-lg transition-all"
              style={{ ...PIX, fontSize: "7px" }}
            >
              TOP 5
            </button>
            <button
              onClick={handleShuffle}
              className="text-white/70 hover:text-white active:scale-110 transition-all"
              style={{ fontSize: "22px" }}
              aria-label="New exercises"
            >
              ↻
            </button>
          </div>
        </div>

        {/* Clickable number line 0-10 (speaks Spanish) */}
        <div className="flex justify-center gap-1.5 pb-2 px-2 overflow-x-auto">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              onClick={() => speak(SPANISH_NUMBERS[i])}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                         text-white font-bold active:scale-110 transition-transform"
              style={{
                ...PIX,
                fontSize: "10px",
                background: NUMBER_COLORS[i],
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {i}
            </button>
          ))}
        </div>

        {/* Clickable symbols + - = (speaks Spanish) */}
        <div className="flex justify-center gap-4 pb-2">
          {(["+", "-", "="] as const).map((sym) => (
            <button
              key={sym}
              onClick={() => speak(SPANISH_SYMBOLS[sym])}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white font-bold
                         bg-white/15 hover:bg-white/25 active:scale-110 transition-all border border-white/20"
              style={{ ...PIX, fontSize: "18px" }}
            >
              {sym}
            </button>
          ))}
        </div>
      </header>

      {/* 3×3 exercise grid */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4">
          {exercises.map(([a, b], idx) => (
            <ExerciseCard
              key={`${round}-${idx}`}
              a={a}
              b={b}
              onCorrect={handleCorrect}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
