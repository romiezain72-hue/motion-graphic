import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { storyboard, themeConfig } from "./projectLoader";
import { SPRING_PRESETS, type MotionCurveName } from "./motionCurves";
import {
  AnimatedConnectorLine,
  type ConnectorPoint,
} from "./components/AnimatedConnectorLine";
import {
  AnimatedDataChart,
  type DataChartItem,
} from "./components/AnimatedDataChart";
import { AudioLayer } from "./components/AudioLayer";
import { BackdropCanvas } from "./components/BackdropCanvas";
import { BoundingBoxFrame } from "./components/BoundingBoxFrame";
import { CameraRig } from "./components/CameraRig";
import { FloatingStickerCard } from "./components/FloatingStickerCard";
import { HeroStatCallout } from "./components/HeroStatCallout";
import { HighlightBadge } from "./components/HighlightBadge";
import { KineticTextBlock } from "./components/KineticTextBlock";
import {
  LiveCodeTerminal,
  type CodeLineItem,
} from "./components/LiveCodeTerminal";
import { MagnifierCallout } from "./components/MagnifierCallout";
import {
  PhysicsDiagramCanvas,
  type PhysicsDiagramMode,
} from "./components/PhysicsDiagramCanvas";
import { RadialGaugeCallout } from "./components/RadialGaugeCallout";
import { Scene3DObject, type Scene3DVariant } from "./components/Scene3DObject";
import {
  SplitComparisonCard,
  type SplitComparisonSide,
} from "./components/SplitComparisonCard";
import { StepProgressPills } from "./components/StepProgressPills";
import { TelemetryHUD, type TelemetryCardItem } from "./components/TelemetryHUD";
import { TerminalHeader } from "./components/TerminalHeader";
import {
  TimelineSlider,
  type TimelineMilestone,
} from "./components/TimelineSlider";
import { WordSyncCaption } from "./components/WordSyncCaption";

interface SceneHeadlineProps {
  text: string;
  x: number;
  y: number;
  enterAtRelativeFrame?: number;
}

const SceneHeadline: React.FC<SceneHeadlineProps> = ({
  text,
  x,
  y,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);
  // Sat-Set v2 Spring Preset (`SPRING_PRESETS.satSetSnap`): High stiffness (290), higher damping (22), lighter mass (0.65)
  const pop = spring({
    frame: relFrame,
    fps,
    config: SPRING_PRESETS.satSetSnap,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 880,
        transform: "translate(-50%, -50%)",
        scale: String(interpolate(pop, [0, 1], [0.9, 1])),
        fontFamily: typography.displayFont,
        fontSize: typography.headlineSizePx,
        fontWeight: 800,
        lineHeight: 1.08,
        textAlign: "center",
        color: colors.textPrimary,
        WebkitTextStroke: "1.5px rgba(4, 14, 22, 0.65)",
        paintOrder: "stroke fill",
        textShadow: `0 10px 28px ${colors.extrudeShadow}, 0 4px 12px rgba(0,0,0,0.8)`,
        zIndex: 30,
      }}
    >
      {text}
    </div>
  );
};

