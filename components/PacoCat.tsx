import { useId } from "react";
import type { LegAngles, LegPose } from "@/hooks/useWalkAnimation";

export interface PacoCatProps {
  legs: LegAngles;
  tailAngle: number;
  bodyBob: number;
  bodyTilt: number;
  headTilt: number;
  earAngle: number;
  mouthOpen: number;
  className?: string;
}

const GINGER = "#d9782d";
const GINGER_DARK = "#b8601e";
const GINGER_DARKER = "#8a4d18";
const GINGER_LIGHT = "#f0a85c";
const CREAM = "#fbe8cf";
const EYE_BLUE = "#6fc3e0";

const TAIL_PATH =
  "M78,128 C40,120 22,80 46,48 C54,36 70,34 74,44 C78,54 66,58 62,68 C54,88 66,108 92,116 Z";

// Small deterministic PRNG (mulberry32) so fur placement is identical on
// server and client renders — a plain Math.random() here would cause
// hydration mismatches.
function seededRandom(seed: number) {
  let t = seed;
  return function () {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

interface FurStroke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dark: boolean;
}

// SVG numeric attributes are stringified from floats, and Math.sin/cos
// aren't guaranteed bit-identical between server (Node) and client engines —
// rounding here keeps SSR and hydration output byte-for-byte equal.
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateFur(
  count: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
): FurStroke[] {
  const rand = seededRandom(seed);
  const strokes: FurStroke[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = Math.sqrt(rand()) * 0.88;
    const x = cx + Math.cos(angle) * rx * dist;
    const y = cy + Math.sin(angle) * ry * dist;
    const dirAngle = angle + (rand() - 0.5) * 0.7;
    const len = 5 + rand() * 6;
    const x2 = x + Math.cos(dirAngle) * len;
    const y2 = y + Math.sin(dirAngle) * len * 0.6 + len * 0.25;
    strokes.push({ x1: round2(x), y1: round2(y), x2: round2(x2), y2: round2(y2), dark: rand() > 0.45 });
  }
  return strokes;
}

const BODY_FUR = generateFur(50, 175, 122, 96, 48, 7);
const HEAD_FUR = generateFur(22, 268, 100, 42, 40, 13);

function FurLayer({ strokes, opacity = 1 }: { strokes: FurStroke[]; opacity?: number }) {
  return (
    <g opacity={opacity}>
      {strokes.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={s.dark ? GINGER_DARKER : GINGER_LIGHT}
          strokeWidth={1}
          strokeLinecap="round"
          opacity={s.dark ? 0.32 : 0.4}
        />
      ))}
    </g>
  );
}

function Leg({
  hipX,
  hipY,
  pose,
  fill,
  length = 46,
}: {
  hipX: number;
  hipY: number;
  pose: LegPose;
  fill: string;
  length?: number;
}) {
  const thighLen = length * 0.55;
  const shinLen = length - thighLen;
  const kneeY = hipY + thighLen;

  return (
    <g style={{ transformOrigin: `${hipX}px ${hipY}px`, transform: `rotate(${pose.hip}deg)` }}>
      <rect x={hipX - 12} y={hipY} width={24} height={thighLen} rx={12} fill={fill} />
      <rect
        x={hipX - 12}
        y={hipY}
        width={24}
        height={thighLen * 0.45}
        rx={12}
        fill={GINGER_DARKER}
        opacity={0.3}
      />
      <g style={{ transformOrigin: `${hipX}px ${kneeY}px`, transform: `rotate(${pose.knee}deg)` }}>
        <rect x={hipX - 11} y={kneeY - 2} width={22} height={shinLen + 2} rx={11} fill={fill} />
        <ellipse cx={hipX} cy={kneeY + shinLen} rx={13.5} ry={7.5} fill={CREAM} />
      </g>
    </g>
  );
}

