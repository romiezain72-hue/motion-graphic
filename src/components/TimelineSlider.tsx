import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  clampToSafeZone,
  evalCurve,
  evalSpringPreset,
} from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface TimelineMilestone {
  era: string;
  title: string;
  detail?: string;
}

export interface TimelineSliderProps {
  header?: string;
  milestones?: TimelineMilestone[];
  activeIndex?: number;
  width?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * MOD-08: <TimelineSlider /> (Acuan: @motionformat Ref #2 Historical / Evolution Scrubber)
 * - Horizontal chronology track with animated progress bar, pulsing active era node, and spotlight detail card
 */
export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  header = "EVOLUSI & KRONOLOGI",
  milestones = [
    { era: "420 JUTA THN", title: "Hiu Purba Muncul", detail: "Era Silur" },
    { era: "350 JUTA THN", title: "Pohon Pertama", detail: "Archaeopteris" },
    { era: "230 JUTA THN", title: "Dinosaurus Awal", detail: "Era Trias" },
  ],
  activeIndex = 1,
  width = 820,
  x = 540,
  y = 1080,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const safePos = clampToSafeZone(x, y, width, 240);
  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const pop = evalSpringPreset(relFrame, fps, "satSetSnap");
  const scrubProgress = evalCurve(relFrame, 6, 32, "smoothDeceleration");

  const safeActiveIdx = Math.max(
    0,
    Math.min(milestones.length - 1, activeIndex)
  );
  const targetRatio =
    milestones.length > 1 ? safeActiveIdx / (milestones.length - 1) : 1;
  const fillRatio = targetRatio * scrubProgress;

  return (
    <div
      style={{
        position: "absolute",
        left: safePos.x,
        top: safePos.y,
        width,
        transform: `translate(-50%, -50%) scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
        opacity: interpolate(pop, [0, 0.35, 1], [0, 1, 1]),
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        border: "2px solid rgba(148, 163, 184, 0.26)",
        borderRadius: 24,
        padding: "24px 32px",
        boxShadow: "0 20px 48px rgba(0, 0, 0, 0.52)",
        zIndex: 27,
      }}
    >
      <div
        style={{
          fontFamily: typography.monoFont,
          fontSize: 15,
          fontWeight: 800,
          color: colors.accentSecondary,
          letterSpacing: "0.12em",
          marginBottom: 22,
          textAlign: "center",
        }}
      >
        {header}
      </div>

      {/* Horizontal Scrubber Track */}
      <div
        style={{
          position: "relative",
          height: 8,
          backgroundColor: "rgba(148, 163, 184, 0.22)",
          borderRadius: 999,
          margin: "0 36px 26px 36px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${fillRatio * 100}%`,
            backgroundColor: colors.accentHighlight,
            borderRadius: 999,
          }}
        />
      </div>

      {/* Milestone Nodes */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        {milestones.map((m, idx) => {
          const isCurrent = idx === safeActiveIdx;
          const isPassed = idx <= safeActiveIdx;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                opacity: isPassed ? 1 : 0.48,
                transform: isCurrent ? "scale(1.05)" : "scale(1)",
              }}
            >
              <span
                style={{
                  backgroundColor: isCurrent
                    ? colors.accentBadge
                    : "rgba(148, 163, 184, 0.18)",
                  color: isCurrent ? "#09090B" : colors.textSecondary,
                  fontFamily: typography.monoFont,
                  fontSize: 15,
                  fontWeight: 900,
                  padding: "4px 12px",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                {m.era}
              </span>
              <span
                style={{
                  fontFamily: typography.displayFont,
                  fontSize: 22,
                  fontWeight: 800,
                  color: isCurrent ? colors.textPrimary : colors.textSecondary,
                  lineHeight: 1.15,
                }}
              >
                {m.title}
              </span>
              {m.detail && (
                <span
                  style={{
                    marginTop: 4,
                    fontFamily: typography.monoFont,
                    fontSize: 14,
                    color: colors.accentSecondary,
                  }}
                >
                  {m.detail}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
