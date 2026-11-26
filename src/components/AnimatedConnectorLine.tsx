/**
 * MOD-02: Self-Drawing SVG Vector Paths & Animated Connector Arrows (`src/components/AnimatedConnectorLine.tsx`)
 *
 * Komponen konektor vektor SVG 1080x1920 @ 60fps dengan:
 * - Reparameterisasi Arc-Length LUT 64-segmen (Cubic Bezier & Orthogonal Fillet Elbow) -> 0px arrowhead drift
 * - Universal `<mask pathLength="1">` self-drawing (mendukung garis `solid`, `dashed`, maupun `dotted` tanpa geseran dash)
 * - Kurva kecepatan After Effects (`MOTION_CURVES.snapIn` / `smoothDeceleration` / `whipPan`) & Spring Physics (`SPRING_PRESETS`)
 * - 2-Phase Pulsing Radar / Sonar Rings pada node tujuan ala Vox & @motionformat Ref #1
 * - Penjaga otomatis Reels Safe Zone (`X: 80..920`, `Y: 140..1500`)
 */
import React, { useId, useMemo } from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  clampToSafeZone,
  evalCurve,
  SPRING_PRESETS,
  type MotionCurveName,
} from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface ConnectorPoint {
  x: number;
  y: number;
}

export interface AnimatedConnectorLineProps {
  from: ConnectorPoint;
  to: ConnectorPoint;
  variant?: "straight" | "curved" | "elbow";
  curveOffset?: number; // px normal offset untuk variant "curved" (default: -90)
  controlPoint1?: ConnectorPoint; // opsional override manual
  controlPoint2?: ConnectorPoint;
  elbowAxis?: "horizontal-first" | "vertical-first";
  elbowRatio?: number; // 0..1, default 0.5
  cornerRadius?: number; // px fillet untuk "elbow", default 24
  dashPattern?: "solid" | "dashed" | "dotted";
  headType?: "arrow" | "chevron" | "dot" | "none";
  nodeShape?: "circle" | "square_handle";
  showStartNode?: boolean;
  showEndNode?: boolean;
  showTrack?: boolean;
  pulse?: boolean;
  pulsePeriodFrames?: number; // default 72 (1.2s @ 60fps)
  color?: string;
  strokeWidth?: number; // default 4
  nodeRadius?: number; // default 8
  curve?: MotionCurveName; // default "snapIn"
  drawDelayFrames?: number; // default 6
  drawDurationFrames?: number; // default 26
  labelStart?: string;
  labelEnd?: string;
  zIndex?: number; // default 27 (di atas PhysicsDiagramCanvas 25 & BoundingBoxFrame 26, di bawah SceneHeadline 30)
  enterAtRelativeFrame?: number;
  x?: number; // midpoint opsional untuk validasi qa_auditor.py
  y?: number;
}

interface ArcSample {
  s: number; // Normalized arc length [0..1]
  x: number;
  y: number;
  angleDeg: number;
}

interface ConnectorGeometry {
  d: string;
  totalLength: number;
  samples: ArcSample[];
}

function evalCubicBezierPoint(
  p0: ConnectorPoint,
  p1: ConnectorPoint,
  p2: ConnectorPoint,
  p3: ConnectorPoint,
  t: number
): ConnectorPoint {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: u3 * p0.x + 3 * u2 * t * p1.x + 3 * u * t2 * p2.x + t3 * p3.x,
    y: u3 * p0.y + 3 * u2 * t * p1.y + 3 * u * t2 * p2.y + t3 * p3.y,
  };
}

