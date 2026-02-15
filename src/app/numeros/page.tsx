"use client";

import React, { useState } from "react";
import Link from "next/link";

const PIX = { fontFamily: "var(--font-pixel)" };

const NUMBER_COLORS = [
  "#6b7280", // 0 - gray
  "#ef4444", // 1 - red
  "#f97316", // 2 - orange
  "#eab308", // 3 - yellow
  "#22c55e", // 4 - green
  "#14b8a6", // 5 - teal
  "#3b82f6", // 6 - blue
  "#6366f1", // 7 - indigo
  "#a855f7", // 8 - purple
  "#ec4899", // 9 - pink
  "#f59e0b", // 10 - amber
];

/* Dot positions in a 3x3 grid – standard domino/dice arrangements */
type DotPos = [number, number];
const DOT_PATTERNS: Record<number, DotPos[]> = {
  0: [],
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [1, 0], [2, 0], [0, 2], [1, 2], [2, 2]],
  7: [[0, 0], [1, 0], [2, 0], [1, 1], [0, 2], [1, 2], [2, 2]],
  8: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]],
  9: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
};

/* Addition exercises for each number */
const EXERCISES: Record<number, [number, number][]> = {
  0: [],
  1: [[0, 1], [1, 0]],
  2: [[1, 1], [0, 2]],
  3: [[1, 2], [2, 1]],
  4: [[2, 2], [3, 1]],
  5: [[2, 3], [4, 1]],
  6: [[3, 3], [4, 2]],
  7: [[4, 3], [5, 2]],
  8: [[4, 4], [5, 3]],
  9: [[5, 4], [6, 3]],
  10: [[5, 5], [7, 3]],
};

/* ── Domino face component (3x3 dot grid) ── */
function DominoFace({
  count,
  size,
  dotSize,
}: {
  count: number;
  size: number;
  dotSize: number;
}) {
  const dots = DOT_PATTERNS[count] || [];
  const pad = Math.round(size * 0.1);
  const gap = 1;
  return (
    <div
      className="inline-grid grid-cols-3 grid-rows-3 bg-white"
      style={{ width: size, height: size, padding: pad, gap }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const hasDot = dots.some(([r, c]) => r === row && c === col);
        return (
          <div key={i} className="flex items-center justify-center">
            {hasDot && (
              <div
                className="bg-gray-800 rounded-full"
                style={{ width: dotSize, height: dotSize }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Full domino box: single face for 0-9, split 5|5 for 10 ── */
function DominoDots({ count }: { count: number }) {
  if (count === 10) {
    return (
      <div className="inline-flex border-4 border-gray-700 rounded-xl overflow-hidden">
        <DominoFace count={5} size={36} dotSize={6} />
        <div className="w-0.5 bg-gray-600" />
        <DominoFace count={5} size={36} dotSize={6} />
      </div>
    );
  }
  return (
    <div className="inline-block border-4 border-gray-700 rounded-xl overflow-hidden">
      <DominoFace count={count} size={72} dotSize={14} />
    </div>
  );
}

/* ── Card for a single number ── */
function NumberCard({ number }: { number: number }) {
  const exercises = EXERCISES[number] || [];
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleChange = (idx: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: value.replace(/\D/g, "") }));
  };

  const color = NUMBER_COLORS[number];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-3 border border-white/10">
      {/* Domino */}
      <DominoDots count={number} />

      {/* Number */}
      <div
        className="font-bold"
        style={{
          ...PIX,
          fontSize: "32px",
          color,
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {number}
      </div>

      {/* Addition exercises */}
      {exercises.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          {exercises.map(([a, b], idx) => {
            const correct = answers[idx] === String(a + b);
            return (
              <div
                key={idx}
                className="flex items-center justify-center gap-1.5"
              >
                <span
                  className="text-white"
                  style={{ ...PIX, fontSize: "12px" }}
                >
                  {a} + {b} =
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={answers[idx] || ""}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  className={`w-10 h-8 text-center rounded-lg border-2 outline-none transition-colors ${
                    correct
                      ? "border-green-400 bg-green-400/20 text-green-300"
                      : "border-white/30 bg-white/10 text-white"
                  }`}
                  style={{ ...PIX, fontSize: "12px" }}
                />
                {correct && <span className="text-green-400 text-lg">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Page ── */
export default function NumerosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950">
      {/* Sticky header with number line */}
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

        {/* Number reference line 0-10 */}
        <div className="flex justify-center gap-2 pb-2 px-2 overflow-x-auto">
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold"
              style={{
                ...PIX,
                fontSize: "10px",
                background: NUMBER_COLORS[i],
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {i}
            </div>
          ))}
        </div>
      </header>

      {/* Number cards grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 11 }, (_, i) => (
            <NumberCard key={i} number={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
