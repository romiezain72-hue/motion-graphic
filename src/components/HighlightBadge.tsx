import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_PRESETS } from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface HighlightBadgeProps {
  text: string;
  openLoopText?: string;
  openLoopAtRelativeFrame?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * <HighlightBadge /> (v2 Sat-Set + Pattern Interrupt / Open Loop Flip):
 * - High-stiffness spring pop-in (`stiffness: 300, damping: 22, mass: 0.62`).
 * - When `openLoopText` and `openLoopAtRelativeFrame` are provided, automatically
 *   executes a visual Pattern Interrupt flip in the last segment of the scene to hook
 *   viewers into the next step!
 */
export const HighlightBadge: React.FC<HighlightBadgeProps> = ({
  text,
  openLoopText,
  openLoopAtRelativeFrame,
  x = 540,
  y = 320,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const isOpenLoopActive =
    Boolean(openLoopText) &&
    openLoopAtRelativeFrame !== undefined &&
    frame >= openLoopAtRelativeFrame;

  const activeFrame = isOpenLoopActive
    ? Math.max(0, frame - (openLoopAtRelativeFrame || 0))
    : relFrame;

  const pop = spring({
    frame: activeFrame,
    fps,
    config: SPRING_PRESETS.satSetSnap,
  });

  const displayText = isOpenLoopActive && openLoopText ? openLoopText : text;

  const bgColor = isOpenLoopActive ? "#EF4444" : colors.accentBadge;
  const textColor = isOpenLoopActive ? "#F8FAFC" : colors.accentBadgeText;
  const borderColor = isOpenLoopActive ? "#FACC15" : "#FFFFFF";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        scale: String(interpolate(pop, [0, 1], [0.72, 1])),
        opacity: interpolate(activeFrame, [0, 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: typography.displayFont,
        fontSize: isOpenLoopActive ? 28 : 31,
        fontWeight: 900,
        letterSpacing: "0.05em",
        padding: "13px 30px",
        borderRadius: 999,
        boxShadow: isOpenLoopActive
          ? "0 0 32px rgba(239, 68, 68, 0.65), 0 12px 28px rgba(0, 0, 0, 0.7)"
          : "0 12px 28px rgba(0, 0, 0, 0.45)",
        border: `3px solid ${borderColor}`,
        whiteSpace: "nowrap",
        zIndex: 25,
      }}
    >
      {displayText}
    </div>
  );
};
