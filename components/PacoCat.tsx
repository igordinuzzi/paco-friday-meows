import { useId } from "react";
import type { LegAngles } from "@/hooks/useWalkAnimation";

export interface PacoCatProps {
  legs: LegAngles;
  tailAngle: number;
  bodyBob: number;
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

function Leg({
  hipX,
  hipY,
  angle,
  fill,
  length = 46,
}: {
  hipX: number;
  hipY: number;
  angle: number;
  fill: string;
  length?: number;
}) {
  return (
    <g style={{ transformOrigin: `${hipX}px ${hipY}px`, transform: `rotate(${angle}deg)` }}>
      <rect x={hipX - 12} y={hipY} width={24} height={length} rx={12} fill={fill} />
      <rect
        x={hipX - 12}
        y={hipY}
        width={24}
        height={length * 0.4}
        rx={12}
        fill={GINGER_DARKER}
        opacity={0.3}
      />
      <ellipse cx={hipX} cy={hipY + length} rx={13.5} ry={7.5} fill={CREAM} />
    </g>
  );
}

export default function PacoCat({
  legs,
  tailAngle,
  bodyBob,
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

      <g style={{ transform: `translateY(${bodyBob}px)` }}>
        {/* far-side legs, behind the body */}
        <Leg hipX={110} hipY={162} angle={legs.backLeft} fill={GINGER_DARKER} length={44} />
        <Leg hipX={220} hipY={168} angle={legs.frontLeft} fill={GINGER_DARKER} length={44} />

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
        </g>

        {/* near-side legs, in front of the body */}
        <Leg hipX={124} hipY={166} angle={legs.backRight} fill={GINGER_DARK} length={48} />
        <Leg hipX={234} hipY={172} angle={legs.frontRight} fill={GINGER_DARK} length={48} />

        {/* head */}
        <g style={{ transformOrigin: "224px 108px", transform: `rotate(${headTilt}deg)` }}>
          {/* ears, rotate together to read as "flattening" during a reaction */}
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
          <path d="M296,104 L303,104 L299.5,109 Z" fill="#e07a8b" />

          {/* mouth: closed (fades out) */}
          <path
            d="M299,109 Q292,116 285,111 M299,109 Q306,116 313,111"
            stroke={GINGER_DARK}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={1 - mouthOpen}
          />

          {/* mouth: open meow (fades in, scales open) */}
          <g
            style={{
              transformOrigin: "299px 110px",
              transform: `scaleY(${0.3 + mouthOpen * 0.7})`,
              opacity: mouthOpen,
            }}
          >
            <ellipse cx={299} cy={116} rx={9} ry={11} fill="#7a3b3b" />
            <ellipse cx={299} cy={120} rx={5} ry={5} fill="#e07a8b" />
          </g>

          {/* whiskers */}
          <g stroke={CREAM} strokeWidth={1.5} strokeLinecap="round" opacity={0.85}>
            <path d="M232,100 L204,94" />
            <path d="M232,106 L202,108" />
            <path d="M232,112 L206,122" />
          </g>
        </g>
      </g>
    </svg>
  );
}
