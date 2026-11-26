import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { themeConfig } from "../projectLoader";

export interface MagnifierCalloutProps {
  label: string;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
  iconVariant?: "shark_scales" | "ancient_tree";
}

/**
 * <MagnifierCallout /> (v2 Sat-Set Spring Upgrade):
 * - Circular zoom-in callout with rotating dashed outer ring, double border,
 *   multi-layered internal vector artwork, and clean editorial side label.
 */
export const MagnifierCallout: React.FC<MagnifierCalloutProps> = ({
  label,
  x = 290,
  y = 510,
  enterAtRelativeFrame = 0,
  iconVariant = "shark_scales",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const pop = spring({
    frame: relFrame,
    fps,
    config: {
      damping: 22,
      stiffness: 280,
      mass: 0.65,
    },
  });

  const ringRotationDeg = relFrame * 0.55;
  const floatY = Math.sin(frame / 20) * 5;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + floatY,
        transform: "translate(-50%, -50%)",
        scale: String(interpolate(pop, [0, 1], [0.45, 1])),
        opacity: interpolate(relFrame, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        display: "flex",
        alignItems: "center",
        gap: 20,
        zIndex: 26,
      }}
    >
      <div
        style={{
          width: 228,
          height: 228,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="228" height="228" viewBox="0 0 240 240">
          <defs>
            <radialGradient id="magnifierLensGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1B4965" />
              <stop offset="100%" stopColor="#091E2E" />
            </radialGradient>
            <filter id="denticleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#030D14" floodOpacity="0.65" />
            </filter>
          </defs>

          <line
            x1="75"
            y1="210"
            x2="35"
            y2="240"
            stroke={colors.textPrimary}
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeOpacity="0.55"
          />
          <line
            x1="165"
            y1="210"
            x2="205"
            y2="240"
            stroke={colors.textPrimary}
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeOpacity="0.55"
          />

          <circle
            cx="120"
            cy="120"
            r="96"
            fill="url(#magnifierLensGrad)"
            stroke={colors.textPrimary}
            strokeWidth="5.5"
          />

          <g transform={`rotate(${ringRotationDeg} 120 120)`}>
            <circle
              cx="120"
              cy="120"
              r="109"
              fill="none"
              stroke={colors.accentHighlight}
              strokeWidth="2.8"
              strokeDasharray="12 9"
              strokeOpacity="0.8"
            />
          </g>

          {iconVariant === "shark_scales" && (
            <g transform="translate(52, 48)" filter="url(#denticleShadow)">
              {[
                { cx: 34, cy: 36, rot: -20, sc: 1.0 },
                { cx: 82, cy: 30, rot: -12, sc: 1.05 },
                { cx: 56, cy: 76, rot: -16, sc: 1.08 },
                { cx: 102, cy: 72, rot: -8, sc: 0.98 },
                { cx: 28, cy: 104, rot: -22, sc: 0.95 },
              ].map((s, idx) => (
                <g
                  key={idx}
                  transform={`translate(${s.cx}, ${s.cy}) rotate(${s.rot}) scale(${s.sc})`}
                >
                  <path
                    d="M 0 -28 C 16 -18, 22 6, 13 26 L 5 20 L 0 28 L -5 20 L -13 26 C -22 6, -16 -18, 0 -28 Z"
                    fill="#E2ECEF"
                    stroke="#89A7B8"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M 0 -23 L 0 22 M -7 -16 C -5 -2, -5 10, -6 18 M 7 -16 C 5 -2, 5 10, 6 18"
                    stroke="#7596A8"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </g>
              ))}
            </g>
          )}

          {iconVariant === "ancient_tree" && (
            <g transform="translate(120, 128)" filter="url(#denticleShadow)">
              <path
                d="M -52 54 Q 0 42 52 54"
                fill="none"
                stroke="#8FA365"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M -11 52 C -8 25, -5 0, -4 -26 L 4 -26 C 5 0, 8 25, 11 52 Z"
                fill="#8D6346"
              />
              <path
                d="M -2 -10 L -28 -26 M 2 -14 L 28 -30 M 0 -24 L 0 -48"
                stroke="#8D6346"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M -46 -22 C -46 -44, -20 -56, 0 -52 C 20 -56, 46 -44, 46 -22 C 36 -10, -36 -10, -46 -22 Z"
                fill="#5E7442"
              />
              <path
                d="M -36 -36 C -28 -58, 28 -58, 36 -36 C 22 -24, -22 -24, -36 -36 Z"
                fill="#7D965B"
              />
              <path
                d="M -20 -50 C -12 -66, 12 -66, 20 -50 C 10 -42, -10 -42, -20 -50 Z"
                fill="#9BB574"
              />
            </g>
          )}
        </svg>
      </div>

      <div
        style={{
          fontFamily: typography.displayFont,
          fontSize: 34,
          fontWeight: 800,
          color: colors.textPrimary,
          textShadow: "0 4px 14px rgba(0, 0, 0, 0.85)",
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};
