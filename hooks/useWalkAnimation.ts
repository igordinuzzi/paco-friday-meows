import { useEffect, useReducer, useRef } from "react";

export type WalkPhase = "walking" | "pausing" | "reacting" | "still";

export interface LegAngles {
  frontLeft: number;
  frontRight: number;
  backLeft: number;
  backRight: number;
}

export interface PacoAnimationState {
  x: number;
  direction: 1 | -1;
  phase: WalkPhase;
  stepPhase: number;
  elapsed: number;
  phaseElapsed: number;
  walkBudget: number;
  pauseRemaining: number;
  legs: LegAngles;
  tailAngle: number;
  bodyBob: number;
  headTilt: number;
  earAngle: number;
  mouthOpen: number;
}

const MIN_X = 10;
const MAX_X = 90;

const BASE_SPEED = 3.4; // percent of strip width per second
const STEP_FREQ_SCALE = 0.11;
const LEG_AMPLITUDE = 16; // degrees
const BOB_AMPLITUDE = 3; // px

const TAIL_BASE = 8; // degrees, resting curl
const TAIL_AMPLITUDE = 13;
const TAIL_FREQ = 0.9; // rad/s

const EAR_BASE = -6; // degrees, resting slightly back (shy read)

const PAUSE_MIN = 1400;
const PAUSE_MAX = 3200;
const WALK_MIN = 6000;
const WALK_MAX = 13000;
const TURN_PAUSE = 650;

const REACT_DURATION = 900; // ms, meow pose arc
const RESUME_DELAY = 450; // ms, "short beat" before walking resumes

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function createInitialState(): PacoAnimationState {
  return {
    x: 50,
    direction: 1,
    phase: "walking",
    stepPhase: 0,
    elapsed: 0,
    phaseElapsed: 0,
    walkBudget: randomBetween(WALK_MIN, WALK_MAX),
    pauseRemaining: 0,
    legs: { frontLeft: 0, frontRight: 0, backLeft: 0, backRight: 0 },
    tailAngle: TAIL_BASE,
    bodyBob: 0,
    headTilt: 0,
    earAngle: EAR_BASE,
    mouthOpen: 0,
  };
}

type Action = { type: "TICK"; dtMs: number; reducedMotion: boolean } | { type: "REACT" };

function reducer(state: PacoAnimationState, action: Action): PacoAnimationState {
  if (action.type === "REACT") {
    if (state.phase === "reacting") return state;
    return { ...state, phase: "reacting", phaseElapsed: 0 };
  }

  const { dtMs, reducedMotion } = action;
  const dt = dtMs / 1000;

  let {
    x,
    direction,
    phase,
    stepPhase,
    walkBudget,
    pauseRemaining,
    legs,
    bodyBob,
    headTilt,
    earAngle,
    mouthOpen,
  } = state;

  const elapsed = state.elapsed + dtMs;
  let phaseElapsed = state.phaseElapsed + dtMs;

  if (reducedMotion && phase === "walking") {
    phase = "still";
    phaseElapsed = 0;
  }

  if (phase === "walking") {
    const hesitation = 0.7 + 0.3 * Math.sin((elapsed / 1000) * 0.8);
    const speed = BASE_SPEED * hesitation;
    let nextX = x + speed * dt * direction;
    stepPhase += speed * dt * STEP_FREQ_SCALE * Math.PI * 2;
    walkBudget -= dtMs;

    if (nextX <= MIN_X) {
      nextX = MIN_X;
      direction = 1;
      phase = "pausing";
      phaseElapsed = 0;
      pauseRemaining = TURN_PAUSE;
    } else if (nextX >= MAX_X) {
      nextX = MAX_X;
      direction = -1;
      phase = "pausing";
      phaseElapsed = 0;
      pauseRemaining = TURN_PAUSE;
    } else if (walkBudget <= 0) {
      phase = "pausing";
      phaseElapsed = 0;
      pauseRemaining = randomBetween(PAUSE_MIN, PAUSE_MAX);
    }

    x = nextX;
    legs = {
      frontLeft: LEG_AMPLITUDE * Math.sin(stepPhase),
      backRight: LEG_AMPLITUDE * Math.sin(stepPhase),
      frontRight: LEG_AMPLITUDE * Math.sin(stepPhase + Math.PI),
      backLeft: LEG_AMPLITUDE * Math.sin(stepPhase + Math.PI),
    };
    bodyBob = -Math.abs(Math.sin(stepPhase)) * BOB_AMPLITUDE;
    headTilt = lerp(headTilt, 0, 0.12);
    earAngle = lerp(earAngle, EAR_BASE, 0.12);
    mouthOpen = 0;
  } else if (phase === "pausing") {
    pauseRemaining -= dtMs;
    legs = {
      frontLeft: lerp(legs.frontLeft, 0, 0.15),
      frontRight: lerp(legs.frontRight, 0, 0.15),
      backLeft: lerp(legs.backLeft, 0, 0.15),
      backRight: lerp(legs.backRight, 0, 0.15),
    };
    bodyBob = lerp(bodyBob, 0, 0.15);
    headTilt = 6 * Math.sin((phaseElapsed / 1000) * 1.6);
    earAngle = lerp(earAngle, EAR_BASE, 0.1);
    mouthOpen = 0;

    if (pauseRemaining <= 0) {
      phase = "walking";
      phaseElapsed = 0;
      walkBudget = randomBetween(WALK_MIN, WALK_MAX);
      headTilt = 0;
    }
  } else if (phase === "reacting") {
    const p = Math.min(phaseElapsed / REACT_DURATION, 1);
    const bell = Math.sin(p * Math.PI);
    mouthOpen = bell;
    earAngle = EAR_BASE - 20 * bell;
    bodyBob = -5 * bell;
    headTilt = -8 * Math.sin(Math.min(p * 1.4, 1) * Math.PI);
    legs = {
      frontLeft: lerp(legs.frontLeft, 0, 0.2),
      frontRight: lerp(legs.frontRight, 0, 0.2),
      backLeft: lerp(legs.backLeft, 0, 0.2),
      backRight: lerp(legs.backRight, 0, 0.2),
    };

    if (phaseElapsed >= REACT_DURATION + RESUME_DELAY) {
      phase = reducedMotion ? "still" : "walking";
      phaseElapsed = 0;
      walkBudget = randomBetween(WALK_MIN, WALK_MAX);
      mouthOpen = 0;
      earAngle = EAR_BASE;
      headTilt = 0;
    }
  } else {
    legs = { frontLeft: 0, frontRight: 0, backLeft: 0, backRight: 0 };
    bodyBob = 0;
    headTilt = 0;
    earAngle = EAR_BASE;
    mouthOpen = 0;
  }

  const tailAngle =
    !reducedMotion || phase === "reacting"
      ? TAIL_BASE + TAIL_AMPLITUDE * Math.sin((elapsed / 1000) * TAIL_FREQ)
      : TAIL_BASE;

  return {
    x,
    direction,
    phase,
    stepPhase,
    elapsed,
    phaseElapsed,
    walkBudget,
    pauseRemaining,
    legs,
    tailAngle,
    bodyBob,
    headTilt,
    earAngle,
    mouthOpen,
  };
}

export function useWalkAnimation(reducedMotion: boolean) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dtMs = Math.min(now - lastTime, 100);
      lastTime = now;
      dispatch({ type: "TICK", dtMs, reducedMotion: reducedMotionRef.current });
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const react = () => dispatch({ type: "REACT" });

  return { state, react };
}
