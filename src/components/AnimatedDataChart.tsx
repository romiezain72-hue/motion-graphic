/**
 * MOD-03: Editorial Data-Viz: Animated Bar & Trend Line Chart (`src/components/AnimatedDataChart.tsx`)
 *
 * Komponen grafik perbandingan data & garis tren 1080x1920 @ 60fps dengan:
 * - Zero-Origin Rule & Nice Tick Intervals (1-2-5 step scale) ala Vox Editorial Data-Viz
 * - Top-Only Rounded SVG Path pada vertical bar & Right-Only Rounded SVG Path pada horizontal bar (alas rata presisi di baseline 0)
 * - Monotone Cubic Hermite Spline (Fritsch-Carlson) untuk kurva tren halus bebas osilasi palsu (zero overshoot ripple)
 * - Arc-Length LUT Node Sync + Universal `<mask pathLength="1">` self-drawing trend line (0px node desync)
 * - Angka count-up deterministik ber-`fontVariantNumeric: "tabular-nums"`
 * - 4-Phase Sat-Set Choreography + Beat Spotlight (non-hero dimming, hero glow, radar pulse, & Delta Callout Pill)
 * - 3 Frame Styles (`editorial`, `blueprint`, `terminal`) terhubung penuh ke `themeConfig` (`src/projectLoader.ts`)
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
  evalSpringPreset,
  SPRING_PRESETS,
  type MotionCurveName,
} from "../motionCurves";
import { themeConfig } from "../projectLoader";

export interface DataChartItem {
  label: string;
  value: number;
  lineValue?: number; // dipakai jika variant === "combo" (dual-metric)
  color?: string; // override opsional per-bar
  badgeText?: string; // misal "+142%" atau "PEAK"
}

export interface AnimatedDataChartProps {
  title?: string;
  subtitle?: string;
  sourceLabel?: string;
  variant?: "bar" | "line" | "combo" | "horizontal_bar";
  data: DataChartItem[];
  highlightIndex?: number; // index bar/node hero ala Vox (-1 = semua aktif, undefined = auto max)
  unitPrefix?: string; // misal "$", "Rp "
  unitSuffix?: string; // misal "%", " jt", " ms"
  decimals?: number; // default 0
  domainMin?: number; // default 0 (Vox zero-baseline)
  domainMax?: number; // opsional override; default auto niceCeil(max * 1.15)
  targetLineValue?: number; // garis threshold horizontal opsional
  targetLineLabel?: string;
  showTrendLine?: boolean; // default true untuk "line" & "combo"
  showAreaFill?: boolean; // default true untuk "line"
  trendLineDashed?: boolean; // default false
  barMotionMode?: "bezier" | "spring"; // default "bezier" (MOTION_CURVES.snapIn)
  curve?: MotionCurveName; // default "snapIn"
  staggerFrames?: number; // default 4 (@ 60fps)
  drawDurationFrames?: number; // default 28
  spotlightAtRelativeFrame?: number; // default 64 (dim non-hero + pop badge)
  highlightPulse?: boolean; // default true
  frameStyle?: "editorial" | "blueprint" | "terminal";
  width?: number; // default 820 (di-clamp ke max 840)
  height?: number; // default 660
  x?: number; // default 500 (center [80..920])
  y?: number; // default 810
  zIndex?: number; // default 25
  enterAtRelativeFrame?: number; // default 0
}

interface ChartPoint {
  x: number;
  y: number;
}

interface SplineNodeSample {
  x: number;
  y: number;
  value: number;
  label: string;
  badgeText?: string;
  s: number; // Normalized cumulative arc-length fraction [0..1]
}

interface MonotoneSplineGeometry {
  lineD: string;
  areaD: string;
  totalLength: number;
  nodes: SplineNodeSample[];
  startX: number;
  endX: number;
}

const DEFAULT_FALLBACK_DATA: DataChartItem[] = [
  { label: "Q1", value: 120, lineValue: 115 },
  { label: "Q2", value: 185, lineValue: 170 },
  { label: "Q3", value: 240, lineValue: 230 },
  { label: "Q4", value: 420, lineValue: 410, badgeText: "PEAK +127%" },
];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Evaluasi titik pada segmen Cubic Bezier B(t), t in [0, 1].
 */
function evalCubicPoint(
  p0: ChartPoint,
  p1: ChartPoint,
  p2: ChartPoint,
  p3: ChartPoint,
  t: number
): ChartPoint {
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

/**
 * Menghitung skala domain dan "Nice Tick Intervals" dengan aturan 1-2-5 (Zero-Origin Rule ala Vox).
 */
function computeNiceDomainAndTicks(
  values: number[],
  domainMinOverride?: number,
  domainMaxOverride?: number,
  tickIntervals = 4
): { min: number; max: number; step: number; ticks: number[] } {
  const minVal = domainMinOverride !== undefined ? domainMinOverride : 0;
  const rawMax = Math.max(...values, minVal + 1);
  const rawSpan = Math.max(1e-6, (rawMax - minVal) * 1.15);
  const roughStep = rawSpan / Math.max(2, tickIntervals);
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const frac = roughStep / mag;

  const niceFactor = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  const step = mag * niceFactor;

  const maxVal =
    domainMaxOverride !== undefined
      ? Math.max(minVal + step, domainMaxOverride)
      : minVal + Math.ceil(((rawMax - minVal) * 1.12) / step) * step;

  const ticks: number[] = [];
  const maxSteps = Math.min(7, Math.round((maxVal - minVal) / step));
  for (let i = 0; i <= maxSteps; i++) {
    const tVal = Number((minVal + i * step).toFixed(6));
    if (tVal <= maxVal + step * 0.05) {
      ticks.push(tVal);
    }
  }
  if (ticks.length < 2) {
    ticks.push(maxVal);
  }

  return { min: minVal, max: maxVal, step, ticks };
}

/**
 * Membangun SVG `<path>` untuk Vertical Bar dengan sudut membulat HANYA di puncak (top-only rounded corners),
 * sehingga alas bar rata sempurna menempel pada garis baseline (y + h).
 */
function buildTopRoundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  maxRadius = 10
): string {
  if (w <= 0.5 || h <= 0.5) return "";
  const r = Math.max(0, Math.min(maxRadius, w / 2, h / 2));
  const x0 = x.toFixed(2);
  const x1 = (x + w).toFixed(2);
  const yTop = y.toFixed(2);
  const yBase = (y + h).toFixed(2);
  const xLeftR = (x + r).toFixed(2);
  const xRightR = (x + w - r).toFixed(2);
  const yTopR = (y + r).toFixed(2);

  return (
    `M ${x0} ${yBase} ` +
    `L ${x0} ${yTopR} ` +
    `Q ${x0} ${yTop} ${xLeftR} ${yTop} ` +
    `L ${xRightR} ${yTop} ` +
    `Q ${x1} ${yTop} ${x1} ${yTopR} ` +
    `L ${x1} ${yBase} Z`
  );
}

