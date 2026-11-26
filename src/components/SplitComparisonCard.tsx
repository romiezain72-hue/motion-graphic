import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  clampToSafeZone,
  evalCurve,
  evalSpringPreset,
} from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface SplitComparisonSide {
  tag: string;
  title: string;
  metricValue?: string;
  metricLabel?: string;
  points?: string[];
}

export interface SplitComparisonCardProps {
  leftSide?: SplitComparisonSide;
  rightSide?: SplitComparisonSide;
  vsLabel?: string;
  layout?: "horizontal" | "vertical";
  highlightWinner?: "left" | "right";
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * MOD-04: <SplitComparisonCard /> ("Versus Mode" — Acuan: @getalgopicks Ref #3 & @tessa.fairbrook Ref #7)
 * - Dual-pane comparison card (Before vs After / Myth vs Fact / Old Workflow vs AI Workflow)
 * - Choreographed 4-phase entrance:
 *   1. Left/Top pane snaps in (frame 0..14)
 *   2. Animated glowing divider line & "VS" badge pop (frame 8..22)
 *   3. Right/Bottom winner pane wipes in with accent border glow (frame 12..28)
 *   4. Staggered bullet points & winner spotlight pulse (frame 22+)
 */
export const SplitComparisonCard: React.FC<SplitComparisonCardProps> = ({
  leftSide = {
    tag: "CARA LAMA // MANUAL",
    title: "Proses Lambat & Kaku",
    metricValue: "4.5 JAM",
    metricLabel: "WAKTU PRODUKSI",
    points: ["Copy-paste manual antar tools", "Revisi ulang dari nol"],
  },
  rightSide = {
    tag: "CARA BARU // AI ENGINE",
    title: "Pipeline Otomatis Sat-Set",
    metricValue: "12 MENIT",
    metricLabel: "ZERO-DRIFT SYNC",
    points: ["Multi-Agent JSON Checkpoints", "Auto QA Gate & 60fps Render"],
  },
  vsLabel = "VS",
  layout = "horizontal",
  highlightWinner = "right",
  width = 820,
  height = 460,
  x = 540,
  y = 780,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const safePos = clampToSafeZone(x, y, width, height);
  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const leftSpring = evalSpringPreset(relFrame, fps, "satSetSnap");
  const rightSpring = evalSpringPreset(Math.max(0, relFrame - 10), fps, "satSetSnap");
  const vsPop = evalSpringPreset(Math.max(0, relFrame - 14), fps, "elasticPop");
  const dividerProgress = evalCurve(relFrame, 6, 24, "whipPan");

  const winnerPulse = 0.85 + 0.15 * Math.sin(relFrame / 14);
  const isHorizontal = layout === "horizontal";

  const renderPane = (
    side: SplitComparisonSide,
    isWinner: boolean,
    progress: number,
    slideDir: number
  ) => {
    const translatePx = interpolate(progress, [0, 1], [slideDir * 36, 0]);
    const opacity = interpolate(progress, [0, 0.4, 1], [0, 1, 1]);
    const borderColor = isWinner ? colors.accentHighlight : "rgba(148, 163, 184, 0.25)";
    const bgColor = isWinner
      ? "rgba(15, 23, 42, 0.94)"
      : "rgba(15, 23, 42, 0.72)";

    return (
      <div
        style={{
          flex: 1,
          backgroundColor: bgColor,
          border: `2.5px solid ${borderColor}`,
          borderRadius: 22,
          padding: "24px 26px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: isHorizontal
            ? `translateX(${translatePx}px)`
            : `translateY(${translatePx}px)`,
          opacity,
          boxShadow: isWinner
            ? `0 18px 44px rgba(0,0,0,0.55), 0 0 ${24 * winnerPulse}px ${colors.accentHighlight}33`
            : "0 12px 28px rgba(0,0,0,0.35)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Tag Pill */}
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            backgroundColor: isWinner ? colors.accentHighlight : "rgba(148, 163, 184, 0.18)",
            color: isWinner ? "#09090B" : colors.textSecondary,
            fontFamily: typography.monoFont,
            fontSize: 15,
            fontWeight: 800,
            padding: "5px 12px",
            borderRadius: 8,
            letterSpacing: "0.06em",
          }}
        >
          {side.tag}
        </div>

        {/* Title & Hero Metric */}
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <div
            style={{
              fontFamily: typography.displayFont,
              fontSize: 28,
              fontWeight: 800,
              color: colors.textPrimary,
              lineHeight: 1.15,
            }}
          >
            {side.title}
          </div>

          {side.metricValue && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 10 }}>
              <span
                style={{
                  fontFamily: typography.displayFont,
                  fontSize: 44,
                  fontWeight: 900,
                  color: isWinner ? colors.accentBadge : colors.textSecondary,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                {side.metricValue}
              </span>
              {side.metricLabel && (
                <span
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: 14,
                    fontWeight: 700,
                    color: colors.textSecondary,
                    letterSpacing: "0.05em",
                  }}
                >
                  {side.metricLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Staggered Bullet List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(side.points || []).map((pt, idx) => {
            const ptProgress = evalSpringPreset(
              Math.max(0, relFrame - 18 - idx * 6),
              fps,
              "satSetSnap"
            );
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: interpolate(ptProgress, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(ptProgress, [0, 1], [14, 0])}px)`,
                  fontFamily: typography.displayFont,
                  fontSize: 19,
                  fontWeight: 600,
                  color: isWinner ? colors.textPrimary : colors.textSecondary,
                }}
              >
                <span
                  style={{
                    color: isWinner ? colors.accentSecondary : "#EF4444",
                    fontWeight: 900,
                  }}
                >
                  {isWinner ? "✓" : "✕"}
                </span>
                <span>{pt}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: safePos.x,
        top: safePos.y,
        width,
        height,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: "stretch",
        gap: 22,
        zIndex: 27,
      }}
    >
      {renderPane(leftSide, highlightWinner === "left", leftSpring, -1)}

      {/* Center Animated VS Badge & Divider */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(vsPop, [0, 1], [0, 1])})`,
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: colors.accentBadge,
          color: "#09090B",
          border: "4px solid #FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: typography.displayFont,
          fontSize: 22,
          fontWeight: 900,
          boxShadow: `0 10px 26px rgba(0,0,0,0.6), 0 0 ${20 * dividerProgress}px ${colors.accentBadge}`,
          zIndex: 32,
        }}
      >
        {vsLabel}
      </div>

      {renderPane(rightSide, highlightWinner === "right", rightSpring, 1)}
    </div>
  );
};
