/**
 * MOD-01: After Effects Speed-Graph & Custom Bezier Motion Library (`src/motionCurves.ts`)
 *
 * Pustaka pusat kurva animasi Cubic-Bezier (terkalibrasi dari After Effects Speed Graph),
 * Spring Physics Presets (`remotion@4.0.242`), simulator Directional Motion Blur / Vector Smear,
 * serta helper Safe Zone Reels (1080x1920 @ 60fps).
 *
 * Referensi Studio & Kreator:
 * - Apple UI & Product Motion (`snapIn`, `smoothDeceleration`)
 * - Vox Editorial Graphics (`whipPan`, `smoothDeceleration`, Asymmetric Mountain Speed Graph)
 * - Kurzgesagt (`elasticOvershoot`, Vector Smear pada kecepatan puncak)
 * - @motionformat, @getalgopicks, @wilingonten, @ciwankcyril, @tessa.fairbrook
 */
import {
  Easing,
  interpolate,
  measureSpring,
  spring,
  type SpringConfig,
} from "remotion";
import { themeConfig } from "./projectLoader";

export type MotionCurveName =
  | "snapIn"
  | "whipPan"
  | "elasticOvershoot"
  | "smoothDeceleration";

export type MotionCurveVariantName =
  | MotionCurveName
  | "snapInUltra"
  | "whipPan14f"
  | "appleGlide";

export type SpringPresetName =
  | "satSetSnap"
  | "elasticPop"
  | "stickerBounce"
  | "heavyGlide";

export interface BezierTuple {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MotionCurveSpec {
  name: MotionCurveName;
  bezier: BezierTuple;
  easing: (t: number) => number;
  recommendedFrames60fps: readonly [number, number];
  aeSpeedGraphNote: string;
}

/**
 * Batas Safe Zone mutlak Instagram Reels (1080x1920) sesuai `scripts/qa_auditor.py`.
 */
export const REELS_SAFE_ZONE = {
  xMin: 80,
  xMax: 920,
  yMin: 140,
  yMax: 1500,
  centerX: 540,
  centerY: 820,
  safeWidth: 840,
  safeHeight: 1360,
} as const;

/**
 * 1. Core Bezier Motion Library (terkalibrasi dari AE Speed Graph @ 60fps)
 */
export const MOTION_CURVES: Record<MotionCurveName, MotionCurveSpec> = {
  snapIn: {
    name: "snapIn",
    bezier: { x1: 0.16, y1: 1, x2: 0.3, y2: 1 },
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    recommendedFrames60fps: [12, 18],
    aeSpeedGraphNote:
      "Out-Influence 16% (peak kiri tajam), In-Influence 70% (smooth stop)",
  },
  whipPan: {
    name: "whipPan",
    bezier: { x1: 0.83, y1: 0, x2: 0.17, y2: 1 },
    easing: Easing.bezier(0.83, 0, 0.17, 1),
    recommendedFrames60fps: [12, 15], // Wajib lolos QA sat-set 12-15f
    aeSpeedGraphNote:
      "Symmetrical extreme S-curve; puncak kecepatan di tengah untuk motion blur",
  },
  elasticOvershoot: {
    name: "elasticOvershoot",
    bezier: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    recommendedFrames60fps: [18, 28],
    aeSpeedGraphNote: "Overshoot +8.74% di t=0.5 lalu settle mulus ke 1.0",
  },
  smoothDeceleration: {
    name: "smoothDeceleration",
    bezier: { x1: 0.22, y1: 1, x2: 0.36, y2: 1 },
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    recommendedFrames60fps: [45, 150],
    aeSpeedGraphNote:
      "Out-Influence 22%, In-Influence 64% untuk camera drift & parallax",
  },
};

/**
 * Varian tambahan kurva Bezier untuk kebutuhan mikro-koreografi spesifik.
 */
export const MOTION_CURVE_VARIANTS: Record<
  MotionCurveVariantName,
  (t: number) => number
> = {
  snapIn: MOTION_CURVES.snapIn.easing,
  whipPan: MOTION_CURVES.whipPan.easing,
  elasticOvershoot: MOTION_CURVES.elasticOvershoot.easing,
  smoothDeceleration: MOTION_CURVES.smoothDeceleration.easing,
  snapInUltra: Easing.bezier(0.19, 1, 0.22, 1),
  whipPan14f: Easing.bezier(0.76, 0, 0.24, 1),
  appleGlide: Easing.bezier(0.25, 1, 0.5, 1),
};

/**
 * 2. Presets Spring Physics (kompatibel Remotion 4.0.242 `spring()`)
 * Selaras dengan token `themeConfig` dari `src/projectLoader.ts`.
 */
const optionalMotionTokens = (
  themeConfig as unknown as {
    motion?: {
      springDamping?: number;
      springStiffness?: number;
      springMass?: number;
    };
  }
).motion;

export const SPRING_PRESETS: Record<SpringPresetName, Partial<SpringConfig>> = {
  satSetSnap: {
    damping: optionalMotionTokens?.springDamping ?? 22,
    stiffness: optionalMotionTokens?.springStiffness ?? 290,
    mass: optionalMotionTokens?.springMass ?? 0.65,
    overshootClamping: true,
  },
  elasticPop: {
    damping: 14,
    stiffness: 310,
    mass: 0.58,
    overshootClamping: false,
  },
  stickerBounce: {
    damping: 20,
    stiffness: 310,
    mass: 0.58,
    overshootClamping: false,
  },
  heavyGlide: {
    damping: 28,
    stiffness: 120,
    mass: 1.0,
    overshootClamping: true,
  },
};

/**
 * Helper pembaca token visual aktif (`themeConfig`) untuk komponen berbasis `motionCurves`.
 */
export function getActiveMotionThemeTokens() {
  return {
    activeArchetype: themeConfig.activeArchetype,
    paletteName: themeConfig.paletteName,
    colors: themeConfig.colors,
    typography: themeConfig.typography,
    textures: themeConfig.textures,
  };
}

/**
 * 3. Helper Konversi After Effects Speed Graph -> CSS/Remotion Bezier
 *
 * Rumus matematis:
 *   x1 = I_out / 100
 *   y1 = x1 * (S_out / V_avg)
 *   x2 = 1 - (I_in / 100)
 *   y2 = 1 - (1 - x2) * (S_in / V_avg)
 */
export function aeSpeedGraphToBezier(params: {
  outInfluencePct: number;
  outSpeedRatio: number; // Out-Speed / V_avg
  inInfluencePct: number;
  inSpeedRatio: number; // In-Speed / V_avg
}): BezierTuple {
  const x1 = Math.max(0.01, Math.min(1, params.outInfluencePct / 100));
  const y1 = Number((x1 * params.outSpeedRatio).toFixed(4));
  const x2 = Math.max(0, Math.min(0.99, 1 - params.inInfluencePct / 100));
  const y2 = Number((1 - (1 - x2) * params.inSpeedRatio).toFixed(4));
  return { x1, y1, x2, y2 };
}

/**
 * Membuat fungsi easing Remotion langsung dari parameter After Effects Speed Graph.
 */
export function aeSpeedGraphToEasing(params: {
  outInfluencePct: number;
  outSpeedRatio: number;
  inInfluencePct: number;
  inSpeedRatio: number;
}): (t: number) => number {
  const { x1, y1, x2, y2 } = aeSpeedGraphToBezier(params);
  return Easing.bezier(x1, y1, x2, y2);
}

/**
 * 4. Evaluasi Kurva Clamped per-frame (selalu aman di 60fps)
 */
export function evalCurve(
  frame: number,
  startFrame: number,
  durationFrames: number,
  curve: MotionCurveName | ((t: number) => number),
  outputRange: readonly [number, number] = [0, 1]
): number {
  const easingFn =
    typeof curve === "string" ? MOTION_CURVES[curve].easing : curve;
  const endFrame = startFrame + Math.max(1, durationFrames);
  return interpolate(frame, [startFrame, endFrame], [outputRange[0], outputRange[1]], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easingFn,
  });
}

