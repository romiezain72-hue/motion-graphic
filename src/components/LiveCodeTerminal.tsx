import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clampToSafeZone, evalSpringPreset } from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface CodeLineItem {
  code: string;
  isHighlighted?: boolean;
  badge?: string;
}

export interface LiveCodeTerminalProps {
  windowTitle?: string;
  languageTag?: string;
  lines?: CodeLineItem[];
  typingSpeedCharsPerFrame?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * MOD-06: <LiveCodeTerminal /> (Acuan: @wilingonten Ref #5 & Fireship / Linear Dev UI)
 * - Obsidian macOS/Linux terminal window with traffic-light dots & language badge
 * - Progressive line/character typing animation, glowing active line highlight bar, and blinking block cursor
 */
export const LiveCodeTerminal: React.FC<LiveCodeTerminalProps> = ({
  windowTitle = "workflows/produce_reel_workflow.py",
  languageTag = "PYTHON // MULTI-AGENT",
  lines = [
    { code: "phase('1. Parallel Sub-Agent Audit')" },
    {
      code: "reviews = await parallel(critics, run_agent)",
      isHighlighted: true,
      badge: "3X FASTER",
    },
    { code: "await build_reel(qa_gate='STRICT', fps=60)" },
    {
      code: "# [PASS] 0 Drift | Safe Zone Verified",
      isHighlighted: true,
      badge: "READY",
    },
  ],
  typingSpeedCharsPerFrame = 1.6,
  width = 820,
  height = 380,
  x = 540,
  y = 770,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const safePos = clampToSafeZone(x, y, width, height);
  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const pop = evalSpringPreset(relFrame, fps, "satSetSnap");
  const scale = interpolate(pop, [0, 1], [0.88, 1]);
  const opacity = interpolate(pop, [0, 0.35, 1], [0, 1, 1]);

  const totalCharsToReveal = Math.floor(
    Math.max(0, relFrame - 8) * typingSpeedCharsPerFrame
  );
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  let runningCharCount = 0;

  return (
    <div
      style={{
        position: "absolute",
        left: safePos.x,
        top: safePos.y,
        width,
        minHeight: height,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        backgroundColor: "#0B0D13",
        border: `2px solid rgba(148, 163, 184, 0.28)`,
        borderRadius: 22,
        boxShadow:
          "0 26px 60px rgba(0, 0, 0, 0.68), 0 0 36px rgba(56, 189, 248, 0.14)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 27,
      }}
    >
      {/* Top Window Bar */}
      <div
        style={{
          height: 54,
          backgroundColor: "#141824",
          borderBottom: "1.5px solid rgba(148, 163, 184, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#EF4444",
            }}
          />
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#FACC15",
            }}
          />
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#22C55E",
            }}
          />
          <span
            style={{
              marginLeft: 12,
              fontFamily: typography.monoFont,
              fontSize: 17,
              fontWeight: 600,
              color: colors.textSecondary,
            }}
          >
            {windowTitle}
          </span>
        </div>

        <span
          style={{
            fontFamily: typography.monoFont,
            fontSize: 14,
            fontWeight: 800,
            color: colors.accentSecondary,
            backgroundColor: "rgba(56, 189, 248, 0.14)",
            padding: "4px 10px",
            borderRadius: 6,
            letterSpacing: "0.06em",
          }}
        >
          {languageTag}
        </span>
      </div>

      {/* Code Lines Body */}
      <div
        style={{
          padding: "24px 26px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {lines.map((item, idx) => {
          const lineStartChar = runningCharCount;
          const lineLen = item.code.length;
          runningCharCount += lineLen;

          const visibleCount = Math.max(
            0,
            Math.min(lineLen, totalCharsToReveal - lineStartChar)
          );
          const visibleText = item.code.slice(0, visibleCount);
          const isCurrentlyTyping =
            totalCharsToReveal >= lineStartChar &&
            totalCharsToReveal < lineStartChar + lineLen;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderRadius: 12,
                backgroundColor: item.isHighlighted
                  ? "rgba(56, 189, 248, 0.12)"
                  : "transparent",
                borderLeft: item.isHighlighted
                  ? `4px solid ${colors.accentHighlight}`
                  : "4px solid transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontFamily: typography.monoFont,
                  fontSize: 21,
                  fontWeight: 600,
                  color: item.isHighlighted ? "#FFFFFF" : "#CBD5E1",
                }}
              >
                <span style={{ color: "#64748B", userSelect: "none" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span>
                  {visibleText}
                  {isCurrentlyTyping && cursorBlink && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 11,
                        height: 22,
                        backgroundColor: colors.accentBadge,
                        marginLeft: 3,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                </span>
              </div>

              {item.badge && visibleCount >= lineLen && (
                <span
                  style={{
                    backgroundColor: colors.accentBadge,
                    color: "#09090B",
                    fontFamily: typography.monoFont,
                    fontSize: 14,
                    fontWeight: 900,
                    padding: "4px 10px",
                    borderRadius: 6,
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
