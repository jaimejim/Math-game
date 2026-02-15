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

/* ── Colors for 0-6 ── */
const NUMBER_COLORS = [
  "#6b7280", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#3b82f6",
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

/* 9 domino addition exercises (3×3 grid), all faces ≤ 6 */
const EXERCISES: [number, number][] = [
  [1, 1], // = 2
  [2, 1], // = 3
  [1, 2], // = 3
  [2, 2], // = 4
  [3, 1], // = 4
  [3, 2], // = 5
  [2, 3], // = 5
  [3, 3], // = 6
  [4, 2], // = 6
];

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

/* ── Vertical domino tile: top face | divider | bottom face ── */
function DominoTile({
  top,
  bottom,
  faceSize = 52,
}: {
  top: number;
  bottom: number;
  faceSize?: number;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        speak(`${SPANISH_NUMBERS[top]} más ${SPANISH_NUMBERS[bottom]}`)
      }
      className="inline-flex flex-col border-[3px] border-gray-700 rounded-xl overflow-hidden
                 hover:border-yellow-400/70 active:scale-105 transition-all cursor-pointer"
    >
      <DominoFace count={top} size={faceSize} />
      <div className="h-[3px] bg-gray-600" />
      <DominoFace count={bottom} size={faceSize} />
    </button>
  );
}

/* ── Exercise card: domino tile + "a + b = [input]" ── */
function ExerciseCard({ a, b }: { a: number; b: number }) {
  const [answer, setAnswer] = useState("");
  const sum = a + b;
  const correct = answer === String(sum);

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
      <DominoTile top={a} bottom={b} faceSize={48} />

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
              : "border-white/30 bg-white/10 text-white"
          }`}
          style={{ ...PIX, fontSize: "14px" }}
        />
        {correct && <span className="text-green-400 text-lg">✓</span>}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function NumerosPage() {
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
          <div style={{ width: "60px" }} />
        </div>

        {/* Clickable number line 0-6 (speaks Spanish) */}
        <div className="flex justify-center gap-2 pb-2 px-2">
          {Array.from({ length: 7 }, (_, i) => (
            <button
              key={i}
              onClick={() => speak(SPANISH_NUMBERS[i])}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full
                         text-white font-bold active:scale-110 transition-transform"
              style={{
                ...PIX,
                fontSize: "11px",
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
          {EXERCISES.map(([a, b], idx) => (
            <ExerciseCard key={idx} a={a} b={b} />
          ))}
        </div>
      </main>
    </div>
  );
}
