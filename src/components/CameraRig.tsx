import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  computeWhipPanBlurPx,
  evalCurve,
  sampleNormalizedVelocity,
  type MotionCurveName,
} from "../motionCurves";

export type CameraMotionPresetType =
  | "fast_punch_zoom"
  | "zoom_out_reveal"
  | "lateral_whip_pan"
  | "micro_turbulence"
  | "counter_tilt_lock"
  | "custom";

export interface CameraRigProps {
  durationInFrames: number;
  motionType?: CameraMotionPresetType | string;
  fromScale?: number;
  toScale?: number;
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
  fromRotateDeg?: number;
  toRotateDeg?: number;
  parallaxStrength?: number;
  curve?: MotionCurveName;
  backgroundLayer: React.ReactNode;
  foregroundLayer: React.ReactNode;
}

/**
 * MOD-09: <CameraRig /> (Multi-Camera Choreography & 2.5D Parallax Engine)
 * Supports 5 narrative camera presets via `motionType` (`cameraMotion.type` in `04_storyboard.json`):
 * - `fast_punch_zoom`: Snappy push-in (`1.0 -> 1.06`) with upward drift
 * - `zoom_out_reveal`: Starts tight (`1.12 -> 1.0`) and pulls back to reveal full diagram/context
 * - `lateral_whip_pan`: Dynamic horizontal camera sweep with velocity-linked directional blur
 * - `micro_turbulence`: High-energy harmonic camera vibration for speed/drag/conflict scenes
 * - `counter_tilt_lock`: Subtle rotational roll (`-2.2deg -> 0deg`) for horizon/stability payoffs
 */
export const CameraRig: React.FC<CameraRigProps> = ({
  durationInFrames,
  motionType = "fast_punch_zoom",
  fromScale,
  toScale,
  fromX,
  toX,
  fromY,
  toY,
  fromRotateDeg = 0,
  toRotateDeg = 0,
  parallaxStrength = 0.48,
  curve,
  backgroundLayer,
  foregroundLayer,
}) => {
  const frame = useCurrentFrame();
  const safeDur = Math.max(1, durationInFrames);

  // Resolve defaults based on narrative preset
  let resolvedCurve: MotionCurveName = curve ?? "smoothDeceleration";
  let s0 = fromScale ?? 1.0;
  let s1 = toScale ?? 1.06;
  let x0 = fromX ?? 0;
  let x1 = toX ?? 0;
  let y0 = fromY ?? 0;
  let y1 = toY ?? -18;
  let r0 = fromRotateDeg;
  let r1 = toRotateDeg;

  if (motionType === "zoom_out_reveal") {
    s0 = fromScale ?? 1.12;
    s1 = toScale ?? 1.0;
    y0 = fromY ?? 14;
    y1 = toY ?? 0;
    resolvedCurve = curve ?? "smoothDeceleration";
  } else if (motionType === "lateral_whip_pan") {
    s0 = fromScale ?? 1.03;
    s1 = toScale ?? 1.05;
    x0 = fromX ?? -34;
    x1 = toX ?? 12;
    y0 = fromY ?? 0;
    y1 = toY ?? -8;
    resolvedCurve = curve ?? "whipPan";
  } else if (motionType === "counter_tilt_lock") {
    s0 = fromScale ?? 1.07;
    s1 = toScale ?? 1.0;
    r0 = fromRotateDeg || -2.2;
    r1 = toRotateDeg || 0;
    resolvedCurve = curve ?? "elasticOvershoot";
  }

  const progress = evalCurve(frame, 0, safeDur, resolvedCurve);

  // Optional micro-turbulence harmonic vibration
  const turbX =
    motionType === "micro_turbulence"
      ? Math.sin(frame * 0.45) * 4.5 + Math.cos(frame * 0.9) * 2.0
      : 0;
  const turbY =
    motionType === "micro_turbulence"
      ? Math.cos(frame * 0.55) * 4.0 + Math.sin(frame * 0.8) * 2.2
      : 0;

  // Foreground (1.0x camera response)
  const fgScale = interpolate(progress, [0, 1], [s0, s1]);
  const fgX = interpolate(progress, [0, 1], [x0, x1]) + turbX;
  const fgY = interpolate(progress, [0, 1], [y0, y1]) + turbY;
  const fgRot = interpolate(progress, [0, 1], [r0, r1]);

  // Velocity-based directional blur during initial 24 frames of lateral_whip_pan
  const whipBlurPx =
    motionType === "lateral_whip_pan" && frame < 24
      ? computeWhipPanBlurPx(
          sampleNormalizedVelocity(frame, 0, 24, "whipPan"),
          6
        )
      : 0;

  // Background (slower parallax plane for 2.5D depth of field)
  const bgScale = interpolate(
    progress,
    [0, 1],
    [1.0, 1.0 + (s1 - 1.0) * parallaxStrength]
  );
  const bgX = fgX * parallaxStrength;
  const bgY = fgY * parallaxStrength;
  const bgRot = fgRot * parallaxStrength;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Background Parallax Plane */}
      <AbsoluteFill
        style={{
          scale: String(bgScale),
          translate: `${bgX}px ${bgY}px`,
          rotate: `${bgRot}deg`,
          transformOrigin: "50% 50%",
        }}
      >
        {backgroundLayer}
      </AbsoluteFill>

      {/* Foreground Hero Plane */}
      <AbsoluteFill
        style={{
          scale: String(fgScale),
          translate: `${fgX}px ${fgY}px`,
          rotate: `${fgRot}deg`,
          filter: whipBlurPx > 0.3 ? `blur(${whipBlurPx.toFixed(1)}px)` : "none",
          transformOrigin: "50% 50%",
        }}
      >
        {foregroundLayer}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
