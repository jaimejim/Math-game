import Link from "next/link";

const PIX = { fontFamily: "var(--font-pixel)" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1
          className="text-yellow-300 mb-6"
          style={{
            ...PIX,
            fontSize: "clamp(20px, 5vw, 28px)",
            textShadow: "3px 3px 6px rgba(0,0,0,0.7)",
          }}
        >
          MATH RACE!
        </h1>

        <p
          className="text-white/80 mb-6"
          style={{ ...PIX, fontSize: "10px", lineHeight: "2.2" }}
        >
          A fun two-player math race game
          <br />
          designed for kids on iPad.
          <br />
          <br />
          Two players race side by side
          <br />
          by judging math equations.
          <br />
          <br />
          Tap ✓ if the answer is RIGHT.
          <br />
          Tap ✗ if the answer is WRONG.
          <br />
          <br />
          Wrong answers cost you 3 steps!
          <br />
          First to 10 wins the race!
        </p>

        <div
          className="text-white/30 mb-8"
          style={{ ...PIX, fontSize: "8px", lineHeight: "2" }}
        >
          Made with ♥ for little mathematicians
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all active:scale-95"
          style={{
            ...PIX,
            fontSize: "11px",
            boxShadow: "0 4px 0 #1d4ed8, 0 6px 12px rgba(0,0,0,0.4)",
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          ← BACK
        </Link>
      </div>
    </div>
  );
}
