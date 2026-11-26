import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { themeConfig } from "../projectLoader";

export interface StepProgressPillsProps {
  activeStep: number; // 1 to 5
  stepTitle: string;
  x?: number;
  y?: number;
}

const STEPS = [
  { num: 1, label: "01" },
  { num: 2, label: "02" },
  { num: 3, label: "03" },
  { num: 4, label: "04" },
  { num: 5, label: "05" },
];

/**
 * Archetype B (<StepProgressPills /> v2 Sat-Set Spring Upgrade):
 * Numbered step progress indicators (01 - 05) with high-stiffness spring pop.
 */
export const StepProgressPills: React.FC<StepProgressPillsProps> = ({
  activeStep = 1,
  stepTitle = "PARADOKS TERBANG MAJU",
  x = 540,
  y = 285,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const pop = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 300, mass: 0.6 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 880,
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 34,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {STEPS.map((st) => {
          const isActive = st.num === activeStep;
          const isDone = st.num < activeStep;

          return (
            <div
              key={st.num}
              style={{
                width: isActive ? 68 : 56,
                height: 52,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: typography.monoFont,
                fontSize: isActive ? 24 : 20,
                fontWeight: 700,
                backgroundColor: isActive
                  ? "rgba(239, 68, 68, 0.24)"
                  : isDone
                    ? "rgba(56, 189, 248, 0.14)"
                    : "rgba(24, 24, 27, 0.85)",
                color: isActive
                  ? colors.textPrimary
                  : isDone
                    ? "#38BDF8"
                    : "#64748B",
                border: isActive
                  ? `2px solid ${colors.accentHighlight}`
                  : isDone
                    ? "1.5px solid rgba(56, 189, 248, 0.45)"
                    : "1.5px solid rgba(255, 255, 255, 0.1)",
                boxShadow: isActive
                  ? `0 0 20px rgba(239, 68, 68, 0.45)`
                  : "none",
                scale: isActive
                  ? String(interpolate(pop, [0, 1], [0.88, 1.05]))
                  : "1",
              }}
            >
              {st.label}
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontFamily: typography.monoFont,
          fontSize: 20,
          fontWeight: 700,
          color: colors.accentBadge,
          backgroundColor: "rgba(250, 204, 21, 0.14)",
          border: `1.5px solid rgba(250, 204, 21, 0.48)`,
          padding: "10px 22px",
          borderRadius: 12,
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
        }}
      >
        {stepTitle}
      </div>
    </div>
  );
};
