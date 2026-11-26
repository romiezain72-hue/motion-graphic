import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_PRESETS } from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface BoundingBoxFrameProps {
  title?: string;
  highlightTag?: string;
  subtitle?: string;
  dimensionLabel?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * Archetype C Component: <BoundingBoxFrame /> (Acuan: @getalgopicks Ref #3)
 * - White selection bounding box with 8 square resize handles (Figma / After Effects style)
 * - High-contrast Yellow Highlighter Bar (#FACC15) & dimension readout pill
 * - Sat-Set v2 Spring pop-in (stiffness: 300, damping: 22, mass: 0.6) + subtle breathing scale
 */
export const BoundingBoxFrame: React.FC<BoundingBoxFrameProps> = ({
  title = "AUTOMATED WORKFLOW ENGINE",
  highlightTag = "with Multi-Agent AI",
  subtitle = "01_brief → 02_script → 03_audio → 04_storyboard",
  dimensionLabel = "760 × 420 px // 60 FPS",
  width = 760,
  height = 420,
  x = 540,
  y = 760,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);
  const pop = spring({
    frame: relFrame,
    fps,
    config: SPRING_PRESETS.satSetSnap,
  });

  const highlighterWipe = spring({
    frame: Math.max(0, relFrame - 8),
    fps,
    config: SPRING_PRESETS.satSetSnap,
  });

  const floatY = Math.sin(frame / 22) * 5;
  const scale = interpolate(pop, [0, 1], [0.84, 1]);
  const opacity = interpolate(pop, [0, 0.35, 1], [0, 1, 1]);

  // 8 Resize Handles positions (TL, TC, TR, ML, MR, BL, BC, BR)
  const handles: Array<{ left: string; top: string }> = [
    { left: "0%", top: "0%" },
    { left: "50%", top: "0%" },
    { left: "100%", top: "0%" },
    { left: "0%", top: "50%" },
    { left: "100%", top: "50%" },
    { left: "0%", top: "100%" },
    { left: "50%", top: "100%" },
    { left: "100%", top: "100%" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + floatY,
        width,
        height,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        zIndex: 26,
      }}
    >
      {/* Top-Left Figma/AE Layer Tag */}
      <div
        style={{
          position: "absolute",
          top: -36,
          left: 0,
          backgroundColor: "#FFFFFF",
          color: "#1D4ED8",
          fontFamily: typography.monoFont,
          fontSize: 16,
          fontWeight: 700,
          padding: "4px 12px",
          borderRadius: "6px 6px 0 0",
          letterSpacing: "0.06em",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
        }}
      >
        FRAME // {dimensionLabel}
      </div>

      {/* Main Selection Bounding Box */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.78)",
          border: "2.5px solid #FFFFFF",
          boxShadow:
            "0 24px 60px rgba(0, 0, 0, 0.45), inset 0 0 32px rgba(56, 189, 248, 0.14)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Crosshair Center Guides */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
          }}
        />

        {/* Headline Inside Selection Frame */}
        <div
          style={{
            fontFamily: typography.displayFont,
            fontSize: 44,
            fontWeight: 800,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: 18,
            zIndex: 2,
          }}
        >
          {title}
        </div>

        {/* Yellow Highlighter Bar (Signature Archetype C) */}
        <div
          style={{
            backgroundColor: "#FACC15",
            color: "#0F172A",
            fontFamily: typography.serifFont || typography.displayFont,
            fontStyle: "italic",
            fontSize: 38,
            fontWeight: 900,
            padding: "8px 26px",
            borderRadius: 8,
            transform: `scaleX(${interpolate(highlighterWipe, [0, 1], [0.2, 1])})`,
            boxShadow: "0 10px 25px rgba(250, 204, 21, 0.35)",
            marginBottom: 22,
            zIndex: 2,
          }}
        >
          {highlightTag}
        </div>

        {/* Monospace Sub-pipeline Readout */}
        <div
          style={{
            fontFamily: typography.monoFont,
            fontSize: 20,
            fontWeight: 600,
            color: "#93C5FD",
            letterSpacing: "0.04em",
            textAlign: "center",
            zIndex: 2,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* 8 Square Resize Handles */}
      {handles.map((h, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: h.left,
            top: h.top,
            width: 16,
            height: 16,
            backgroundColor: "#FFFFFF",
            border: "2.5px solid #1D4ED8",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            zIndex: 5,
          }}
        />
      ))}
    </div>
  );
};
