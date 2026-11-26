import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { themeConfig } from "../projectLoader";

export interface TelemetryCardItem {
  label: string;
  value: string;
  subValue?: string;
  accent?: "crimson" | "cyan" | "gold";
}

export interface TelemetryHUDProps {
  cards: TelemetryCardItem[];
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * Archetype B (<TelemetryHUD /> v2 Sat-Set Pacing & Beat Spotlight):
 * - Fast 6-frame stagger with high-stiffness spring (`stiffness: 290, damping: 22, mass: 0.62`).
 * - Cycles an active telemetry spotlight across the 3 cards every 105 frames (1.75 seconds)
 *   so the HUD has continuous rhythmic visual beats throughout long scenes.
 */
export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  cards = [],
  x = 540,
  y = 1145,
  enterAtRelativeFrame = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);
  const activeCardBeatIdx = Math.floor(relFrame / 105) % Math.max(1, cards.length);

  const getAccentColor = (acc?: string) => {
    if (acc === "cyan") return "#38BDF8";
    if (acc === "gold") return colors.accentBadge;
    return colors.accentHighlight;
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 880,
        transform: "translate(-50%, -50%)",
        display: "flex",
        justifyContent: "space-between",
        gap: 18,
        zIndex: 28,
      }}
    >
      {cards.map((card, idx) => {
        const staggerFrame = Math.max(0, relFrame - idx * 6);
        const pop = spring({
          frame: staggerFrame,
          fps,
          config: { damping: 22, stiffness: 290, mass: 0.62 },
        });
        const accentColor = getAccentColor(card.accent);
        const isSpotlight = idx === activeCardBeatIdx && relFrame > 45;

        return (
          <div
            key={`${card.label}-${idx}`}
            style={{
              flex: 1,
              backgroundColor: isSpotlight
                ? "rgba(26, 29, 40, 0.96)"
                : "rgba(20, 21, 28, 0.92)",
              border: `${isSpotlight ? "2.5px" : "1.5px"} solid ${accentColor}`,
              borderRadius: 20,
              padding: "18px 20px",
              boxShadow: isSpotlight
                ? `0 0 26px ${accentColor}40, 0 12px 28px rgba(0, 0, 0, 0.65)`
                : `0 12px 28px rgba(0, 0, 0, 0.6), inset 0 0 24px rgba(255, 255, 255, 0.03)`,
              scale: String(
                interpolate(pop, [0, 1], [0.88, isSpotlight ? 1.025 : 1])
              ),
              opacity: interpolate(staggerFrame, [0, 5], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: typography.monoFont,
                fontSize: 16,
                fontWeight: 700,
                color: colors.textSecondary,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {card.label}
            </div>

            <div
              style={{
                fontFamily: typography.displayFont,
                fontSize: 44,
                fontWeight: 900,
                color: accentColor,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                textShadow: `0 0 20px ${accentColor}44`,
              }}
            >
              {card.value}
            </div>

            {card.subValue && (
              <div
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: 15,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  opacity: 0.88,
                }}
              >
                {card.subValue}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
