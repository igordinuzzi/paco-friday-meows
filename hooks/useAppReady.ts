import { useEffect, useRef, useState } from "react";

const MIN_DISPLAY_MS = 650;
const CREEP_TARGET = 92;
const REVEAL_PAUSE_MS = 220;

export function useAppReady(reducedMotion: boolean) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    let frameId: number;
    const creep = () => {
      if (doneRef.current) return;
      setProgress((p) => p + (CREEP_TARGET - p) * 0.03);
      frameId = requestAnimationFrame(creep);
    };

    if (!reducedMotion) {
      frameId = requestAnimationFrame(creep);
    }

    const fontsReady =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready
        : Promise.resolve();
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS));

    Promise.all([fontsReady, minDelay]).then(() => {
      doneRef.current = true;
      cancelAnimationFrame(frameId);
      setProgress(100);
      setTimeout(() => setReady(true), reducedMotion ? 0 : REVEAL_PAUSE_MS);
    });

    return () => {
      doneRef.current = true;
      cancelAnimationFrame(frameId);
    };
  }, [reducedMotion]);

  return { progress, ready };
}