/**
 * 5. Turunan Kecepatan Ternormalisasi & Simulasi Directional Motion Blur / Vector Smear (60fps)
 *
 * v_norm(f) = N * |p(f + 0.5) - p(f - 0.5)|
 * Di mana v_norm = 1.0 adalah kecepatan linear rata-rata;
 * pada kurva Whip-Pan, v_norm memuncak di ~2.4 - 3.2 pada pertengahan transisi.
 */
export function sampleNormalizedVelocity(
  frame: number,
  startFrame: number,
  durationFrames: number,
  curve: MotionCurveName | ((t: number) => number)
): number {
  const dur = Math.max(1, durationFrames);
  if (frame < startFrame || frame > startFrame + dur) return 0;
  const pPrev = evalCurve(frame - 0.5, startFrame, dur, curve);
  const pNext = evalCurve(frame + 0.5, startFrame, dur, curve);
  return Math.abs(pNext - pPrev) * dur;
}

/**
 * Menghitung stdDeviation (px) untuk SVG `<feGaussianBlur>` pada efek Whip-Pan
 * berbasis shutter angle 180 derajat.
 */
export function computeWhipPanBlurPx(
  normalizedVelocity: number,
  maxBlurPx = 16,
  threshold = 1.1
): number {
  if (normalizedVelocity <= threshold) return 0;
  return Math.min(maxBlurPx, (normalizedVelocity - threshold) * 7.5);
}

/**
 * Menghitung faktor Vector Smear / Squash-and-Stretch ala Kurzgesagt
 * sepanjang sumbu gerak saat kecepatan puncak.
 */
export function computeVectorSmearScale(
  normalizedVelocity: number,
  maxStretch = 0.18,
  velocityFactor = 0.05
): number {
  if (normalizedVelocity <= 1.0) return 1;
  return 1 + Math.min(maxStretch, velocityFactor * normalizedVelocity);
}

/**
 * 6. Helper Spring dengan dukungan `measureSpring` untuk QA/Sequencing
 */
export function evalSpringPreset(
  frame: number,
  fps: number,
  preset: SpringPresetName,
  opts?: { delay?: number; durationInFrames?: number }
): number {
  return spring({
    frame,
    fps,
    config: SPRING_PRESETS[preset],
    delay: opts?.delay ?? 0,
    durationInFrames: opts?.durationInFrames,
  });
}

export function getSpringSettleFrames(
  fps: number,
  preset: SpringPresetName
): number {
  return measureSpring({ fps, config: SPRING_PRESETS[preset] });
}

/**
 * 7. Helper Penjaga Koordinat Safe Zone Reels (X: 80..920, Y: 140..1500)
 */
export function clampToSafeZone(
  x: number,
  y: number,
  halfWidth = 0,
  halfHeight = 0
): { x: number; y: number } {
  const minX = REELS_SAFE_ZONE.xMin + halfWidth;
  const maxX = REELS_SAFE_ZONE.xMax - halfWidth;
  const minY = REELS_SAFE_ZONE.yMin + halfHeight;
  const maxY = REELS_SAFE_ZONE.yMax - halfHeight;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}
