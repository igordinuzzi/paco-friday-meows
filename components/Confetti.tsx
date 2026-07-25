"use client";

import { useCallback, useRef, useState } from "react";

interface ConfettiPiece {
  id: number;
  burstX: string;
  burstY: string;
  drift: string;
  fall: string;
  spin: number;
  duration: number;
  delay: number;
  width: number;
  height: number;
  radius: string;
  color: string;
}

interface ConfettiBurst {
  id: number;
  pieces: ConfettiPiece[];
}

const COLORS = ["#f0a85c", "#d9782d", "#6fc3e0", "#fbe8cf", "#ffffff", "#e07a8b", "#b8601e"];
const BURST_LIFETIME = 2800;
const PIECE_COUNT = 70;

let pieceSeq = 0;
let burstSeq = 0;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeBurst(): ConfettiBurst {
  burstSeq += 1;
  const pieces: ConfettiPiece[] = Array.from({ length: PIECE_COUNT }, () => {
    pieceSeq += 1;
    // Phase 1: an explosive kick outward in a random direction, mostly upward.
    const burstX = rand(-42, 42);
    const burstY = rand(-42, 6);
    // Phase 2: gravity carries pieces the rest of the way down and further sideways.
    const drift = burstX + rand(-18, 18);
    const fall = rand(85, 135);
    return {
      id: pieceSeq,
      burstX: `${burstX}vw`,
      burstY: `${burstY}vh`,
      drift: `${drift}vw`,
      fall: `${fall}vh`,
      spin: rand(360, 900) * (Math.random() > 0.5 ? 1 : -1),
      duration: 1500 + Math.random() * 900,
      delay: Math.random() * 140,
      width: 7 + Math.random() * 8,
      height: 6 + Math.random() * 8,
      radius: Math.random() > 0.5 ? "50%" : "2px",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
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

export interface ConfettiLayerProps {
  bursts: ConfettiBurst[];
  originXPercent: number;
}

export function ConfettiLayer({ bursts, originXPercent }: ConfettiLayerProps) {
  if (bursts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
    >
      <div
        className="absolute bottom-[20vh]"
        style={{ left: `${originXPercent}%` }}
      >
        {bursts.map((b) =>
          b.pieces.map((p) => (
            <span
              key={p.id}
              className="confetti-piece"
              style={
                {
                  width: p.width,
                  height: p.height,
                  borderRadius: p.radius,
                  backgroundColor: p.color,
                  animationDuration: `${p.duration}ms`,
                  animationDelay: `${p.delay}ms`,
                  "--burst-x": p.burstX,
                  "--burst-y": p.burstY,
                  "--drift": p.drift,
                  "--fall": p.fall,
                  "--spin": `${p.spin}deg`,
                } as React.CSSProperties
              }
            />
          )),
        )}
      </div>
    </div>
  );
}
