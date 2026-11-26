import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { themeConfig } from "../projectLoader";

export interface TerminalHeaderProps {
  handle?: string;
  eyebrow?: string;
  telemetryTag?: string;
  x?: number;
  y?: number;
}

/**
 * Archetype B (<TerminalHeader /> v2 Sat-Set Spring Upgrade):
 * Developer/Engineering terminal pill header bar with snappy spring physics.
 */
export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  handle = "@aerodynamics.lab",
  eyebrow = "BEDAH FISIKA TEKNIK // QUADCOPTER FLIGHT SYSTEM",
  telemetryTag = "IMU 1000Hz",
  x = 540,
  y = 175,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const pop = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 290, mass: 0.62 },
  });

  const pulseOpacity = 0.55 + 0.45 * Math.sin(frame / 8);
  const timeSec = (frame / fps).toFixed(2);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 880,
        transform: "translate(-50%, -50%)",
        scale: String(interpolate(pop, [0, 1], [0.94, 1])),
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 35,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(20, 21, 28, 0.92)",
          border: "1.5px solid rgba(255, 255, 255, 0.14)",
          borderRadius: 999,
          padding: "12px 26px",
          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.55)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: colors.accentHighlight,
              opacity: pulseOpacity,
              boxShadow: `0 0 12px ${colors.accentHighlight}`,
            }}
          />
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: 22,
              fontWeight: 700,
              color: colors.textPrimary,
              letterSpacing: "0.03em",
            }}
          >
            {handle}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: 19,
              fontWeight: 700,
              color: "#38BDF8",
              letterSpacing: "0.06em",
            }}
          >
            {telemetryTag}
          </span>
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: 19,
              fontWeight: 700,
              color: colors.textSecondary,
              letterSpacing: "0.05em",
            }}
          >
            T+{timeSec}s
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: typography.monoFont,
          fontSize: 20,
          fontWeight: 700,
          color: colors.accentHighlight,
          letterSpacing: "0.22em",
          paddingLeft: 14,
          textTransform: "uppercase",
          textShadow: `0 0 16px rgba(239, 68, 68, 0.35)`,
        }}
      >
        {eyebrow}
      </div>
    </div>
  );
};
