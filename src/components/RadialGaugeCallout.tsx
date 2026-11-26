import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  clampToSafeZone,
  evalCurve,
  evalSpringPreset,
} from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface RadialGaugeCalloutProps {
  value?: number;
  maxValue?: number;
  unit?: string;
  label?: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * MOD-07: <RadialGaugeCallout /> (Acuan: Apple Watch Fitness Ring / Engineering Telemetry HUD)
 * - Circular SVG progress meter with glowing arc, animated tip dot, and tabular-nums counter
 */
export const RadialGaugeCallout: React.FC<RadialGaugeCalloutProps> = ({
  value = 87.3,
  maxValue = 100,
  unit = "%",
  label = "EFISIENSI TRANSMISI",
  sublabel = "ZERO-DRIFT LOCK",
  size = 340,
  strokeWidth = 22,
  x = 540,
  y = 760,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const safePos = clampToSafeZone(x, y, size + 60, size + 110);
  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const pop = evalSpringPreset(relFrame, fps, "satSetSnap");
  const sweepProgress = evalCurve(relFrame, 4, 38, "smoothDeceleration");

  const clampedRatio = Math.max(0, Math.min(1, value / Math.max(1, maxValue)));
  const activeRatio = clampedRatio * sweepProgress;
  const displayNumber = (value * sweepProgress).toFixed(
    Number.isInteger(value) ? 0 : 1
  );

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - activeRatio);

  const center = size / 2;
  const tipAngleRad = -Math.PI / 2 + activeRatio * 2 * Math.PI;
  const tipX = center + radius * Math.cos(tipAngleRad);
  const tipY = center + radius * Math.sin(tipAngleRad);

  return (
    <div
      style={{
        position: "absolute",
        left: safePos.x,
        top: safePos.y,
        transform: `translate(-50%, -50%) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
        opacity: interpolate(pop, [0, 0.35, 1], [0, 1, 1]),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        zIndex: 28,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="rgba(15, 23, 42, 0.72)"
            stroke="rgba(148, 163, 184, 0.18)"
            strokeWidth={strokeWidth}
          />

          {/* Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.accentHighlight}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
          />

          {/* Glowing Endpoint Dot */}
          {activeRatio > 0.02 && (
            <circle
              cx={tipX}
              cy={tipY}
              r={strokeWidth * 0.48}
              fill="#FFFFFF"
              stroke={colors.accentBadge}
              strokeWidth={4}
            />
          )}
        </svg>

        {/* Center Readout */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: typography.displayFont,
              fontSize: 64,
              fontWeight: 900,
              color: colors.textPrimary,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {displayNumber}
            <span style={{ fontSize: 36, color: colors.accentBadge }}>
              {unit}
            </span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: typography.monoFont,
              fontSize: 15,
              fontWeight: 700,
              color: colors.accentSecondary,
              letterSpacing: "0.1em",
            }}
          >
            {sublabel}
          </div>
        </div>
      </div>

      {/* Bottom Label Pill */}
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          border: `1.5px solid rgba(148, 163, 184, 0.3)`,
          padding: "8px 22px",
          borderRadius: 999,
          fontFamily: typography.monoFont,
          fontSize: 18,
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
    </div>
  );
};