export default function PacoCat({
  legs,
  tailAngle,
  bodyBob,
  bodyTilt,
  headTilt,
  earAngle,
  mouthOpen,
  className,
}: PacoCatProps) {
  const uid = useId();
  const bodyClip = `${uid}-body-clip`;
  const headClip = `${uid}-head-clip`;
  const tailClip = `${uid}-tail-clip`;

  return (
    <svg viewBox="0 0 340 232" role="img" aria-hidden="true" className={className}>
      <defs>
        <clipPath id={bodyClip}>
          <ellipse cx={175} cy={125} rx={102} ry={58} />
        </clipPath>
        <clipPath id={headClip}>
          <circle cx={268} cy={96} r={46} />
        </clipPath>
        <clipPath id={tailClip}>
          <path d={TAIL_PATH} />
        </clipPath>
      </defs>

      <g
        style={{
          transformOrigin: "175px 150px",
          transform: `translateY(${bodyBob}px) rotate(${bodyTilt}deg)`,
        }}
      >
        {/* far-side legs, behind the body */}
        <Leg hipX={110} hipY={162} pose={legs.backLeft} fill={GINGER_DARKER} length={44} />
        <Leg hipX={220} hipY={168} pose={legs.frontLeft} fill={GINGER_DARKER} length={44} />

        {/* tail, swaying behind the body */}
        <g style={{ transformOrigin: "78px 128px", transform: `rotate(${tailAngle}deg)` }}>
          <g clipPath={`url(#${tailClip})`}>
            <path d={TAIL_PATH} fill={GINGER} />
            <ellipse cx={58} cy={48} rx={15} ry={10} fill={GINGER_DARKER} opacity={0.5} />
            <ellipse cx={44} cy={74} rx={16} ry={11} fill={GINGER_DARKER} opacity={0.45} />
            <ellipse cx={58} cy={100} rx={17} ry={10} fill={GINGER_DARKER} opacity={0.42} />
            <ellipse cx={84} cy={119} rx={18} ry={10} fill={GINGER_DARKER} opacity={0.4} />
          </g>
        </g>

        {/* body */}
        <g clipPath={`url(#${bodyClip})`}>
          <ellipse cx={175} cy={125} rx={102} ry={58} fill={GINGER} />

          {/* shoulder / haunch shading for volume */}
          <ellipse cx={123} cy={108} rx={34} ry={27} fill={GINGER_DARK} opacity={0.22} />
          <ellipse cx={229} cy={112} rx={30} ry={25} fill={GINGER_DARK} opacity={0.2} />

          {/* dorsal stripe along the spine */}
          <path
            d="M85,74 Q175,56 262,76"
            stroke={GINGER_DARKER}
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
            opacity={0.38}
          />

          {/* mackerel-tabby stripes down the sides */}
          <path d="M108,70 Q120,110 104,153" stroke={GINGER_DARKER} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.4} />
          <path d="M141,66 Q152,108 139,159" stroke={GINGER_DARK} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.35} />
          <path d="M205,66 Q216,106 207,157" stroke={GINGER_DARKER} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.4} />
          <path d="M240,70 Q249,104 239,149" stroke={GINGER_DARK} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.35} />

          {/* belly patch with a couple of natural spots */}
          <ellipse cx={175} cy={148} rx={70} ry={20} fill={CREAM} opacity={0.92} />
          <ellipse cx={150} cy={150} rx={8} ry={5.5} fill={GINGER_LIGHT} opacity={0.55} />
          <ellipse cx={197} cy={153} rx={7} ry={5} fill={GINGER_DARK} opacity={0.3} />

          <FurLayer strokes={BODY_FUR} />
        </g>

        {/* near-side legs, in front of the body */}
        <Leg hipX={124} hipY={166} pose={legs.backRight} fill={GINGER_DARK} length={48} />
        <Leg hipX={234} hipY={172} pose={legs.frontRight} fill={GINGER_DARK} length={48} />

        {/* head */}
        <g style={{ transformOrigin: "224px 108px", transform: `rotate(${headTilt}deg)` }}>
          {/* ears, rotate together to read as "flattening" during a reaction and bob along with each step */}
          <g style={{ transformOrigin: "258px 68px", transform: `rotate(${earAngle}deg)` }}>
            <path d="M238,58 L253,20 L266,62 Z" fill={GINGER} />
            <path d="M247,33 L253,20 L260,35 Z" fill={GINGER_DARKER} opacity={0.55} />
            <path d="M242,54 L252,30 L260,58 Z" fill={CREAM} opacity={0.7} />
            <path d="M278,54 L295,18 L302,60 Z" fill={GINGER} />
            <path d="M288,32 L295,18 L299,34 Z" fill={GINGER_DARKER} opacity={0.55} />
            <path d="M282,52 L295,28 L296,58 Z" fill={CREAM} opacity={0.7} />
          </g>

          <g clipPath={`url(#${headClip})`}>
            <circle cx={268} cy={96} r={46} fill={GINGER} />
            <ellipse cx={268} cy={122} rx={40} ry={22} fill={GINGER_LIGHT} opacity={0.6} />

            {/* forehead "M" tabby marking */}
            <path
              d="M244,56 L251,70 L259,58 L267,72 L275,58"
              stroke={GINGER_DARKER}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.5}
            />

            {/* faint cheek stripes */}
            <path d="M231,86 Q244,88 250,94" stroke={GINGER_DARK} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.4} />
            <path d="M233,104 Q245,104 251,108" stroke={GINGER_DARK} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.4} />

            <FurLayer strokes={HEAD_FUR} opacity={0.9} />
          </g>

          {/* eyes */}
          <g className="paco-eyes">
            <circle cx={256} cy={92} r={9} fill={EYE_BLUE} />
            <circle cx={256} cy={93} r={4} fill="#1a1a1a" />
            <circle cx={253} cy={90} r={1.6} fill="#fff" />

            <circle cx={286} cy={92} r={9} fill={EYE_BLUE} />
            <circle cx={286} cy={93} r={4} fill="#1a1a1a" />
            <circle cx={283} cy={90} r={1.6} fill="#fff" />
          </g>

          {/* nose */}
          <path d="M293,101 L307,101 L300,111.5 Z" fill="#e07a8b" stroke={GINGER_DARKER} strokeWidth={0.6} />

          {/* mouth: closed (fades out) */}
          <path
            d="M300,111.5 L300,116 M300,116 Q292,123 284,117 M300,116 Q308,123 316,117"
            stroke={GINGER_DARKER}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            opacity={1 - mouthOpen}
          />

          {/* mouth: open meow (fades in, scales open) */}
          <g
            style={{
              transformOrigin: "300px 114px",
              transform: `scaleY(${0.3 + mouthOpen * 0.7})`,
              opacity: mouthOpen,
            }}
          >
            <ellipse cx={300} cy={120} rx={10} ry={12} fill="#7a3b3b" />
            <ellipse cx={300} cy={124} rx={5.5} ry={5.5} fill="#e07a8b" />
          </g>

          {/* whiskers: lower cheek set */}
          <g
            className="whisker-group"
            style={{ transformOrigin: "232px 106px", animationDelay: "0s" }}
            stroke={CREAM}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.85}
          >
            <path d="M232,100 L204,94" />
            <path d="M232,106 L202,108" />
            <path d="M232,112 L206,122" />
          </g>

          {/* whiskers: upper cheek set, mirrored above the eye line */}
          <g
            className="whisker-group"
            style={{ transformOrigin: "232px 82px", animationDelay: "-1.7s" }}
            stroke={CREAM}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.85}
          >
            <path d="M232,88 L204,94" />
            <path d="M232,82 L202,80" />
            <path d="M232,76 L206,66" />
          </g>
        </g>
      </g>
    </svg>
  );
}
