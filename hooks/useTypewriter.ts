import { useEffect, useState } from "react";

export interface TypewriterOptions {
  charDelay?: number;
  lineGap?: number;
  startDelay?: number;
}

export function useTypewriter(lines: string[], start: boolean, opts: TypewriterOptions = {}) {
  const { charDelay = 45, lineGap = 220, startDelay = 0 } = opts;

  const [revealed, setRevealed] = useState<number[]>(() => lines.map(() => 0));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cumulativeDelay = startDelay;

    lines.forEach((line, lineIndex) => {
      for (let i = 1; i <= line.length; i++) {
        const delay = cumulativeDelay + i * charDelay;
        timeouts.push(
          setTimeout(() => {
            if (cancelled) return;
            setRevealed((prev) => {
              const next = [...prev];
              next[lineIndex] = i;
              return next;
            });
          }, delay),
        );
      }
      cumulativeDelay += line.length * charDelay + lineGap;
    });

    timeouts.push(
      setTimeout(() => {
        if (!cancelled) setDone(true);
      }, cumulativeDelay),
    );

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
    // `lines` and `opts` are stable (module-level/constant) inputs in this
    // app; the effect is intentionally keyed only on the `start` trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  const activeLine = revealed.findIndex((count, i) => count < lines[i].length);

  return {
    lines: lines.map((line, i) => line.slice(0, revealed[i])),
    activeLine,
    done,
  };
}
