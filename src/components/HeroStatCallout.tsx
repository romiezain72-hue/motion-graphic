import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { evalCurve, SPRING_PRESETS } from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface HeroStatCalloutProps {
  value: string;
  subLabel: string;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
  animateCountUp?: boolean;
}

/**
 * <HeroStatCallout /> (v2 Sat-Set Spring Upgrade):
 * - Giant editorial stat number framed by a translucent illuminated strata band.
 * - Faster spring physics (`stiffness: 280, damping: 22, mass: 0.65`) and quicker count-up (`0.45s`).
 */
export const HeroStatCallout: React.FC<HeroStatCalloutProps> = ({
  value,
  subLabel,
  x = 260,
  y = 850,
  enterAtRelativeFrame = 0,
  animateCountUp = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const entranceProgress = spring({
    frame: relFrame,
    fps,
    config: SPRING_PRESETS.satSetSnap,
  });

  const numericTarget = Number(value.replace(/[^\d]/g, ""));
  const isNumeric =
    !Number.isNaN(numericTarget) && numericTarget > 0 && /^\d+$/.test(value);

  const countProgress = evalCurve(
    relFrame,
    0,
    Math.round(0.45 * fps),
    "smoothDeceleration"
  );

  const displayedValue =
    isNumeric && animateCountUp
      ? Math.round(numericTarget * countProgress).toString()
      : value;

  const opacity = interpolate(relFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(relFrame, [1, 15], [0, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        scale: String(interpolate(entranceProgress, [0, 1], [0.86, 1])),
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        zIndex: 24,
      }}
    >
      {/* Illuminated Strata Horizon Band */}
      <div
        style={{
          position: "relative",
          width: lineWidth,
          padding: "8px 0",
          background:
            "linear-gradient(90deg, rgba(56,189,248,0.18) 0%, rgba(248,250,252,0.16) 50%, rgba(56,189,248,0.04) 100%)",
          borderTop: `2.5px solid rgba(248, 250, 252, 0.85)`,
          borderBottom: `2.5px solid rgba(248, 250, 252, 0.85)`,
          boxShadow: "0 0 28px rgba(56, 189, 248, 0.25)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: typography.displayFont,
            fontSize: typography.heroStatSizePx,
            fontWeight: 900,
            lineHeight: 0.96,
            letterSpacing: "-0.02em",
            color: colors.textPrimary,
            textShadow:
              "0 0 26px rgba(248, 250, 252, 0.45), 0 8px 22px rgba(3, 12, 20, 0.85)",
          }}
        >
          {displayedValue}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: typography.displayFont,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "0.16em",
          color: colors.textPrimary,
          textShadow: "0 4px 14px rgba(0, 0, 0, 0.85)",
          whiteSpace: "nowrap",
        }}
      >
        {subLabel}
      </div>
    </div>
  );
};