const StoryboardSceneView: React.FC<{
  scene: (typeof storyboard.scenes)[number];
}> = ({ scene }) => {
  const cam = (scene.cameraMotion || {
    type: "fast_punch_zoom",
    fromScale: 1.0,
    toScale: 1.06,
    fromX: 0,
    toX: 0,
    fromY: 0,
    toY: -16,
    parallaxStrength: 0.48,
  }) as {
    type?: string;
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
  };

  const backgroundElements = (scene.elements as Array<Record<string, unknown>>).filter(
    (el) => el.component === "Scene3DObject"
  );
  const foregroundElements = (scene.elements as Array<Record<string, unknown>>).filter(
    (el) => el.component !== "Scene3DObject"
  );

  return (
    <CameraRig
      durationInFrames={scene.durationFrames}
      motionType={cam.type ?? "fast_punch_zoom"}
      fromScale={cam.fromScale}
      toScale={cam.toScale}
      fromX={cam.fromX}
      toX={cam.toX}
      fromY={cam.fromY}
      toY={cam.toY}
      fromRotateDeg={cam.fromRotateDeg}
      toRotateDeg={cam.toRotateDeg}
      parallaxStrength={cam.parallaxStrength}
      curve={cam.curve}
      backgroundLayer={
        <>
          <BackdropCanvas
            preset={
              (scene.backdropPreset as
                | "ocean_abyss_strata"
                | "continental_drift_map"
                | "starry_storm_sea"
                | "dark_engineering_grid"
                | "wind_tunnel_grid"
                | "cobalt_blueprint") || "dark_engineering_grid"
            }
          />
          {backgroundElements.map((el, idx) => {
            const p = (el.props || {}) as Record<string, unknown>;
            return (
              <Scene3DObject
                key={`${scene.sceneId}-3d-${idx}`}
                enabled={Boolean(p.enabled ?? true)}
                variant={
                  (p.variant as Scene3DVariant) ||
                  "wireframe_globe"
                }
                x={Number(p.x ?? 800)}
                y={Number(p.y ?? 760)}
                size={Number(p.size ?? 440)}
                opacity={Number(p.opacity ?? 0.28)}
                rotationSpeed={Number(p.rotationSpeed ?? 1.0)}
                enterAtRelativeFrame={Number(el.enterAtRelativeFrame ?? 0)}
              />
            );
          })}
        </>
      }
      foregroundLayer={
        <>
          {scene.headline && (
            <SceneHeadline
              text={scene.headline.text}
              x={scene.headline.x}
              y={scene.headline.y}
              enterAtRelativeFrame={scene.headline.enterAtRelativeFrame}
            />
          )}

          {foregroundElements.map((el, idx) => {
            const compName = String(el.component || "");
            const enterFrame = Number(el.enterAtRelativeFrame ?? 0);
            const key = `${scene.sceneId}-${compName}-${idx}`;
            const p = (el.props || {}) as Record<string, unknown>;

            if (compName === "TerminalHeader") {
              return (
                <TerminalHeader
                  key={key}
                  handle={String(p.handle || "@aerodynamics.lab")}
                  eyebrow={String(
                    p.eyebrow || "BEDAH FISIKA TEKNIK // QUADCOPTER FLIGHT"
                  )}
                  telemetryTag={String(p.telemetryTag || "IMU 1000Hz")}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 175)}
                />
              );
            }

            if (compName === "StepProgressPills") {
              return (
                <StepProgressPills
                  key={key}
                  activeStep={Number(p.activeStep ?? 1)}
                  stepTitle={String(p.stepTitle || "STEP 01")}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 285)}
                />
              );
            }

            if (compName === "PhysicsDiagramCanvas") {
              return (
                <PhysicsDiagramCanvas
                  key={key}
                  mode={(p.mode as PhysicsDiagramMode) || "vector_split"}
                  fromPitchDeg={Number(p.fromPitchDeg ?? 0)}
                  toPitchDeg={Number(p.toPitchDeg ?? 25)}
                  rearRpm={Number(p.rearRpm ?? 6850)}
                  frontRpm={Number(p.frontRpm ?? 5420)}
                  showVectors={Boolean(p.showVectors ?? true)}
                  showRpmBars={Boolean(p.showRpmBars ?? false)}
                  showDrag={Boolean(p.showDrag ?? false)}
                  showGimbalCone={Boolean(p.showGimbalCone ?? false)}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 770)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "TelemetryHUD") {
              return (
                <TelemetryHUD
                  key={key}
                  cards={(p.cards as TelemetryCardItem[]) || []}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 1145)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "HighlightBadge") {
              return (
                <HighlightBadge
                  key={key}
                  text={String(p.text || "")}
                  openLoopText={
                    p.openLoopText ? String(p.openLoopText) : undefined
                  }
                  openLoopAtRelativeFrame={
                    p.openLoopAtRelativeFrame !== undefined
                      ? Number(p.openLoopAtRelativeFrame)
                      : undefined
                  }
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 1280)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "HeroStatCallout") {
              return (
                <HeroStatCallout
                  key={key}
                  value={String(p.value || "")}
                  subLabel={String(p.subLabel || "")}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 800)}
                  animateCountUp={Boolean(p.animateCountUp ?? true)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "MagnifierCallout") {
              return (
                <MagnifierCallout
                  key={key}
                  label={String(p.label || "")}
                  x={Number(p.x ?? 340)}
                  y={Number(p.y ?? 430)}
                  iconVariant={
                    (p.iconVariant as "shark_scales" | "ancient_tree") ||
                    "shark_scales"
                  }
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "BoundingBoxFrame") {
              return (
                <BoundingBoxFrame
                  key={key}
                  title={String(p.title || "AUTOMATED WORKFLOW ENGINE")}
                  highlightTag={String(p.highlightTag || "with Multi-Agent AI")}
                  subtitle={String(p.subtitle || "")}
                  dimensionLabel={String(p.dimensionLabel || "760 × 420 px")}
                  width={Number(p.width ?? 760)}
                  height={Number(p.height ?? 420)}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 760)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "FloatingStickerCard") {
              return (
                <FloatingStickerCard
                  key={key}
                  badge={String(p.badge || "STEP 01")}
                  label={String(p.label || "")}
                  subtext={String(p.subtext || "")}
                  accentColor={String(p.accentColor || "#FACC15")}
                  tiltDeg={Number(p.tiltDeg ?? -3.5)}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 1150)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "AnimatedConnectorLine") {
              const rawFrom = (p.from || { x: 300, y: 640 }) as ConnectorPoint;
              const rawTo = (p.to || { x: 740, y: 980 }) as ConnectorPoint;
              const cp1 = p.controlPoint1 as ConnectorPoint | undefined;
              const cp2 = p.controlPoint2 as ConnectorPoint | undefined;

              return (
                <AnimatedConnectorLine
                  key={key}
                  from={{
                    x: Number(rawFrom.x ?? 300),
                    y: Number(rawFrom.y ?? 640),
                  }}
                  to={{
                    x: Number(rawTo.x ?? 740),
                    y: Number(rawTo.y ?? 980),
                  }}
                  variant={
                    (p.variant as "straight" | "curved" | "elbow") || "curved"
                  }
                  curveOffset={
                    p.curveOffset !== undefined ? Number(p.curveOffset) : -90
                  }
                  controlPoint1={
                    cp1
                      ? { x: Number(cp1.x), y: Number(cp1.y) }
                      : undefined
                  }
                  controlPoint2={
                    cp2
                      ? { x: Number(cp2.x), y: Number(cp2.y) }
                      : undefined
                  }
                  elbowAxis={
                    (p.elbowAxis as "horizontal-first" | "vertical-first") ||
                    "horizontal-first"
                  }
                  elbowRatio={
                    p.elbowRatio !== undefined ? Number(p.elbowRatio) : 0.5
                  }
                  cornerRadius={
                    p.cornerRadius !== undefined ? Number(p.cornerRadius) : 24
                  }
                  dashPattern={
                    (p.dashPattern as "solid" | "dashed" | "dotted") || "solid"
                  }
                  headType={
                    (p.headType as "arrow" | "chevron" | "dot" | "none") ||
                    "arrow"
                  }
                  nodeShape={
                    (p.nodeShape as "circle" | "square_handle") || "circle"
                  }
                  showStartNode={
                    p.showStartNode !== undefined
                      ? Boolean(p.showStartNode)
                      : true
                  }
                  showEndNode={
                    p.showEndNode !== undefined ? Boolean(p.showEndNode) : true
                  }
                  showTrack={
                    p.showTrack !== undefined ? Boolean(p.showTrack) : true
                  }
                  pulse={p.pulse !== undefined ? Boolean(p.pulse) : true}
                  pulsePeriodFrames={
                    p.pulsePeriodFrames !== undefined
                      ? Number(p.pulsePeriodFrames)
                      : 72
                  }
                  color={p.color ? String(p.color) : undefined}
                  strokeWidth={
                    p.strokeWidth !== undefined ? Number(p.strokeWidth) : 4
                  }
                  nodeRadius={
                    p.nodeRadius !== undefined ? Number(p.nodeRadius) : 8
                  }
                  curve={(p.curve as MotionCurveName) || "snapIn"}
                  drawDelayFrames={
                    p.drawDelayFrames !== undefined
                      ? Number(p.drawDelayFrames)
                      : 6
                  }
                  drawDurationFrames={
                    p.drawDurationFrames !== undefined
                      ? Number(p.drawDurationFrames)
                      : 26
                  }
                  labelStart={p.labelStart ? String(p.labelStart) : undefined}
                  labelEnd={p.labelEnd ? String(p.labelEnd) : undefined}
                  zIndex={p.zIndex !== undefined ? Number(p.zIndex) : 27}
                  x={p.x !== undefined ? Number(p.x) : undefined}
                  y={p.y !== undefined ? Number(p.y) : undefined}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "AnimatedDataChart") {
              const rawData = Array.isArray(p.data)
                ? (p.data as DataChartItem[])
                : [];
              return (
                <AnimatedDataChart
                  key={key}
                  title={p.title ? String(p.title) : undefined}
                  subtitle={p.subtitle ? String(p.subtitle) : undefined}
                  sourceLabel={
                    p.sourceLabel ? String(p.sourceLabel) : undefined
                  }
                  variant={
                    (p.variant as
                      | "bar"
                      | "line"
                      | "combo"
                      | "horizontal_bar") || "bar"
                  }
                  data={rawData}
                  highlightIndex={
                    p.highlightIndex !== undefined
                      ? Number(p.highlightIndex)
                      : undefined
                  }
                  unitPrefix={p.unitPrefix ? String(p.unitPrefix) : ""}
                  unitSuffix={p.unitSuffix ? String(p.unitSuffix) : ""}
                  decimals={p.decimals !== undefined ? Number(p.decimals) : 0}
                  domainMin={
                    p.domainMin !== undefined ? Number(p.domainMin) : 0
                  }
                  domainMax={
                    p.domainMax !== undefined ? Number(p.domainMax) : undefined
                  }
                  targetLineValue={
                    p.targetLineValue !== undefined
                      ? Number(p.targetLineValue)
                      : undefined
                  }
                  targetLineLabel={
                    p.targetLineLabel ? String(p.targetLineLabel) : undefined
                  }
                  showTrendLine={
                    p.showTrendLine !== undefined
                      ? Boolean(p.showTrendLine)
                      : undefined
                  }
                  showAreaFill={
                    p.showAreaFill !== undefined
                      ? Boolean(p.showAreaFill)
                      : undefined
                  }
                  trendLineDashed={
                    p.trendLineDashed !== undefined
                      ? Boolean(p.trendLineDashed)
                      : false
                  }
                  barMotionMode={
                    (p.barMotionMode as "bezier" | "spring") || "bezier"
                  }
                  curve={(p.curve as MotionCurveName) || "snapIn"}
                  staggerFrames={
                    p.staggerFrames !== undefined ? Number(p.staggerFrames) : 4
                  }
                  drawDurationFrames={
                    p.drawDurationFrames !== undefined
                      ? Number(p.drawDurationFrames)
                      : 28
                  }
                  spotlightAtRelativeFrame={
                    p.spotlightAtRelativeFrame !== undefined
                      ? Number(p.spotlightAtRelativeFrame)
                      : 64
                  }
                  highlightPulse={
                    p.highlightPulse !== undefined
                      ? Boolean(p.highlightPulse)
                      : true
                  }
                  frameStyle={
                    (p.frameStyle as "editorial" | "blueprint" | "terminal") ||
                    "editorial"
                  }
                  width={p.width !== undefined ? Number(p.width) : 820}
                  height={p.height !== undefined ? Number(p.height) : 660}
                  x={Number(p.x ?? 500)}
                  y={Number(p.y ?? 810)}
                  zIndex={p.zIndex !== undefined ? Number(p.zIndex) : 25}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "SplitComparisonCard") {
              return (
                <SplitComparisonCard
                  key={key}
                  leftSide={p.leftSide as SplitComparisonSide | undefined}
                  rightSide={p.rightSide as SplitComparisonSide | undefined}
                  vsLabel={p.vsLabel ? String(p.vsLabel) : "VS"}
                  layout={
                    (p.layout as "horizontal" | "vertical") || "horizontal"
                  }
                  highlightWinner={
                    (p.highlightWinner as "left" | "right") || "right"
                  }
                  width={p.width !== undefined ? Number(p.width) : 820}
                  height={p.height !== undefined ? Number(p.height) : 460}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 780)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "KineticTextBlock") {
              return (
                <KineticTextBlock
                  key={key}
                  eyebrow={p.eyebrow ? String(p.eyebrow) : undefined}
                  lines={
                    Array.isArray(p.lines) ? (p.lines as string[]) : undefined
                  }
                  highlightWords={
                    Array.isArray(p.highlightWords)
                      ? (p.highlightWords as string[])
                      : undefined
                  }
                  align={(p.align as "left" | "center") || "center"}
                  fontSize={p.fontSize !== undefined ? Number(p.fontSize) : 52}
                  staggerFrames={
                    p.staggerFrames !== undefined ? Number(p.staggerFrames) : 4
                  }
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 620)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "LiveCodeTerminal") {
              return (
                <LiveCodeTerminal
                  key={key}
                  windowTitle={
                    p.windowTitle ? String(p.windowTitle) : undefined
                  }
                  languageTag={
                    p.languageTag ? String(p.languageTag) : undefined
                  }
                  lines={
                    Array.isArray(p.lines)
                      ? (p.lines as CodeLineItem[])
                      : undefined
                  }
                  typingSpeedCharsPerFrame={
                    p.typingSpeedCharsPerFrame !== undefined
                      ? Number(p.typingSpeedCharsPerFrame)
                      : 1.6
                  }
                  width={p.width !== undefined ? Number(p.width) : 820}
                  height={p.height !== undefined ? Number(p.height) : 380}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 770)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "RadialGaugeCallout") {
              return (
                <RadialGaugeCallout
                  key={key}
                  value={p.value !== undefined ? Number(p.value) : 87.3}
                  maxValue={p.maxValue !== undefined ? Number(p.maxValue) : 100}
                  unit={p.unit ? String(p.unit) : "%"}
                  label={p.label ? String(p.label) : undefined}
                  sublabel={p.sublabel ? String(p.sublabel) : undefined}
                  size={p.size !== undefined ? Number(p.size) : 340}
                  strokeWidth={
                    p.strokeWidth !== undefined ? Number(p.strokeWidth) : 22
                  }
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 760)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            if (compName === "TimelineSlider") {
              return (
                <TimelineSlider
                  key={key}
                  header={p.header ? String(p.header) : undefined}
                  milestones={
                    Array.isArray(p.milestones)
                      ? (p.milestones as TimelineMilestone[])
                      : undefined
                  }
                  activeIndex={
                    p.activeIndex !== undefined ? Number(p.activeIndex) : 1
                  }
                  width={p.width !== undefined ? Number(p.width) : 820}
                  x={Number(p.x ?? 540)}
                  y={Number(p.y ?? 1080)}
                  enterAtRelativeFrame={enterFrame}
                />
              );
            }

            return null;
          })}
        </>
      }
    />
  );
};

