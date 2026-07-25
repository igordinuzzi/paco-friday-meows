"use client";

import { useCallback, useRef, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  drift: number;
  spin: number;
  duration: number;
  delay: number;
  width: number;
  height: number;
}

interface ConfettiBurst {
  id: number;
  pieces: ConfettiPiece[];
}

const COLORS = ["#f0a85c", "#d9782d", "#6fc3e0", "#fbe8cf", "#ffffff", "#e07a8b"];
const BURST_LIFETIME = 1600;
const PIECE_COUNT = 22;

let pieceSeq = 0;
let burstSeq = 0;

function makeBurst(): ConfettiBurst {
  burstSeq += 1;
  const pieces: ConfettiPiece[] = Array.from({ length: PIECE_COUNT }, () => {
    pieceSeq += 1;
    return {
      id: pieceSeq,
      left: (Math.random() - 0.5) * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      drift: (Math.random() - 0.5) * 100,
      spin: (360 + Math.random() * 360) * (Math.random() > 0.5 ? 1 : -1),
      duration: 900 + Math.random() * 500,
      delay: Math.random() * 100,
      width: 5 + Math.random() * 5,
      height: 4 + Math.random() * 5,
    };
  });
  return { id: burstSeq, pieces };
}

export function useConfetti() {
  const [bursts, setBursts] = useState<ConfettiBurst[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const burst = useCallback(() => {
    const next = makeBurst();
    setBursts((prev) => [...prev, next]);
    const timer = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== next.id));
    }, BURST_LIFETIME);
    timers.current.push(timer);
  }, []);

  return { bursts, burst };
}

export function ConfettiLayer({ bursts }: { bursts: ConfettiBurst[] }) {
  if (bursts.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-0 right-0 top-0 h-0">
      {bursts.map((b) =>
        b.pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={
              {
                left: `calc(50% + ${p.left}px)`,
                width: p.width,
                height: p.height,
                backgroundColor: p.color,
                animationDuration: `${p.duration}ms`,
                animationDelay: `${p.delay}ms`,
                "--drift": `${p.drift}px`,
                "--spin": `${p.spin}deg`,
              } as React.CSSProperties
            }
          />
        )),
      )}
    </div>
  );
}