/**
 * Membangun SVG `<path>` untuk Horizontal Bar dengan sudut membulat HANYA di ujung kanan (right-only rounded corners),
 * sehingga pangkal kiri bar menempel rata pada sumbu X awal.
 */
function buildRightRoundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  maxRadius = 10
): string {
  if (w <= 0.5 || h <= 0.5) return "";
  const r = Math.max(0, Math.min(maxRadius, w / 2, h / 2));
  const x0 = x.toFixed(2);
  const x1 = (x + w).toFixed(2);
  const xRightR = (x + w - r).toFixed(2);
  const y0 = y.toFixed(2);
  const y1 = (y + h).toFixed(2);
  const yTopR = (y + r).toFixed(2);
  const yBotR = (y + h - r).toFixed(2);

  return (
    `M ${x0} ${y0} ` +
    `L ${xRightR} ${y0} ` +
    `Q ${x1} ${y0} ${x1} ${yTopR} ` +
    `L ${x1} ${yBotR} ` +
    `Q ${x1} ${y1} ${xRightR} ${y1} ` +
    `L ${x0} ${y1} Z`
  );
}

/**
 * Membangun kurva Monotone Cubic Hermite Spline (Fritsch-Carlson) beserta Lookup Table (LUT)
 * panjang busur kumulatif per titik data agar tidak terjadi overshoot palsu di antara data
 * dan setiap node mekar presisi (0px desync) saat dilewati ujung garis.
 */