/**
 * 100% JSON-Driven ReelsComposition (1080x1920 @ 60fps).
 * Dynamically loads active project via `src/projectLoader.ts` (`active_project.json`).
 * Sat-Set v2 Upgrade: 14-frame (0.23s) snappy slide transitions + phrase-aware WordSyncCaption.
 */
export const ReelsComposition: React.FC = () => {
  const transitionFrames = storyboard.transitionDurationFrames ?? 14;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: themeConfig.colors.bgPrimary,
        overflow: "hidden",
      }}
    >
      {/* Audio Track Manager: Master VO + SFX + Auto-Ducked Looped BGM */}
      <AudioLayer />

      {/* TransitionSeries with 14-frame (0.23s) sat-set slide transition */}
      <TransitionSeries>
        {storyboard.scenes.map((scene, idx) => {
          const isNotLast = idx < storyboard.scenes.length - 1;
          const seqDuration =
            scene.durationFrames + (isNotLast ? transitionFrames : 0);

          return (
            <React.Fragment key={scene.sceneId}>
              <TransitionSeries.Sequence durationInFrames={seqDuration}>
                <StoryboardSceneView scene={scene} />
              </TransitionSeries.Sequence>
              {isNotLast && (
                <TransitionSeries.Transition
                  presentation={slide({ direction: "from-bottom" })}
                  timing={linearTiming({ durationInFrames: transitionFrames })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {/* Phrase-Aware Semantic Word-Synced Auto Captions in Reels Bottom Safe Zone */}
      <WordSyncCaption y={storyboard.captionSafeZone?.y ?? 1420} />
    </AbsoluteFill>
  );
};
