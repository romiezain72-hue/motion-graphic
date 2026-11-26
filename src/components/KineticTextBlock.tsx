import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clampToSafeZone, evalSpringPreset } from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface KineticTextBlockProps {
  eyebrow?: string;
  lines?: string[];
  highlightWords?: string[];
  align?: "left" | "center";
  fontSize?: number;
  staggerFrames?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * MOD-05: <KineticTextBlock /> (Acuan: @mimi.mosaic Ref #4 & Ali Abdaal / Apple Keynote Typography)
 * - Per-word masked slide-up reveal + motion blur dissipation
 * - Automatic highlighter pill background on words listed in `highlightWords`
 */
export const KineticTextBlock: React.FC<KineticTextBlockProps> = ({
  eyebrow = "KEY INSIGHT // KINETIC TYPOGRAPHY",
  lines = [
    "Bukan Sekadar Animasi,",
    "Tapi Rekayasa Retensi Visual",
  ],
  highlightWords = ["Rekayasa", "Retensi", "Visual"],
  align = "center",
  fontSize = 52,
  staggerFrames = 4,
  x = 540,
  y = 620,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const safePos = clampToSafeZone(x, y, 820, 260);
  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  const highlightSet = new Set(
    highlightWords.map((w) => w.toLowerCase().replace(/[^\w]/g, ""))
  );

  let globalWordIdx = 0;

  return (
    <div
      style={{
        position: "absolute",
        left: safePos.x,
        top: safePos.y,
        width: 820,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: 14,
        zIndex: 29,
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: typography.monoFont,
            fontSize: 17,
            fontWeight: 700,
            color: colors.accentSecondary,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: interpolate(relFrame, [0, 10], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {eyebrow}
        </div>
      )}

      {lines.map((line, lineIdx) => {
        const words = line.trim().split(/\s+/);
        return (
          <div
            key={lineIdx}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: align === "center" ? "center" : "flex-start",
              columnGap: 16,
              rowGap: 10,
              overflow: "hidden",
              padding: "4px 6px",
            }}
          >
            {words.map((word) => {
              const wordOrder = globalWordIdx++;
              const wordDelay = wordOrder * staggerFrames;
              const prog = evalSpringPreset(
                Math.max(0, relFrame - wordDelay),
                fps,
                "satSetSnap"
              );

              const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
              const isHighlighted = highlightSet.has(cleanWord);
              const translateY = interpolate(prog, [0, 1], [62, 0]);
              const blurPx = interpolate(prog, [0, 0.7, 1], [8, 1.5, 0], {
                extrapolateRight: "clamp",
              });
              const opacity = interpolate(prog, [0, 0.35, 1], [0, 1, 1]);

              return (
                <span
                  key={`${lineIdx}-${wordOrder}`}
                  style={{
                    display: "inline-block",
                    transform: `translateY(${translateY}px)`,
                    filter: blurPx > 0.2 ? `blur(${blurPx.toFixed(1)}px)` : "none",
                    opacity,
                    fontFamily: typography.displayFont,
                    fontSize,
                    fontWeight: 900,
                    lineHeight: 1.12,
                    color: isHighlighted ? "#09090B" : colors.textPrimary,
                    backgroundColor: isHighlighted
                      ? colors.accentBadge
                      : "transparent",
                    padding: isHighlighted ? "2px 14px" : "2px 0",
                    borderRadius: isHighlighted ? 10 : 0,
                    boxShadow: isHighlighted
                      ? `0 8px 20px ${colors.accentBadge}44`
                      : "none",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