function buildMonotoneCubicSpline(
  rawNodes: Array<{
    x: number;
    y: number;
    value: number;
    label: string;
    badgeText?: string;
  }>,
  baseY: number,
  subStepsPerSegment = 16
): MonotoneSplineGeometry {
  const n = rawNodes.length;
  if (n === 0) {
    return {
      lineD: "",
      areaD: "",
      totalLength: 0,
      nodes: [],
      startX: 0,
      endX: 0,
    };
  }

  if (n === 1) {
    const p = rawNodes[0];
    const lineD = `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    return {
      lineD,
      areaD: "",
      totalLength: 1,
      nodes: [{ ...p, s: 0 }],
      startX: p.x,
      endX: p.x,
    };
  }

  // 1. Hitung kemiringan sekant antar-titik (delta_k)
  const dx: number[] = [];
  const delta: number[] = [];
  for (let k = 0; k < n - 1; k++) {
    const spanX = Math.max(1e-4, rawNodes[k + 1].x - rawNodes[k].x);
    dx.push(spanX);
    delta.push((rawNodes[k + 1].y - rawNodes[k].y) / spanX);
  }

  // 2. Inisialisasi tangen awal m_k
  const m: number[] = new Array(n).fill(0);
  m[0] = delta[0];
  m[n - 1] = delta[n - 2];
  for (let k = 1; k < n - 1; k++) {
    if (delta[k - 1] * delta[k] <= 0) {
      m[k] = 0;
    } else {
      m[k] = (delta[k - 1] + delta[k]) / 2;
    }
  }

  // 3. Klamping monotonisitas Fritsch-Carlson (alpha^2 + beta^2 <= 9)
  for (let k = 0; k < n - 1; k++) {
    const dk = delta[k];
    if (Math.abs(dk) < 1e-6) {
      m[k] = 0;
      m[k + 1] = 0;
    } else {
      const alpha = m[k] / dk;
      const beta = m[k + 1] / dk;
      const hyp2 = alpha * alpha + beta * beta;
      if (hyp2 > 9) {
        const tau = 3 / Math.sqrt(hyp2);
        m[k] = tau * alpha * dk;
        m[k + 1] = tau * beta * dk;
      }
    }
  }

  // 4. Konversi ke segmen Cubic Bezier & hitung panjang busur kumulatif per node
  const dParts: string[] = [
    `M ${rawNodes[0].x.toFixed(2)} ${rawNodes[0].y.toFixed(2)}`,
  ];
  const nodeArcLengths: number[] = [0];
  let cumulativeArcLen = 0;

  for (let k = 0; k < n - 1; k++) {
    const p0 = { x: rawNodes[k].x, y: rawNodes[k].y };
    const p3 = { x: rawNodes[k + 1].x, y: rawNodes[k + 1].y };
    const segDx = dx[k];

    const cp1: ChartPoint = {
      x: p0.x + segDx / 3,
      y: p0.y + (m[k] * segDx) / 3,
    };
    const cp2: ChartPoint = {
      x: p3.x - segDx / 3,
      y: p3.y - (m[k + 1] * segDx) / 3,
    };

    dParts.push(
      `C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`
    );

    let prevPt = p0;
    for (let s = 1; s <= subStepsPerSegment; s++) {
      const t = s / subStepsPerSegment;
      const pt = evalCubicPoint(p0, cp1, cp2, p3, t);
      cumulativeArcLen += Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
      prevPt = pt;
    }
    nodeArcLengths.push(cumulativeArcLen);
  }

  const totalLength = Math.max(1, cumulativeArcLen);
  const nodes: SplineNodeSample[] = rawNodes.map((node, idx) => ({
    ...node,
    s:
      cumulativeArcLen > 0
        ? nodeArcLengths[idx] / totalLength
        : idx / Math.max(1, n - 1),
  }));

  const lineD = dParts.join(" ");
  const firstNode = rawNodes[0];
  const lastNode = rawNodes[n - 1];
  const areaD =
    `${lineD} ` +
    `L ${lastNode.x.toFixed(2)} ${baseY.toFixed(2)} ` +
    `L ${firstNode.x.toFixed(2)} ${baseY.toFixed(2)} Z`;

  return {
    lineD,
    areaD,
    totalLength,
    nodes,
    startX: firstNode.x,
    endX: lastNode.x,
  };
}

/**
 * Format angka count-up deterministik dengan pemisah ribuan Indonesia.
 */
function formatChartValue(
  value: number,
  decimals: number,
  unitPrefix: string,
  unitSuffix: string
): string {
  const safeDecimals = clamp(Math.round(decimals), 0, 4);
  const rounded = Number(value.toFixed(safeDecimals));
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: safeDecimals,
    maximumFractionDigits: safeDecimals,
  }).format(rounded);
  return `${unitPrefix}${formatted}${unitSuffix}`;
}

export const AnimatedDataChart: React.FC<AnimatedDataChartProps> = ({
  title = "PERBANDINGAN METRIK & KURVA TREN",
  subtitle,
  sourceLabel,
  variant = "bar",
  data,
  highlightIndex,
  unitPrefix = "",
  unitSuffix = "",
  decimals = 0,
  domainMin = 0,
  domainMax,
  targetLineValue,
  targetLineLabel,
  showTrendLine,
  showAreaFill,
  trendLineDashed = false,
  barMotionMode = "bezier",
  curve = "snapIn",
  staggerFrames = 4,
  drawDurationFrames = 28,
  spotlightAtRelativeFrame = 64,
  highlightPulse = true,
  frameStyle = "editorial",
  width = 820,
  height = 660,
  x = 500,
  y = 810,
  zIndex = 25,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const neutralBarGradId = `chart-bar-neutral-${rawId}`;
  const heroBarGradId = `chart-bar-hero-${rawId}`;
  const areaGradId = `chart-area-grad-${rawId}`;
  const trendMaskId = `chart-trend-mask-${rawId}`;
  const areaClipId = `chart-area-clip-${rawId}`;
  const glowFilterId = `chart-glow-${rawId}`;

  const items = useMemo<DataChartItem[]>(
    () => (Array.isArray(data) && data.length > 0 ? data : DEFAULT_FALLBACK_DATA),
    [data]
  );

  // 1. Safe Zone Guard (X: 80..920 -> max width 840px; Y: 140..1500)
  const safeWidth = clamp(width, 380, 840);
  const safeHeight = clamp(height, 340, 1120);
  const safeCenter = useMemo(
    () => clampToSafeZone(x, y, safeWidth / 2, safeHeight / 2),
    [x, y, safeWidth, safeHeight]
  );

  // 2. Penentuan Hero Bar / Node Index (Vox Selective Color Principle)
  const resolvedHighlightIndex = useMemo(() => {
    if (highlightIndex !== undefined) {
      return highlightIndex;
    }
    let bestIdx = 0;
    let bestVal = -Infinity;
    items.forEach((item, idx) => {
      const candidate =
        variant === "line" && item.lineValue !== undefined
          ? item.lineValue
          : item.value;
      if (candidate > bestVal) {
        bestVal = candidate;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, [highlightIndex, items, variant]);

  // Rata-rata untuk auto badge delta bila badgeText tidak diisi manual
  const averageValue = useMemo(() => {
    if (items.length === 0) return 1;
    const sum = items.reduce(
      (acc, it) =>
        acc +
        (variant === "line" && it.lineValue !== undefined
          ? it.lineValue
          : it.value),
      0
    );
    return sum / items.length;
  }, [items, variant]);

  // 3. Domain & Nice Tick Scale (Zero-Origin Rule)
  const domain = useMemo(() => {
    const collected: number[] = [];
    items.forEach((it) => {
      collected.push(it.value);
      if (it.lineValue !== undefined) {
        collected.push(it.lineValue);
      }
    });
    if (targetLineValue !== undefined) {
      collected.push(targetLineValue);
    }
    return computeNiceDomainAndTicks(collected, domainMin, domainMax, 4);
  }, [items, domainMin, domainMax, targetLineValue]);

  // 4. Inner Plot Geometry di dalam SVG (viewBox="0 0 safeWidth safeHeight")
  const hasHeader = Boolean(title || subtitle || frameStyle === "terminal");
  const isHorizontal = variant === "horizontal_bar";
  const shouldRenderBars =
    variant === "bar" || variant === "combo" || variant === "horizontal_bar";
  const shouldRenderLine =
    !isHorizontal &&
    (showTrendLine !== undefined
      ? showTrendLine
      : variant === "line" || variant === "combo");
  const shouldRenderArea =
    shouldRenderLine &&
    (showAreaFill !== undefined ? showAreaFill : variant === "line");

  const pad = useMemo(() => {
    const top = hasHeader ? (subtitle ? 132 : 112) : 64;
    const bottom = sourceLabel ? 84 : 68;
    const left = isHorizontal ? 152 : 90;
    const right = isHorizontal ? 96 : 38;
    return { top, right, bottom, left };
  }, [hasHeader, subtitle, sourceLabel, isHorizontal]);

  const plotX = pad.left;
  const plotY = pad.top;
  const plotW = Math.max(120, safeWidth - pad.left - pad.right);
  const plotH = Math.max(120, safeHeight - pad.top - pad.bottom);
  const baseY = plotY + plotH;

  const valToY = (v: number): number => {
    const ratio = clamp(
      (v - domain.min) / Math.max(1e-6, domain.max - domain.min),
      0,
      1
    );
    return baseY - ratio * plotH;
  };

  const valToX = (v: number): number => {
    const ratio = clamp(
      (v - domain.min) / Math.max(1e-6, domain.max - domain.min),
      0,
      1
    );
    return plotX + ratio * plotW;
  };

  // 5. Evaluasi Waktu & Koreografi 4-Fase @ 60fps
  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  // Fase 1: Card Container Pop & Gridline Sweep (0..14f)
  const containerPop = spring({
    frame: relFrame,
    fps,
    config: SPRING_PRESETS.satSetSnap,
  });
  const cardScale = interpolate(containerPop, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(containerPop, [0, 0.35, 1], [0, 1, 1]);
  const gridSweepProgress = evalCurve(relFrame, 2, 14, "snapIn");

  // Fase 2 & 3: Timing Bar Growth & Trend Line Self-Drawing
  const barsDelayFrames = 8;
  const barAnimDuration = Math.max(14, Math.min(26, drawDurationFrames - 4));
  const lineDelayFrames = variant === "line" ? 10 : 14;
  const lineDrawProgress = shouldRenderLine
    ? evalCurve(relFrame, lineDelayFrames, drawDurationFrames, curve)
    : 0;

  // Fase 4: Beat Spotlight & Delta Callout Pill (default f=64)
  const spotlightProgress =
    resolvedHighlightIndex >= 0
      ? evalCurve(relFrame, spotlightAtRelativeFrame, 18, "smoothDeceleration")
      : 0;

  const spotlightRelFrame = Math.max(0, relFrame - spotlightAtRelativeFrame);
  const heroBadgePop =
    resolvedHighlightIndex >= 0 && relFrame >= spotlightAtRelativeFrame
      ? spring({
          frame: spotlightRelFrame,
          fps,
          config: SPRING_PRESETS.elasticPop,
        })
      : 0;

  // 6. Monotone Cubic Spline Geometry untuk Trend Line
  const splineGeometry = useMemo<MonotoneSplineGeometry>(() => {
    if (!shouldRenderLine) {
      return {
        lineD: "",
        areaD: "",
        totalLength: 0,
        nodes: [],
        startX: plotX,
        endX: plotX + plotW,
      };
    }
    const slotW = plotW / Math.max(1, items.length);
    const rawNodes = items.map((item, idx) => {
      const metricVal =
        item.lineValue !== undefined ? item.lineValue : item.value;
      const cx = plotX + (idx + 0.5) * slotW;
      const cy = baseY - clamp((metricVal - domain.min) / Math.max(1e-6, domain.max - domain.min), 0, 1) * plotH;
      return {
        x: cx,
        y: cy,
        value: metricVal,
        label: item.label,
        badgeText: item.badgeText,
      };
    });
    return buildMonotoneCubicSpline(rawNodes, baseY, 16);
  }, [shouldRenderLine, items, plotX, plotW, plotH, baseY, domain.min, domain.max]);

  // 7. Token Warna Semantik dari `themeConfig`
  const heroColor = colors.accentHighlight || "#FACC15";
  const trendColor = colors.accentSecondary || colors.accentHighlight || "#38BDF8";
  const neutralBarColor = colors.surfaceAccent || "#3B82F6";
  const badgeBgColor = colors.accentBadge || heroColor;
  const badgeTextColor = colors.accentBadgeText || "#0F172A";

  // Border & Surface berdasarkan frameStyle
  const cardBorder =
    frameStyle === "blueprint"
      ? `2.5px solid ${colors.textPrimary}`
      : frameStyle === "terminal"
        ? `2px solid ${trendColor}`
        : `1.5px solid rgba(255, 255, 255, 0.18)`;

  const cardBorderRadius = frameStyle === "blueprint" ? 6 : 24;

  // 8. Corner Handles untuk `frameStyle === "blueprint"` (ala @getalgopicks Ref #3)
  const blueprintHandles = [
    { left: "0%", top: "0%" },
    { left: "50%", top: "0%" },
    { left: "100%", top: "0%" },
    { left: "0%", top: "100%" },
    { left: "50%", top: "100%" },
    { left: "100%", top: "100%" },
  ];

  // Auto-resolve teks Callout Badge untuk Hero Item
  const getHeroBadgeLabel = (item: DataChartItem): string => {
    if (item.badgeText) return item.badgeText;
    const primaryVal =
      variant === "line" && item.lineValue !== undefined
        ? item.lineValue
        : item.value;
    if (averageValue > 0.001 && items.length > 1) {
      const pctDelta = Math.round(((primaryVal - averageValue) / averageValue) * 100);
      if (pctDelta > 0) {
        return `PEAK +${pctDelta}% VS AVG`;
      }
    }
    return "HERO METRIC";
  };

  return (
    <div
      style={{
        position: "absolute",
        left: safeCenter.x,
        top: safeCenter.y,
        width: safeWidth,
        height: safeHeight,
        transform: `translate(-50%, -50%) scale(${cardScale.toFixed(4)})`,
        opacity: cardOpacity,
        pointerEvents: "none",
        zIndex,
      }}
    >
      {/* Top-Left Blueprint Dimension Tag (jika frameStyle === "blueprint") */}
      {frameStyle === "blueprint" && (
        <div
          style={{
            position: "absolute",
            top: -32,
            left: 0,
            backgroundColor: colors.textPrimary,
            color: colors.bgPrimary,
            fontFamily: typography.monoFont,
            fontSize: 14,
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: "6px 6px 0 0",
            letterSpacing: "0.08em",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          DATA_VIZ // {safeWidth}×{safeHeight}PX // 60FPS
        </div>
      )}

      {/* Layer 0: HTML Card Backdrop & Editorial / Terminal Header */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: colors.surfaceCard,
          opacity: 0.92,
          borderRadius: cardBorderRadius,
          border: cardBorder,
          boxShadow: `0 22px 54px ${colors.extrudeShadow}, inset 0 0 32px rgba(255, 255, 255, 0.04)`,
          overflow: "hidden",
        }}
      >
        {/* Top Accent Strip pada mode Editorial */}
        {frameStyle === "editorial" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: `linear-gradient(90deg, ${heroColor} 0%, ${trendColor} 100%)`,
              transformOrigin: "left center",
              transform: `scaleX(${gridSweepProgress.toFixed(4)})`,
            }}
          />
        )}

        {/* Terminal Window Bar pada mode Terminal */}
        {frameStyle === "terminal" && (
          <div
            style={{
              height: 36,
              backgroundColor: "rgba(9, 13, 24, 0.9)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  backgroundColor: "#EF4444",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  backgroundColor: "#FACC15",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  display: "inline-block",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: typography.monoFont,
                fontSize: 13,
                fontWeight: 700,
                color: colors.textSecondary,
                letterSpacing: "0.08em",
              }}
            >
              TELEMETRY_CHART.TSX // {variant.toUpperCase()}
            </div>
          </div>
        )}

        {/* Title & Subtitle Block */}
        {(title || subtitle) && (
          <div
            style={{
              padding:
                frameStyle === "terminal"
                  ? "12px 28px 0 28px"
                  : "22px 28px 0 28px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              {title && (
                <div
                  style={{
                    fontFamily: typography.displayFont,
                    fontSize: 28,
                    fontWeight: 800,
                    color: colors.textPrimary,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                  }}
                >
                  {title}
                </div>
              )}
              {subtitle && (
                <div
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: 15,
                    fontWeight: 600,
                    color: colors.textSecondary,
                    opacity: 0.82,
                    marginTop: 4,
                    letterSpacing: "0.03em",
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>

            {/* Live Legend Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 999,
                padding: "5px 14px",
                fontFamily: typography.monoFont,
                fontSize: 13,
                fontWeight: 700,
                color: heroColor,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: heroColor,
                  boxShadow: `0 0 8px ${heroColor}`,
                }}
              />
              ZERO-ORIGIN // 60FPS
            </div>
          </div>
        )}

        {/* Layer 6: Footer Source Note */}
        {sourceLabel && (
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 12,
              fontFamily: typography.monoFont,
              fontSize: 13,
              fontWeight: 600,
              color: colors.textSecondary,
              opacity: 0.68,
              letterSpacing: "0.04em",
            }}
          >
            SRC: {sourceLabel}
          </div>
        )}
      </div>

      {/* Main SVG Data-Viz Layer */}
      <svg
        width={safeWidth}
        height={safeHeight}
        viewBox={`0 0 ${safeWidth} ${safeHeight}`}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
        }}
      >
        <defs>
          {/* Vertical / Horizontal Neutral Bar Gradient */}
          <linearGradient
            id={neutralBarGradId}
            x1="0%"
            y1="0%"
            x2={isHorizontal ? "100%" : "0%"}
            y2={isHorizontal ? "0%" : "100%"}
          >
            <stop offset="0%" stopColor={neutralBarColor} stopOpacity="0.92" />
            <stop offset="100%" stopColor={neutralBarColor} stopOpacity="0.48" />
          </linearGradient>

          {/* Hero Bar Gradient (Vox Selective Accent) */}
          <linearGradient
            id={heroBarGradId}
            x1="0%"
            y1="0%"
            x2={isHorizontal ? "100%" : "0%"}
            y2={isHorizontal ? "0%" : "100%"}
          >
            <stop offset="0%" stopColor={heroColor} stopOpacity="1" />
            <stop offset="100%" stopColor={heroColor} stopOpacity="0.76" />
          </linearGradient>

          {/* Area Fill Gradient under Trend Line (Kurzgesagt Organic Vector Polish) */}
          <linearGradient id={areaGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.42" />
            <stop offset="85%" stopColor={trendColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Soft Ambient Glow Filter */}
          <filter
            id={glowFilterId}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
          >
            <feGaussianBlur stdDeviation="5" result="blur" />
          </filter>

          {/* Universal `<mask pathLength="1">` untuk Self-Drawing Trend Line */}
          {shouldRenderLine && splineGeometry.lineD && (
            <mask
              id={trendMaskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={safeWidth}
              height={safeHeight}
            >
              {lineDrawProgress > 0.001 && (
                <path
                  d={splineGeometry.lineD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={24}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={Math.max(0, 1 - lineDrawProgress)}
                />
              )}
            </mask>
          )}

          {/* Progressive Horizontal ClipPath untuk Area Fill di bawah Trend Line */}
          {shouldRenderArea && (
            <clipPath id={areaClipId}>
              <rect
                x={splineGeometry.startX}
                y={0}
                width={Math.max(
                  0,
                  (splineGeometry.endX - splineGeometry.startX) *
                    lineDrawProgress
                )}
                height={safeHeight}
              />
            </clipPath>
          )}
        </defs>

        {/* Layer 1: Gridlines, Axis Ticks (tabular-nums), Zero-Baseline Rail, & Target Line */}
        {!isHorizontal ? (
          <g>
            {domain.ticks.map((tickVal, tIdx) => {
              const ty = valToY(tickVal);
              const isZero = Math.abs(tickVal - domain.min) < 1e-5;
              const currentX2 = plotX + plotW * gridSweepProgress;
              return (
                <g key={`y-tick-${tIdx}`}>
                  <line
                    x1={plotX}
                    y1={ty}
                    x2={currentX2}
                    y2={ty}
                    stroke={
                      isZero ? colors.textPrimary : colors.textSecondary
                    }
                    strokeOpacity={isZero ? 0.55 : 0.18}
                    strokeWidth={isZero ? 2.5 : 1.5}
                    strokeDasharray={isZero ? undefined : "4 6"}
                  />
                  <text
                    x={plotX - 14}
                    y={ty + 5}
                    textAnchor="end"
                    fill={colors.textSecondary}
                    fillOpacity={0.78 * gridSweepProgress}
                    fontFamily={typography.monoFont}
                    fontSize={15}
                    fontWeight={700}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatChartValue(tickVal, decimals, unitPrefix, unitSuffix)}
                  </text>
                </g>
              );
            })}

            {/* Optional Target / Threshold Line */}
            {targetLineValue !== undefined &&
              targetLineValue >= domain.min &&
              targetLineValue <= domain.max && (
                <g opacity={gridSweepProgress}>
                  <line
                    x1={plotX}
                    y1={valToY(targetLineValue)}
                    x2={plotX + plotW * gridSweepProgress}
                    y2={valToY(targetLineValue)}
                    stroke={heroColor}
                    strokeWidth={2}
                    strokeDasharray="8 6"
                    strokeOpacity={0.85}
                  />
                  <rect
                    x={plotX + plotW - 156}
                    y={valToY(targetLineValue) - 24}
                    width={156}
                    height={20}
                    rx={4}
                    fill={colors.surfaceCard}
                    stroke={heroColor}
                    strokeWidth={1.2}
                  />
                  <text
                    x={plotX + plotW - 78}
                    y={valToY(targetLineValue) - 10}
                    textAnchor="middle"
                    fill={heroColor}
                    fontFamily={typography.monoFont}
                    fontSize={12}
                    fontWeight={800}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {targetLineLabel ||
                      `TARGET ${formatChartValue(targetLineValue, decimals, unitPrefix, unitSuffix)}`}
                  </text>
                </g>
              )}
          </g>
        ) : (
          /* Gridlines Vertikal untuk mode Horizontal Bar */
          <g>
            {domain.ticks.map((tickVal, tIdx) => {
              const tx = valToX(tickVal);
              const isZero = Math.abs(tickVal - domain.min) < 1e-5;
              const currentY2 = plotY + plotH * gridSweepProgress;
              return (
                <g key={`x-tick-${tIdx}`}>
                  <line
                    x1={tx}
                    y1={plotY}
                    x2={tx}
                    y2={currentY2}
                    stroke={
                      isZero ? colors.textPrimary : colors.textSecondary
                    }
                    strokeOpacity={isZero ? 0.55 : 0.18}
                    strokeWidth={isZero ? 2.5 : 1.5}
                    strokeDasharray={isZero ? undefined : "4 6"}
                  />
                  <text
                    x={tx}
                    y={baseY + 26}
                    textAnchor="middle"
                    fill={colors.textSecondary}
                    fillOpacity={0.78 * gridSweepProgress}
                    fontFamily={typography.monoFont}
                    fontSize={14}
                    fontWeight={700}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatChartValue(tickVal, decimals, unitPrefix, unitSuffix)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Layer 2: Clipped Gradient Area Fill di bawah Trend Line */}
        {shouldRenderArea && splineGeometry.areaD && (
          <path
            d={splineGeometry.areaD}
            fill={`url(#${areaGradId})`}
            clipPath={`url(#${areaClipId})`}
          />
        )}

        {/* Layer 3: Bars (Vertical atau Horizontal) + Direct Value Count-Up Labels */}
        {shouldRenderBars &&
          !isHorizontal &&
          items.map((item, idx) => {
            const slotW = plotW / Math.max(1, items.length);
            const barW = Math.min(92, slotW * 0.58);
            const cx = plotX + (idx + 0.5) * slotW;
            const barX = cx - barW / 2;

            const targetY = valToY(item.value);
            const targetH = Math.max(0, baseY - targetY);

            const startF = barsDelayFrames + idx * staggerFrames;
            const rawProgress =
              barMotionMode === "spring"
                ? evalSpringPreset(relFrame, fps, "satSetSnap", {
                    delay: startF,
                  })
                : evalCurve(relFrame, startF, barAnimDuration, curve);

            const pBar = clamp(rawProgress, 0, 1.08);
            const currentH = targetH * pBar;
            const currentY = baseY - currentH;

            const isHero =
              resolvedHighlightIndex >= 0 && idx === resolvedHighlightIndex;
            const barOpacity =
              resolvedHighlightIndex >= 0 && !isHero
                ? interpolate(spotlightProgress, [0, 1], [0.95, 0.36])
                : 1;

            const barPath = buildTopRoundedBarPath(
              barX,
              currentY,
              barW,
              currentH,
              10
            );
            const shadowPath = buildTopRoundedBarPath(
              barX + 4,
              currentY + 5,
              barW,
              Math.max(0, currentH - 5),
              10
            );

            const fillPaint = item.color
              ? item.color
              : isHero
                ? `url(#${heroBarGradId})`
                : `url(#${neutralBarGradId})`;

            const dispVal = item.value * clamp(pBar, 0, 1);
            const labelOpacity = interpolate(pBar, [0.06, 0.28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            // Breathing pulse lembut pada Hero Bar saat fase Spotlight
            const heroBreathing =
              isHero && highlightPulse && spotlightProgress > 0.5
                ? 1 + Math.sin((spotlightRelFrame / 60) * Math.PI * 2) * 0.025
                : 1;

            return (
              <g key={`vbar-${item.label}-${idx}`} opacity={barOpacity}>
                {/* Extrude Soft Shadow */}
                {shadowPath && (
                  <path
                    d={shadowPath}
                    fill={colors.extrudeShadow}
                    opacity={0.55}
                  />
                )}

                {/* Hero Ambient Glow */}
                {isHero && barPath && spotlightProgress > 0.05 && (
                  <path
                    d={barPath}
                    fill={heroColor}
                    opacity={0.32 * spotlightProgress}
                    filter={`url(#${glowFilterId})`}
                  />
                )}

                {/* Main Top-Rounded Bar Path */}
                {barPath && (
                  <path
                    d={barPath}
                    fill={fillPaint}
                    stroke={
                      isHero ? colors.textPrimary : "rgba(255, 255, 255, 0.25)"
                    }
                    strokeWidth={isHero ? 2.2 : 1.2}
                  />
                )}

                {/* Direct Count-Up Value Label di atas ujung bar */}
                {variant !== "combo" && (
                  <text
                    x={cx}
                    y={Math.max(plotY - 12, currentY - 14)}
                    textAnchor="middle"
                    fill={isHero ? heroColor : colors.textPrimary}
                    opacity={labelOpacity}
                    fontFamily={typography.displayFont}
                    fontSize={isHero ? 24 : 20}
                    fontWeight={isHero ? 900 : 800}
                    transform={`translate(${cx}, ${Math.max(plotY - 12, currentY - 14)}) scale(${heroBreathing.toFixed(4)}) translate(${-cx}, ${-Math.max(plotY - 12, currentY - 14)})`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatChartValue(dispVal, decimals, unitPrefix, unitSuffix)}
                  </text>
                )}

                {/* X-Axis Category Label */}
                <text
                  x={cx}
                  y={baseY + 30}
                  textAnchor="middle"
                  fill={isHero ? heroColor : colors.textSecondary}
                  fontFamily={typography.monoFont}
                  fontSize={16}
                  fontWeight={isHero ? 800 : 700}
                >
                  {item.label}
                </text>

                {/* Hero Delta Callout Pill pada mode Bar murni */}
                {isHero &&
                  variant === "bar" &&
                  heroBadgePop > 0.01 && (
                    <g
                      transform={`translate(${cx.toFixed(2)}, ${Math.max(plotY - 38, currentY - 54).toFixed(2)}) scale(${heroBadgePop.toFixed(4)})`}
                    >
                      <rect
                        x={-84}
                        y={-18}
                        width={168}
                        height={30}
                        rx={8}
                        fill={badgeBgColor}
                        stroke={colors.textPrimary}
                        strokeWidth={1.5}
                      />
                      <text
                        x={0}
                        y={2}
                        textAnchor="middle"
                        fill={badgeTextColor}
                        fontFamily={typography.monoFont}
                        fontSize={13}
                        fontWeight={800}
                      >
                        {getHeroBadgeLabel(item)}
                      </text>
                    </g>
                  )}
              </g>
            );
          })}

        {/* Layer 3B: Horizontal Bar Mode */}
        {shouldRenderBars &&
          isHorizontal &&
          items.map((item, idx) => {
            const slotH = plotH / Math.max(1, items.length);
            const barH = Math.min(52, slotH * 0.58);
            const cy = plotY + (idx + 0.5) * slotH;
            const barY = cy - barH / 2;

            const targetX = valToX(item.value);
            const targetW = Math.max(0, targetX - plotX);

            const startF = barsDelayFrames + idx * staggerFrames;
            const rawProgress =
              barMotionMode === "spring"
                ? evalSpringPreset(relFrame, fps, "satSetSnap", {
                    delay: startF,
                  })
                : evalCurve(relFrame, startF, barAnimDuration, curve);

            const pBar = clamp(rawProgress, 0, 1.08);
            const currentW = targetW * pBar;

            const isHero =
              resolvedHighlightIndex >= 0 && idx === resolvedHighlightIndex;
            const barOpacity =
              resolvedHighlightIndex >= 0 && !isHero
                ? interpolate(spotlightProgress, [0, 1], [0.95, 0.36])
                : 1;

            const barPath = buildRightRoundedBarPath(
              plotX,
              barY,
              currentW,
              barH,
              10
            );

            const fillPaint = item.color
              ? item.color
              : isHero
                ? `url(#${heroBarGradId})`
                : `url(#${neutralBarGradId})`;

            const dispVal = item.value * clamp(pBar, 0, 1);
            const labelOpacity = interpolate(pBar, [0.06, 0.28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <g key={`hbar-${item.label}-${idx}`} opacity={barOpacity}>
                {/* Category Label di Kiri Sumbu */}
                <text
                  x={plotX - 14}
                  y={cy + 6}
                  textAnchor="end"
                  fill={isHero ? heroColor : colors.textSecondary}
                  fontFamily={typography.monoFont}
                  fontSize={16}
                  fontWeight={isHero ? 800 : 700}
                >
                  {item.label}
                </text>

                {isHero && barPath && spotlightProgress > 0.05 && (
                  <path
                    d={barPath}
                    fill={heroColor}
                    opacity={0.32 * spotlightProgress}
                    filter={`url(#${glowFilterId})`}
                  />
                )}

                {barPath && (
                  <path
                    d={barPath}
                    fill={fillPaint}
                    stroke={
                      isHero ? colors.textPrimary : "rgba(255, 255, 255, 0.25)"
                    }
                    strokeWidth={isHero ? 2.2 : 1.2}
                  />
                )}

                {/* Direct Count-Up Value di Ujung Kanan Bar */}
                <text
                  x={plotX + currentW + 12}
                  y={cy + 7}
                  textAnchor="start"
                  fill={isHero ? heroColor : colors.textPrimary}
                  opacity={labelOpacity}
                  fontFamily={typography.displayFont}
                  fontSize={isHero ? 22 : 19}
                  fontWeight={isHero ? 900 : 800}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatChartValue(dispVal, decimals, unitPrefix, unitSuffix)}
                </text>
              </g>
            );
          })}

        {/* Layer 4: Self-Drawing Monotone Cubic Trend Line & Arc-Length Synchronized Nodes */}
        {shouldRenderLine && splineGeometry.lineD && (
          <g>
            {/* Under-stroke Extrude Shadow & Ambient Glow */}
            {lineDrawProgress > 0.001 && (
              <g mask={`url(#${trendMaskId})`}>
                <path
                  d={splineGeometry.lineD}
                  fill="none"
                  stroke={colors.extrudeShadow}
                  strokeOpacity={0.65}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(0, 4)"
                />
                <path
                  d={splineGeometry.lineD}
                  fill="none"
                  stroke={trendColor}
                  strokeOpacity={0.35}
                  strokeWidth={11}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${glowFilterId})`}
                />
                <path
                  d={splineGeometry.lineD}
                  fill="none"
                  stroke={trendColor}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={trendLineDashed ? "12 9" : undefined}
                />
              </g>
            )}

            {/* Data Nodes + Radar Pulse + Count-Up Labels */}
            {splineGeometry.nodes.map((node, idx) => {
              const isHero =
                resolvedHighlightIndex >= 0 && idx === resolvedHighlightIndex;
              // Cari frame tepat saat drawProgress mencapai fraksi arc-length s_i
              const triggerRatio = node.s * 0.96;
              const hasReachedNode = lineDrawProgress >= triggerRatio;
              const approxTriggerFrame =
                lineDelayFrames + Math.round(triggerRatio * drawDurationFrames);
              const nodeRelFrame = Math.max(0, relFrame - approxTriggerFrame);

              const nodePop = hasReachedNode
                ? spring({
                    frame: nodeRelFrame,
                    fps,
                    config: SPRING_PRESETS.elasticPop,
                  })
                : 0;

              const countProgress = evalCurve(
                relFrame,
                approxTriggerFrame,
                22,
                "smoothDeceleration"
              );
              const dispNodeVal = node.value * countProgress;
              const nodeRadius = isHero ? 9 : 6.5;
              const nodeColor = isHero ? heroColor : trendColor;

              const period = 72; // 1.2s @ 60fps
              const showRadar =
                isHero && highlightPulse && hasReachedNode && relFrame > approxTriggerFrame + 8;

              return (
                <g key={`trend-node-${node.label}-${idx}`}>
                  {/* X-Axis Category Label jika variant === "line" */}
                  {variant === "line" && (
                    <text
                      x={node.x}
                      y={baseY + 30}
                      textAnchor="middle"
                      fill={isHero ? heroColor : colors.textSecondary}
                      fontFamily={typography.monoFont}
                      fontSize={16}
                      fontWeight={isHero ? 800 : 700}
                    >
                      {node.label}
                    </text>
                  )}

                  {/* 2-Phase Staggered Radar Pulse Rings pada Hero Node */}
                  {showRadar &&
                    [0, 1].map((ringIdx) => {
                      const phase =
                        ((nodeRelFrame + ringIdx * (period / 2)) % period) /
                        period;
                      const rPulse = interpolate(
                        phase,
                        [0, 1],
                        [nodeRadius, nodeRadius * 3.4],
                        { easing: Easing.out(Easing.quad) }
                      );
                      const opPulse = interpolate(
                        phase,
                        [0, 0.2, 1],
                        [0, 0.75, 0]
                      );
                      return (
                        <circle
                          key={`node-pulse-${ringIdx}`}
                          cx={node.x}
                          cy={node.y}
                          r={rPulse}
                          fill="none"
                          stroke={heroColor}
                          strokeWidth={2.2}
                          strokeOpacity={opPulse}
                        />
                      );
                    })}

                  {/* Node Circle dengan Elastic Overshoot */}
                  {nodePop > 0.001 && (
                    <g
                      transform={`translate(${node.x.toFixed(2)}, ${node.y.toFixed(2)}) scale(${nodePop.toFixed(4)})`}
                    >
                      <circle
                        cx={0}
                        cy={0}
                        r={nodeRadius}
                        fill={colors.surfaceCard}
                        stroke={nodeColor}
                        strokeWidth={3.5}
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={nodeRadius * 0.46}
                        fill={nodeColor}
                      />
                    </g>
                  )}

                  {/* Direct Value Count-Up Label di atas Node */}
                  {hasReachedNode && (
                    <text
                      x={node.x}
                      y={Math.max(plotY - 10, node.y - nodeRadius - 12)}
                      textAnchor="middle"
                      fill={isHero ? heroColor : colors.textPrimary}
                      fontFamily={typography.displayFont}
                      fontSize={isHero ? 23 : 19}
                      fontWeight={isHero ? 900 : 800}
                      opacity={clamp(nodePop, 0, 1)}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatChartValue(
                        dispNodeVal,
                        decimals,
                        unitPrefix,
                        unitSuffix
                      )}
                    </text>
                  )}

                  {/* Hero Delta Callout Pill di atas Hero Node (untuk "line" & "combo") */}
                  {isHero && heroBadgePop > 0.01 && (
                    <g
                      transform={`translate(${node.x.toFixed(2)}, ${Math.max(plotY - 38, node.y - nodeRadius - 50).toFixed(2)}) scale(${heroBadgePop.toFixed(4)})`}
                    >
                      <rect
                        x={-84}
                        y={-18}
                        width={168}
                        height={30}
                        rx={8}
                        fill={badgeBgColor}
                        stroke={colors.textPrimary}
                        strokeWidth={1.5}
                      />
                      <text
                        x={0}
                        y={2}
                        textAnchor="middle"
                        fill={badgeTextColor}
                        fontFamily={typography.monoFont}
                        fontSize={13}
                        fontWeight={800}
                      >
                        {getHeroBadgeLabel(items[idx])}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Square Resize Handles untuk frameStyle === "blueprint" */}
      {frameStyle === "blueprint" &&
        blueprintHandles.map((h, i) => (
          <div
            key={`bp-handle-${i}`}
            style={{
              position: "absolute",
              left: h.left,
              top: h.top,
              width: 14,
              height: 14,
              backgroundColor: colors.textPrimary,
              border: `2.5px solid ${colors.bgPrimary}`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
            }}
          />
        ))}
    </div>
  );
};
