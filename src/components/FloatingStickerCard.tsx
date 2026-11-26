import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_PRESETS } from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface FloatingStickerCardProps {
  badge?: string;
  label?: string;
  subtext?: string;
  accentColor?: string;
  tiltDeg?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * Archetype C Component: <FloatingStickerCard /> (Acuan: @ciwankcyril Ref #6 & @getalgopicks Ref #3)
 * - Pop-up rounded-square sticker card with thick white sticker border & deep elevation shadow
 * - Snappy spring pop-in with subtle rotation & ambient floating motion
 */
export const FloatingStickerCard: React.FC<FloatingStickerCardProps> = ({
  badge = "STEP 01",
  label = "JSON Checkpoint",
  subtext = "Zero-Drift Sync",
  accentColor = "#FACC15",
  tiltDeg = -3.5,
  x = 540,
  y = 1150,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);
  const pop = spring({
    frame: relFrame,
    fps,
    config: SPRING_PRESETS.stickerBounce,
  });

  const floatOffset = Math.sin((frame + enterAtRelativeFrame) / 18) * 6;
  const dynamicTilt =
    interpolate(pop, [0, 1], [tiltDeg * 2.4, tiltDeg]) +
    Math.cos(frame / 25) * 1.2;
  const scale = interpolate(pop, [0, 1], [0.5, 1]);
  const opacity = interpolate(pop, [0, 0.3, 1], [0, 1, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + floatOffset,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${dynamicTilt}deg)`,
        opacity,
        backgroundColor: "#0F172A",
        border: "4px solid #FFFFFF",
        borderRadius: 28,
        padding: "20px 32px",
        minWidth: 320,
        boxShadow:
          "0 18px 40px rgba(0, 0, 0, 0.45), 0 6px 0px rgba(255, 255, 255, 0.9)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        zIndex: 28,
      }}
    >
      {/* Left Rounded Icon / Pill Accent */}
      <div
        style={{
          backgroundColor: accentColor,
          color: "#0F172A",
          fontFamily: typography.monoFont,
          fontSize: 20,
          fontWeight: 800,
          padding: "12px 16px",
          borderRadius: 18,
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}
      >
        {badge}
      </div>

      {/* Right Text Stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontFamily: typography.displayFont,
            fontSize: 30,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: typography.monoFont,
            fontSize: 18,
            fontWeight: 600,
            color: "#93C5FD",
          }}
        >
          {subtext}
        </div>
      </div>
    </div>
  );
};
