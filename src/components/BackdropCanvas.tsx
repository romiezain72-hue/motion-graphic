import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { themeConfig } from "../projectLoader";

export interface BackdropCanvasProps {
  preset?:
    | "ocean_abyss_strata"
    | "continental_drift_map"
    | "starry_storm_sea"
    | "dark_engineering_grid"
    | "wind_tunnel_grid"
    | "cobalt_blueprint";
}

/**
 * Tri-Archetype (<BackdropCanvas /> v2 Sat-Set):
 * - Archetype A: Layered paper-cut geological strata & 4-tier topographic contour maps.
 * - Archetype B ("dark_engineering_grid" & "wind_tunnel_grid"):
 *   Obsidian #09090B canvas, dual ambient radial glows (Crimson Red & Telemetry Cyan),
 *   faster CAD coordinate grid scroll, animated ruler ticks, and wind-tunnel airflow streamlines.
 * - Archetype C ("cobalt_blueprint"):
 *   Cobalt Blue (#1D4ED8) architectural blueprint canvas with precision 4-edge ruler ticks
 *   and crisp white drafting grid lines.
 */
export const BackdropCanvas: React.FC<BackdropCanvasProps> = ({
  preset = "dark_engineering_grid",
}) => {
  const frame = useCurrentFrame();
  const { colors } = themeConfig;

  const isArchetypeC =
    preset === "cobalt_blueprint" ||
    themeConfig.activeArchetype.startsWith("archetype_c");

  if (isArchetypeC) {
    const blueprintScrollX = (frame * 0.45) % 80;
    const blueprintScrollY = (frame * 0.45) % 80;

    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1D4ED8",
          overflow: "hidden",
        }}
      >
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(59, 130, 246, 0.55) 0%, rgba(29, 78, 216, 0.95) 65%, rgba(23, 37, 84, 1) 100%)",
          }}
        />
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <pattern
              id="bpMinorGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            </pattern>
            <pattern
              id="bpMajorGrid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${blueprintScrollX}, ${blueprintScrollY})`}
            >
              <rect width="80" height="80" fill="url(#bpMinorGrid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#bpMajorGrid)" />

          {/* Top & Left Precision Blueprint Rulers */}
          {Array.from({ length: 22 }).map((_, idx) => {
            const yTick = 140 + idx * 80;
            return (
              <g key={`y-${idx}`} opacity="0.55">
                <line
                  x1="0"
                  y1={yTick}
                  x2="28"
                  y2={yTick}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x="36"
                  y={yTick + 5}
                  fill="#DBEAFE"
                  fontFamily="monospace"
                  fontSize="14"
                  fontWeight="700"
                >
                  {yTick}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    );
  }

  const isArchetypeB =
    preset === "dark_engineering_grid" ||
    preset === "wind_tunnel_grid" ||
    themeConfig.activeArchetype.startsWith("archetype_b");

  if (isArchetypeB) {
    const gridScrollY = (frame * 0.75) % 80;
    const glowPulse = 0.85 + 0.15 * Math.sin(frame / 18);

    return (
      <AbsoluteFill
        style={{
          backgroundColor: colors.bgPrimary,
          overflow: "hidden",
        }}
      >
        {/* Ambient Crimson & Telemetry Cyan Radial Glows */}
        <AbsoluteFill
          style={{
            background: `
              radial-gradient(circle at 84% 24%, rgba(239, 68, 68, ${0.24 * glowPulse}) 0%, rgba(9, 9, 11, 0) 54%),
              radial-gradient(circle at 16% 74%, rgba(56, 189, 248, ${0.16 * glowPulse}) 0%, rgba(9, 9, 11, 0) 58%)
            `,
          }}
        />

        {/* Engineering CAD Blueprint Grid & Ruler Ticks */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <pattern
              id="cadMinorGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(255, 255, 255, 0.025)"
                strokeWidth="1"
              />
            </pattern>
            <pattern
              id="cadMajorGrid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(0, ${gridScrollY})`}
            >
              <rect width="80" height="80" fill="url(#cadMinorGrid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.065)"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          <rect width="1080" height="1920" fill="url(#cadMajorGrid)" />

          {/* Left & Right Engineering Ruler Scale Ticks */}
          {Array.from({ length: 20 }).map((_, idx) => {
            const yTick = 160 + idx * 80;
            return (
              <g key={idx} opacity="0.28">
                <line
                  x1="24"
                  y1={yTick}
                  x2="44"
                  y2={yTick}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
                <text
                  x="50"
                  y={yTick + 5}
                  fill="#64748B"
                  fontFamily="monospace"
                  fontSize="13"
                >
                  {String(idx * 100).padStart(4, "0")}
                </text>
                <line
                  x1="1036"
                  y1={yTick}
                  x2="1056"
                  y2={yTick}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Animated Wind-Tunnel Streamlines when preset === "wind_tunnel_grid" */}
          {preset === "wind_tunnel_grid" &&
            [380, 520, 680, 860, 1020, 1240].map((yLine, idx) => {
              const xOffset = (frame * (9 + (idx % 3) * 3) + idx * 140) % 1200;
              return (
                <line
                  key={idx}
                  x1={1080 - xOffset}
                  y1={yLine}
                  x2={1260 - xOffset}
                  y2={yLine}
                  stroke={idx % 2 === 0 ? "#EF4444" : "#38BDF8"}
                  strokeWidth="2"
                  strokeDasharray="18 12"
                  strokeOpacity="0.24"
                />
              );
            })}
        </svg>

        {/* Fast GPU-friendly micro-dot grain overlay */}
        <AbsoluteFill
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)",
            backgroundSize: "18px 18px",
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }

  const slowWave1 = Math.sin(frame / 26) * 14;
  const slowWave2 = Math.cos(frame / 34) * 18;
  const strataDriftY = interpolate(frame, [0, 300], [0, -24], {
    extrapolateRight: "extend",
  });
  const sharkMainX = interpolate(frame, [0, 300], [-40, 120], {
    extrapolateRight: "extend",
  });
  const sharkMainBob = Math.sin(frame / 18) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bgPrimary,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 72% 35%, #164866 0%, #0B2538 64%, #061622 100%)`,
        }}
      />
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0 }}
      >
        <g opacity="0.22">
          <path
            d={`M -60 ${360 + slowWave1} Q 540 ${270 - slowWave2} 1140 ${380 + slowWave1}`}
            fill="none"
            stroke="#5CE1E6"
            strokeWidth="2.5"
            strokeDasharray="10 14"
          />
        </g>
        <g transform={`translate(0, ${strataDriftY})`}>
          <path
            d="M 0 -50 L 435 -50 L 420 120 L 442 290 L 415 470 L 438 660 L 412 850 L 432 1040 L 408 1220 L 436 1410 L 418 1620 L 440 1970 L 0 1970 Z"
            fill="#354F59"
          />
        </g>
        <g transform={`translate(${65 + sharkMainX}, ${1120 + sharkMainBob})`}>
          <path
            d="M 20 52 C 75 24, 155 20, 225 32 L 262 -16 L 274 34 C 325 42, 368 54, 392 64 C 362 78, 318 82, 268 82 L 242 128 L 222 80 C 148 82, 75 74, 20 52 Z"
            fill="#89AABF"
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
