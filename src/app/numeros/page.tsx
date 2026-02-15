"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";

const PIX = { fontFamily: "var(--font-pixel)" };

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

/* ── Exercise card: horizontal domino + "a + b = [input]" ── */
function ExerciseCard({ a, b }: { a: number; b: number }) {
  const [answer, setAnswer] = useState("");
  const sum = a + b;
  const correct = answer === String(sum);
  const hasValue = answer.length > 0;

  const handleChange = useCallback(
    (val: string) => {
      const cleaned = val.replace(/\D/g, "");
      setAnswer(cleaned);
      if (cleaned === String(sum)) {
        speak(SPANISH_NUMBERS[sum]);
      }
    },
    [sum]
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

  const handleShuffle = useCallback(() => {
    setExercises(generateExercises());
    setRound((r) => r + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950">
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
          {/* Shuffle / new exercises button */}
          <button
            onClick={handleShuffle}
            className="text-white/70 hover:text-white active:scale-110 transition-all"
            style={{ fontSize: "22px" }}
            aria-label="New exercises"
          >
            ↻
          </button>
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
            <ExerciseCard key={`${round}-${idx}`} a={a} b={b} />
          ))}
        </div>
      </main>
    </div>
  );
}
