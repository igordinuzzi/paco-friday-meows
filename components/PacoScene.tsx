"use client";

import { useState } from "react";
import { useWalkAnimation } from "@/hooks/useWalkAnimation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useAppReady } from "@/hooks/useAppReady";
import { useTypewriter } from "@/hooks/useTypewriter";
import { playMeow } from "@/lib/sound";
import { useConfetti, ConfettiLayer } from "./Confetti";
import LoadingScreen from "./LoadingScreen";
import PacoCat from "./PacoCat";

const TITLE_LINES = ["Paco’s", "Friday Meows"];

export default function PacoScene() {
  const reducedMotion = useReducedMotion();
  const { state, react } = useWalkAnimation(reducedMotion);
  const { isPlaying, toggle: toggleMusic } = useBackgroundMusic();
  const { bursts, burst } = useConfetti();
  const { progress, ready } = useAppReady(reducedMotion);
  const [meowCount, setMeowCount] = useState(0);

  const { lines: titleLines, activeLine } = useTypewriter(TITLE_LINES, ready, {
    charDelay: reducedMotion ? 0 : 110,
    lineGap: reducedMotion ? 0 : 450,
  });

  const handleMeow = () => {
    react();
    playMeow();
    setMeowCount((c) => c + 1);
    if (!reducedMotion) burst();
  };

  const titleReveal = reducedMotion
    ? `transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`
    : `transition-all duration-700 ease-out ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <button
        type="button"
        onClick={toggleMusic}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M3 10v4h4l5 5V5L7 10H3z" />
            <path d="M16 8.5a4.5 4.5 0 0 1 0 7" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
            <path d="M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M3 10v4h4l5 5V5L7 10H3z" />
            <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
          </svg>
        )}
      </button>

      {meowCount > 0 && (
        <div
          className="absolute left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-20 -translate-x-1/2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-base font-bold text-white shadow-lg backdrop-blur-sm sm:text-lg"
          role="status"
        >
          <span key={meowCount} className={reducedMotion ? "" : "meow-bump inline-block"}>
            🐾 {meowCount} {meowCount === 1 ? "meow" : "meows"}
          </span>
        </div>
      )}

      <h1
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 flex select-none flex-col items-center justify-center px-2 text-center leading-[0.8] tracking-tight ${titleReveal}`}
      >
        <span
          className="text-paco-ginger"
          style={{ fontFamily: "var(--font-handwritten)", fontSize: "clamp(3.75rem, 19vw, 11.5rem)" }}
        >
          {titleLines[0]}
          {activeLine === 0 && !reducedMotion && (
            <span aria-hidden="true" className="typewriter-caret h-[0.8em] align-middle" />
          )}
        </span>
        <span
          className="font-black uppercase text-neutral-400/60"
          style={{ fontSize: "clamp(2.75rem, 14vw, 8.5rem)" }}
        >
          {titleLines[1]}
          {activeLine === 1 && !reducedMotion && (
            <span aria-hidden="true" className="typewriter-caret h-[0.7em] align-middle" />
          )}
        </span>
      </h1>

      <span className="sr-only">
        Paco&rsquo;s Friday Meows &mdash; a weekly Instagram Stories series starring Paco the
        ginger cat.
      </span>

      {/* soft spotlight that tracks Paco across the strip */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-[5] h-[46vh] w-[46vh] max-h-[420px] max-w-[420px] rounded-full"
        style={{
          left: `${state.x}%`,
          bottom: "-8vh",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(255,244,214,0.24) 0%, rgba(255,244,214,0.09) 45%, rgba(255,244,214,0) 72%)",
          mixBlendMode: "screen",
        }}
      />

      <ConfettiLayer bursts={bursts} originXPercent={state.x} />

      <div className="absolute inset-x-0 bottom-0 z-10 h-[26vh] min-h-[150px]">
        <div
          className="absolute bottom-6 flex flex-col items-center"
          style={{ left: `${state.x}%`, transform: "translateX(-50%)" }}
        >
          <button
            type="button"
            onClick={handleMeow}
            aria-label="Tap to hear Paco meow"
            className={`group relative mb-2 cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              reducedMotion ? "" : "bubble-bob"
            }`}
          >
            <span className="block rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:bg-paco-ginger-light group-hover:shadow-[0_0_0_5px_rgba(217,120,45,0.35)]">
              click here
            </span>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1.5 rotate-45 bg-white transition-colors duration-200 group-hover:bg-paco-ginger-light"
            />
          </button>

          <button
            type="button"
            onClick={handleMeow}
            aria-label="Paco the cat — tap to hear him meow"
            className="w-[clamp(140px,34vw,230px)] cursor-pointer rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
            style={{ transform: `scaleX(${state.direction})` }}
          >
            <PacoCat
              legs={state.legs}
              tailAngle={state.tailAngle}
              bodyBob={state.bodyBob}
              bodyTilt={state.bodyTilt}
              headTilt={state.headTilt}
              earAngle={state.earAngle}
              mouthOpen={state.mouthOpen}
              className="h-auto w-full"
            />
          </button>
        </div>
      </div>

      <LoadingScreen progress={progress} visible={!ready} />
    </main>
  );
}