function evalCubicBezierTangentAngleDeg(
  p0: ConnectorPoint,
  p1: ConnectorPoint,
  p2: ConnectorPoint,
  p3: ConnectorPoint,
  t: number
): number {
  const u = 1 - t;
  const dx =
    3 * u * u * (p1.x - p0.x) +
    6 * u * t * (p2.x - p1.x) +
    3 * t * t * (p3.x - p2.x);
  const dy =
    3 * u * u * (p1.y - p0.y) +
    6 * u * t * (p2.y - p1.y) +
    3 * t * t * (p3.y - p2.y);
  if (Math.abs(dx) < 1e-5 && Math.abs(dy) < 1e-5) {
    return (Math.atan2(p3.y - p0.y, p3.x - p0.x) * 180) / Math.PI;
  }
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Membangun Lookup Table (LUT) 64-segmen berbasis panjang busur (arc-length)
 * untuk kurva Cubic Bezier agar posisi ujung panah terkunci 0px drift terhadap `pathLength="1"`.
 */
function buildBezierArcLengthGeometry(
  p0: ConnectorPoint,
  p1: ConnectorPoint,
  p2: ConnectorPoint,
  p3: ConnectorPoint,
  steps = 64
): ConnectorGeometry {
  const rawPoints: Array<{
    t: number;
    arcLen: number;
    x: number;
    y: number;
    angleDeg: number;
  }> = [];

  let cumulativeLen = 0;
  let prevPt = p0;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pt = evalCubicBezierPoint(p0, p1, p2, p3, t);
    if (i > 0) {
      cumulativeLen += Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
    }
    const angleDeg = evalCubicBezierTangentAngleDeg(p0, p1, p2, p3, t);
    rawPoints.push({
      t,
      arcLen: cumulativeLen,
      x: pt.x,
      y: pt.y,
      angleDeg,
    });
    prevPt = pt;
  }

  const totalLength = Math.max(1, cumulativeLen);
  const samples: ArcSample[] = rawPoints.map((item, idx) => ({
    s: cumulativeLen > 0 ? item.arcLen / totalLength : idx / steps,
    x: item.x,
    y: item.y,
    angleDeg: item.angleDeg,
  }));

  const d = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} C ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}, ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`;
  return { d, totalLength, samples };
}

/**
 * Membangun geometri konektor ortogonal 90 derajat ("elbow") dengan sudut fillet Quadratic Bezier.
 */
function buildElbowGeometry(
  p0: ConnectorPoint,
  p1: ConnectorPoint,
  elbowAxis: "horizontal-first" | "vertical-first",
  elbowRatio: number,
  cornerRadius: number
): ConnectorGeometry {
  const ratio = Math.max(0.1, Math.min(0.9, elbowRatio));
  const w0 = p0;
  const w3 = p1;
  const w1: ConnectorPoint =
    elbowAxis === "horizontal-first"
      ? { x: p0.x + (p1.x - p0.x) * ratio, y: p0.y }
      : { x: p0.x, y: p0.y + (p1.y - p0.y) * ratio };
  const w2: ConnectorPoint =
    elbowAxis === "horizontal-first"
      ? { x: w1.x, y: p1.y }
      : { x: p1.x, y: w1.y };

  const seg01Len = Math.hypot(w1.x - w0.x, w1.y - w0.y);
  const seg12Len = Math.hypot(w2.x - w1.x, w2.y - w1.y);
  const seg23Len = Math.hypot(w3.x - w2.x, w3.y - w2.y);

  const r1 = Math.max(
    0,
    Math.min(cornerRadius, seg01Len * 0.45, seg12Len * 0.45)
  );
  const r2 = Math.max(
    0,
    Math.min(cornerRadius, seg12Len * 0.45, seg23Len * 0.45)
  );

  const dir01 =
    seg01Len > 1e-4
      ? { x: (w1.x - w0.x) / seg01Len, y: (w1.y - w0.y) / seg01Len }
      : { x: 1, y: 0 };
  const dir12 =
    seg12Len > 1e-4
      ? { x: (w2.x - w1.x) / seg12Len, y: (w2.y - w1.y) / seg12Len }
      : dir01;
  const dir23 =
    seg23Len > 1e-4
      ? { x: (w3.x - w2.x) / seg23Len, y: (w3.y - w2.y) / seg23Len }
      : dir12;

  const c1In: ConnectorPoint = {
    x: w1.x - dir01.x * r1,
    y: w1.y - dir01.y * r1,
  };
  const c1Out: ConnectorPoint = {
    x: w1.x + dir12.x * r1,
    y: w1.y + dir12.y * r1,
  };
  const c2In: ConnectorPoint = {
    x: w2.x - dir12.x * r2,
    y: w2.y - dir12.y * r2,
  };
  const c2Out: ConnectorPoint = {
    x: w2.x + dir23.x * r2,
    y: w2.y + dir23.y * r2,
  };

  const dParts = [`M ${w0.x.toFixed(2)} ${w0.y.toFixed(2)}`];
  if (r1 > 0.5) {
    dParts.push(`L ${c1In.x.toFixed(2)} ${c1In.y.toFixed(2)}`);
    dParts.push(
      `Q ${w1.x.toFixed(2)} ${w1.y.toFixed(2)} ${c1Out.x.toFixed(2)} ${c1Out.y.toFixed(2)}`
    );
  } else {
    dParts.push(`L ${w1.x.toFixed(2)} ${w1.y.toFixed(2)}`);
  }

  if (r2 > 0.5) {
    dParts.push(`L ${c2In.x.toFixed(2)} ${c2In.y.toFixed(2)}`);
    dParts.push(
      `Q ${w2.x.toFixed(2)} ${w2.y.toFixed(2)} ${c2Out.x.toFixed(2)} ${c2Out.y.toFixed(2)}`
    );
  } else {
    dParts.push(`L ${w2.x.toFixed(2)} ${w2.y.toFixed(2)}`);
  }
  dParts.push(`L ${w3.x.toFixed(2)} ${w3.y.toFixed(2)}`);

  // Bangun polyline sampel rapat untuk arc-length LUT
  const poly: Array<{ x: number; y: number; angleDeg: number }> = [];
  const pushLineSamples = (
    a: ConnectorPoint,
    b: ConnectorPoint,
    subSteps = 12
  ) => {
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    for (let i = 0; i <= subSteps; i++) {
      const t = i / subSteps;
      poly.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angleDeg: ang,
      });
    }
  };

  const pushQuadSamples = (
    a: ConnectorPoint,
    ctrl: ConnectorPoint,
    b: ConnectorPoint,
    subSteps = 12
  ) => {
    for (let i = 1; i <= subSteps; i++) {
      const t = i / subSteps;
      const u = 1 - t;
      const x = u * u * a.x + 2 * u * t * ctrl.x + t * t * b.x;
      const y = u * u * a.y + 2 * u * t * ctrl.y + t * t * b.y;
      const dx = 2 * u * (ctrl.x - a.x) + 2 * t * (b.x - ctrl.x);
      const dy = 2 * u * (ctrl.y - a.y) + 2 * t * (b.y - ctrl.y);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      poly.push({ x, y, angleDeg: ang });
    }
  };

  pushLineSamples(w0, r1 > 0.5 ? c1In : w1, 14);
  if (r1 > 0.5) {
    pushQuadSamples(c1In, w1, c1Out, 12);
  }
  pushLineSamples(r1 > 0.5 ? c1Out : w1, r2 > 0.5 ? c2In : w2, 14);
  if (r2 > 0.5) {
    pushQuadSamples(c2In, w2, c2Out, 12);
  }
  pushLineSamples(r2 > 0.5 ? c2Out : w2, w3, 14);

  let cumLen = 0;
  const withLen = poly.map((pt, idx) => {
    if (idx > 0) {
      cumLen += Math.hypot(pt.x - poly[idx - 1].x, pt.y - poly[idx - 1].y);
    }
    return { ...pt, arcLen: cumLen };
  });

  const totalLength = Math.max(1, cumLen);
  const samples: ArcSample[] = withLen.map((pt, idx) => ({
    s: cumLen > 0 ? pt.arcLen / totalLength : idx / Math.max(1, withLen.length - 1),
    x: pt.x,
    y: pt.y,
    angleDeg: pt.angleDeg,
  }));

  return {
    d: dParts.join(" "),
    totalLength,
    samples,
  };
}

/**
 * Interpolasi posisi (x, y) dan sudut tangen (angleDeg) berdasarkan fraksi panjang busur s in [0, 1].
 */
function sampleGeometryAtArcFraction(
  geometry: ConnectorGeometry,
  s: number
): { x: number; y: number; angleDeg: number } {
  const clampedS = Math.max(0, Math.min(1, s));
  const { samples } = geometry;
  if (samples.length === 0) {
    return { x: 540, y: 820, angleDeg: 0 };
  }
  if (clampedS <= 0) {
    return samples[0];
  }
  if (clampedS >= 1) {
    return samples[samples.length - 1];
  }

  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    if (clampedS >= a.s && clampedS <= b.s) {
      const span = Math.max(1e-6, b.s - a.s);
      const localT = (clampedS - a.s) / span;
      // Shortest-angle interpolation untuk menghindari lompatan -180 <-> +180
      let deltaAngle = ((b.angleDeg - a.angleDeg + 540) % 360) - 180;
      if (Number.isNaN(deltaAngle)) deltaAngle = 0;
      return {
        x: a.x + (b.x - a.x) * localT,
        y: a.y + (b.y - a.y) * localT,
        angleDeg: a.angleDeg + deltaAngle * localT,
      };
    }
  }

  return samples[samples.length - 1];
}

export const AnimatedConnectorLine: React.FC<AnimatedConnectorLineProps> = ({
  from,
  to,
  variant = "curved",
  curveOffset = -90,
  controlPoint1,
  controlPoint2,
  elbowAxis = "horizontal-first",
  elbowRatio = 0.5,
  cornerRadius = 24,
  dashPattern = "solid",
  headType = "arrow",
  nodeShape = "circle",
  showStartNode = true,
  showEndNode = true,
  showTrack = true,
  pulse = true,
  pulsePeriodFrames = 72,
  color,
  strokeWidth = 4,
  nodeRadius = 8,
  curve = "snapIn",
  drawDelayFrames = 6,
  drawDurationFrames = 26,
  labelStart,
  labelEnd,
  zIndex = 27,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const maskId = `connector-mask-${rawId}`;
  const glowId = `connector-glow-${rawId}`;

  const strokeColor = color || colors.accentHighlight;

  // Clamp titik awal & akhir ke dalam Safe Zone Reels (X: 80..920, Y: 140..1500) dengan margin radar pulse 28px
  const safeFrom = useMemo(
    () => clampToSafeZone(from.x, from.y, 28, 28),
    [from.x, from.y]
  );
  const safeTo = useMemo(
    () => clampToSafeZone(to.x, to.y, 28, 28),
    [to.x, to.y]
  );

  // Bangun geometri path + Arc-Length LUT 64-step
  const geometry = useMemo<ConnectorGeometry>(() => {
    if (variant === "straight") {
      const dx = safeTo.x - safeFrom.x;
      const dy = safeTo.y - safeFrom.y;
      const totalLength = Math.max(1, Math.hypot(dx, dy));
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      return {
        d: `M ${safeFrom.x.toFixed(2)} ${safeFrom.y.toFixed(2)} L ${safeTo.x.toFixed(2)} ${safeTo.y.toFixed(2)}`,
        totalLength,
        samples: [
          { s: 0, x: safeFrom.x, y: safeFrom.y, angleDeg },
          { s: 1, x: safeTo.x, y: safeTo.y, angleDeg },
        ],
      };
    }

    if (variant === "elbow") {
      return buildElbowGeometry(
        safeFrom,
        safeTo,
        elbowAxis,
        elbowRatio,
        cornerRadius
      );
    }

    // Default: "curved" (Cubic Bezier + Auto-Curvature Normal)
    const dx = safeTo.x - safeFrom.x;
    const dy = safeTo.y - safeFrom.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;

    const cp1 = controlPoint1
      ? clampToSafeZone(controlPoint1.x, controlPoint1.y, 20, 20)
      : clampToSafeZone(
          safeFrom.x + dx * 0.33 + curveOffset * nx,
          safeFrom.y + dy * 0.33 + curveOffset * ny,
          20,
          20
        );

    const cp2 = controlPoint2
      ? clampToSafeZone(controlPoint2.x, controlPoint2.y, 20, 20)
      : clampToSafeZone(
          safeFrom.x + dx * 0.67 + curveOffset * nx,
          safeFrom.y + dy * 0.67 + curveOffset * ny,
          20,
          20
        );

    return buildBezierArcLengthGeometry(safeFrom, cp1, cp2, safeTo, 64);
  }, [
    variant,
    safeFrom,
    safeTo,
    curveOffset,
    controlPoint1,
    controlPoint2,
    elbowAxis,
    elbowRatio,
    cornerRadius,
  ]);

  // 1. Evaluasi Waktu & Fisika Animasi (60fps deterministik)
  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  // Fase 1: Start Anchor Pop
  const startPop = spring({
    frame: relFrame,
    fps,
    config: SPRING_PRESETS.satSetSnap,
  });
  const startNodeScale = interpolate(startPop, [0, 1], [0, 1]);

  // Fase 2: Self-Drawing Progress mengikuti kurva MOTION_CURVES
  const drawProgress = evalCurve(
    relFrame,
    drawDelayFrames,
    drawDurationFrames,
    curve
  );

  // Fase 3: Tip Arrowhead & End Node Arrival Pop
  const arrivalFrameThreshold =
    drawDelayFrames + Math.round(drawDurationFrames * 0.88);
  const arrivalRelFrame = Math.max(0, relFrame - arrivalFrameThreshold);
  const hasArrived = relFrame >= arrivalFrameThreshold;

  const endPop = hasArrived
    ? spring({
        frame: arrivalRelFrame,
        fps,
        config: SPRING_PRESETS.elasticPop,
      })
    : 0;
  const endNodeScale = hasArrived ? Math.max(0, endPop) : 0;

  // Posisi ujung panah mengikuti ujung garis secara live (berhenti tepat di tepi luar node akhir)
  const maxTipFraction =
    showEndNode && geometry.totalLength > nodeRadius + 4
      ? Math.max(0, 1 - (nodeRadius + 2) / geometry.totalLength)
      : 1;
  const tipArcFraction = Math.min(drawProgress, maxTipFraction);
  const tip = sampleGeometryAtArcFraction(geometry, tipArcFraction);

  const arrowScale = interpolate(drawProgress, [0.02, 0.18], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fase 4: Pulsing Radar / Sonar Rings (2 cincin staggered 60fps)
  const pulseActive = pulse && hasArrived;
  const period = Math.max(24, pulsePeriodFrames);
  const coreBreathingScale = pulseActive
    ? 1 + Math.sin((arrivalRelFrame / 60) * Math.PI * 2) * 0.08
    : 1;

  // Pola stroke dasharray
  const dashArrayValue =
    dashPattern === "dashed"
      ? "12 10"
      : dashPattern === "dotted"
        ? "2 11"
        : undefined;

  // Koordinat pill label di dekat titik awal & akhir (dijaga agar tidak keluar Safe Zone)
  const startLabelPos = clampToSafeZone(
    safeFrom.x,
    safeFrom.y - nodeRadius - 26,
    90,
    20
  );
  const endLabelPos = clampToSafeZone(
    safeTo.x,
    safeTo.y + nodeRadius + 28,
    90,
    20
  );

  const renderAnchorNode = (
    pt: ConnectorPoint,
    scaleVal: number,
    breathingVal = 1
  ) => {
    const combinedScale = scaleVal * breathingVal;
    if (combinedScale <= 0.001) return null;

    if (nodeShape === "square_handle") {
      const half = nodeRadius + 1;
      return (
        <g
          transform={`translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) scale(${combinedScale.toFixed(4)})`}
        >
          <rect
            x={-half}
            y={-half}
            width={half * 2}
            height={half * 2}
            rx={3}
            fill={colors.textPrimary}
            stroke={strokeColor}
            strokeWidth={3}
          />
          <rect
            x={-half * 0.42}
            y={-half * 0.42}
            width={half * 0.84}
            height={half * 0.84}
            rx={1.5}
            fill={colors.surfaceCard}
          />
        </g>
      );
    }

    return (
      <g
        transform={`translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) scale(${combinedScale.toFixed(4)})`}
      >
        <circle
          cx={0}
          cy={0}
          r={nodeRadius}
          fill={colors.surfaceCard}
          stroke={strokeColor}
          strokeWidth={3}
        />
        <circle
          cx={0}
          cy={0}
          r={nodeRadius * 0.48}
          fill={strokeColor}
        />
      </g>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        pointerEvents: "none",
        zIndex,
      }}
    >
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
        }}
      >
        <defs>
          <filter
            id={glowId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="4" result="blur" />
          </filter>

          {/* Mask berbasis pathLength=1 agar pola dashed/dotted tidak ikut bergeser saat menggambar */}
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1080"
            height="1920"
          >
            {drawProgress > 0.001 && (
              <path
                d={geometry.d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={strokeWidth + 16}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={Math.max(0, 1 - drawProgress)}
              />
            )}
          </mask>
        </defs>

        {/* Layer 0: Optional Ghost Track Rail (ala Apple UI & Vox) */}
        {showTrack && (
          <path
            d={geometry.d}
            fill="none"
            stroke={colors.textSecondary}
            strokeOpacity={0.18 * startPop}
            strokeWidth={Math.max(2, strokeWidth - 1)}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashArrayValue}
          />
        )}

        {/* Layer 1: Shadow & Ambient Glow Under-Stroke */}
        {drawProgress > 0.001 && (
          <g mask={`url(#${maskId})`}>
            <path
              d={geometry.d}
              fill="none"
              stroke={colors.extrudeShadow}
              strokeOpacity={0.6}
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={dashArrayValue}
              transform="translate(0, 4)"
            />
            <path
              d={geometry.d}
              fill="none"
              stroke={strokeColor}
              strokeOpacity={0.28}
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
            />
          </g>
        )}

        {/* Layer 2: Active Self-Drawing Path */}
        {drawProgress > 0.001 && (
          <path
            d={geometry.d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashArrayValue}
            mask={`url(#${maskId})`}
          />
        )}

        {/* Layer 3: Pulsing Radar / Sonar Rings pada End Node */}
        {pulseActive &&
          [0, 1].map((ringIdx) => {
            const phaseProgress =
              ((arrivalRelFrame + ringIdx * (period / 2)) % period) / period;
            const pulseRadius = interpolate(
              phaseProgress,
              [0, 1],
              [nodeRadius, nodeRadius * 3.2],
              {
                easing: Easing.out(Easing.quad),
              }
            );
            const pulseOpacity = interpolate(
              phaseProgress,
              [0, 0.18, 1],
              [0, 0.72, 0]
            );
            return (
              <circle
                key={`pulse-ring-${ringIdx}`}
                cx={safeTo.x}
                cy={safeTo.y}
                r={pulseRadius}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2.5}
                strokeOpacity={pulseOpacity}
              />
            );
          })}

        {/* Layer 4: Anchor Nodes (Start & End) */}
        {showStartNode && renderAnchorNode(safeFrom, startNodeScale, 1)}
        {showEndNode &&
          renderAnchorNode(safeTo, endNodeScale, coreBreathingScale)}

        {/* Layer 5: Live Arrowhead Tip */}
        {headType !== "none" && drawProgress > 0.02 && (
          <g
            transform={`translate(${tip.x.toFixed(2)}, ${tip.y.toFixed(2)}) rotate(${tip.angleDeg.toFixed(2)}) scale(${arrowScale.toFixed(4)})`}
          >
            {headType === "arrow" && (
              <>
                <polygon
                  points="-17,-9 3,0 -17,9 -12,0"
                  fill={colors.extrudeShadow}
                  opacity={0.55}
                  transform="translate(0, 3)"
                />
                <polygon
                  points="-16,-8 2,0 -16,8 -11,0"
                  fill={strokeColor}
                />
              </>
            )}
            {headType === "chevron" && (
              <path
                d="M -13 -8 L 0 0 L -13 8"
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {headType === "dot" && (
              <circle
                cx={0}
                cy={0}
                r={strokeWidth * 1.35}
                fill={strokeColor}
              />
            )}
          </g>
        )}
      </svg>

      {/* Layer 6: Endpoint Label Badges (Monospace Telemetry Pills) */}
      {labelStart && startNodeScale > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: startLabelPos.x,
            top: startLabelPos.y,
            transform: `translate(-50%, -50%) scale(${startNodeScale.toFixed(4)})`,
            backgroundColor: colors.surfaceCard,
            border: `1.5px solid ${strokeColor}`,
            borderRadius: 8,
            padding: "4px 12px",
            fontFamily: typography.monoFont,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: colors.textPrimary,
            boxShadow: `0 6px 16px ${colors.extrudeShadow}`,
            whiteSpace: "nowrap",
          }}
        >
          {labelStart}
        </div>
      )}

      {labelEnd && endNodeScale > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: endLabelPos.x,
            top: endLabelPos.y,
            transform: `translate(-50%, -50%) scale(${endNodeScale.toFixed(4)})`,
            backgroundColor: colors.surfaceCard,
            border: `1.5px solid ${strokeColor}`,
            borderRadius: 8,
            padding: "4px 12px",
            fontFamily: typography.monoFont,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: strokeColor,
            boxShadow: `0 6px 16px ${colors.extrudeShadow}`,
            whiteSpace: "nowrap",
          }}
        >
          {labelEnd}
        </div>
      )}
    </div>
  );
};
