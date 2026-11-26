import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { themeConfig } from "../projectLoader";

export type PhysicsDiagramMode =
  | "hover_paradox"
  | "fixed_vertical_rotors"
  | "rpm_differential"
  | "vector_split"
  | "drag_sport_mode"
  | "gimbal_horizon_lock";

export interface PhysicsDiagramCanvasProps {
  mode: PhysicsDiagramMode;
  fromPitchDeg?: number;
  toPitchDeg?: number;
  rearRpm?: number;
  frontRpm?: number;
  showVectors?: boolean;
  showRpmBars?: boolean;
  showDrag?: boolean;
  showGimbalCone?: boolean;
  x?: number;
  y?: number;
  enterAtRelativeFrame?: number;
}

/**
 * Archetype B (<PhysicsDiagramCanvas /> v2 Sat-Set Pacing Upgrade):
 * - Snappy spring entrance (`stiffness: 280, damping: 22, mass: 0.65`).
 * - Visual Beat Engine every ~1.75 seconds (`105 frames`): cycles through crisp
 *   analytical sub-states (`BEAT 01` -> `BEAT 02` -> `BEAT 03` -> `BEAT 04`) with
 *   faster pitch transitions, vector emphasis pulses, and live telemetry badges.
 */
export const PhysicsDiagramCanvas: React.FC<PhysicsDiagramCanvasProps> = ({
  mode = "vector_split",
  fromPitchDeg = 0,
  toPitchDeg = 25,
  rearRpm = 6850,
  frontRpm = 5420,
  showVectors = true,
  showRpmBars = false,
  showDrag = false,
  showGimbalCone = false,
  x = 540,
  y = 770,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);

  // Sat-Set v2 Spring: High stiffness, minimal overshoot
  const entrance = spring({
    frame: relFrame,
    fps,
    config: { damping: 22, stiffness: 280, mass: 0.65 },
  });

  // Visual beat index changes every 105 frames (1.75 seconds @ 60fps)
  const beatIndex = Math.floor(relFrame / 105);
  const beatLocalFrame = relFrame % 105;
  const beatPulse = spring({
    frame: beatLocalFrame,
    fps,
    config: { damping: 20, stiffness: 300, mass: 0.55 },
  });

  let basePitchDeg = 0;
  let activeFlightModeTag = "TELEMETRY ACTIVE";

  if (mode === "drag_sport_mode") {
    // Sat-Set faster progression through 0° -> 10° (Cine) -> 25° (Normal) -> 35° (Sport Mode)
    basePitchDeg = interpolate(
      relFrame,
      [0, 75, 290, 350, 620, 690, 1315],
      [0, 10, 10, 25, 25, 35, 35],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    if (basePitchDeg < 15) {
      activeFlightModeTag = "BEAT 01 // CINE MODE 10° (~20 KM/H)";
    } else if (basePitchDeg < 30) {
      activeFlightModeTag = "BEAT 02 // NORMAL MODE 25° (~50 KM/H)";
    } else {
      activeFlightModeTag = "BEAT 03 // SPORT MODE 35° (75 KM/H MAX)";
    }
  } else if (mode === "fixed_vertical_rotors") {
    basePitchDeg = 0;
    const subLabels = [
      "BEAT 01 // 4 ROTOR LOCKED 90° VERTICAL",
      "BEAT 02 // THRUST = 100% MELAWAN GRAVITASI",
      "BEAT 03 // HORIZONTAL FORCE Fx = 0.0 N",
      "BEAT 04 // OPEN LOOP -> BUTUH TORSI PITCH!",
    ];
    activeFlightModeTag = subLabels[beatIndex % subLabels.length];
  } else {
    // Fast 55-frame (~0.9s) pitch snap + periodic 1.75s dynamic beat maneuver
    const p1 = interpolate(relFrame, [6, 65], [fromPitchDeg, toPitchDeg], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const dynamicSway =
      relFrame > 70 ? Math.sin((relFrame - 70) / 30) * 3.8 : 0;
    basePitchDeg = Math.max(0, p1 + dynamicSway);

    if (mode === "gimbal_horizon_lock") {
      activeFlightModeTag = `BEAT 0${(beatIndex % 4) + 1} // 3-AXIS GIMBAL 1000Hz LOCK`;
    } else if (mode === "rpm_differential") {
      activeFlightModeTag = `BEAT 0${(beatIndex % 4) + 1} // PID TORQUE REAR +24% RPM`;
    } else if (mode === "vector_split") {
      activeFlightModeTag = `BEAT 0${(beatIndex % 4) + 1} // SPLIT T·cos(θ) + T·sin(θ)`;
    } else {
      activeFlightModeTag = `BEAT 0${(beatIndex % 4) + 1} // PARADOKS PITCH 25.0°`;
    }
  }

  const hoverMicroTilt = Math.sin(frame / 16) * 0.55;
  const currentPitchDeg = Math.max(0, basePitchDeg + hoverMicroTilt);
  const pitchRad = (currentPitchDeg * Math.PI) / 180;
  const svgTiltDeg = -currentPitchDeg;

  const totalThrustLen = 195;
  const liftLen = Math.round(totalThrustLen * Math.cos(pitchRad));
  const forwardLen = Math.round(totalThrustLen * Math.sin(pitchRad));

  const cgX = 450;
  const cgY = 265;

  const thrustTipX = cgX - forwardLen;
  const thrustTipY = cgY - liftLen;

  const pitchRatio = toPitchDeg > 0 ? Math.min(1, currentPitchDeg / toPitchDeg) : 0;
  const liveRearRpm = Math.round(
    interpolate(pitchRatio, [0, 1], [5800, rearRpm])
  );
  const liveFrontRpm = Math.round(
    interpolate(pitchRatio, [0, 1], [5800, frontRpm])
  );

  const rearBarWidth = interpolate(liveRearRpm, [4000, 8000], [80, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frontBarWidth = interpolate(liveFrontRpm, [4000, 8000], [80, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const droneShiftX = interpolate(currentPitchDeg, [0, 35], [0, -28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const activeX = cgX + droneShiftX;
  const activeBorderGlow = interpolate(beatPulse, [0, 1], [0.45, 0.16]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 880,
        height: 520,
        transform: "translate(-50%, -50%)",
        scale: String(interpolate(entrance, [0, 1], [0.9, 1])),
        opacity: interpolate(relFrame, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        backgroundColor: "rgba(18, 19, 26, 0.92)",
        border: `1.5px solid rgba(56, 189, 248, ${activeBorderGlow})`,
        borderRadius: 28,
        boxShadow:
          "0 20px 50px rgba(0, 0, 0, 0.75), inset 0 0 40px rgba(56, 189, 248, 0.06)",
        overflow: "hidden",
        zIndex: 25,
      }}
    >
      {/* Top CAD Viewport Status Bar with 1.75s Visual Beat Indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(9, 9, 11, 0.78)",
          fontFamily: typography.monoFont,
          fontSize: 18,
          fontWeight: 700,
          color: colors.textSecondary,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              display: "inline-block",
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: beatIndex % 2 === 0 ? "#38BDF8" : "#FACC15",
              boxShadow: "0 0 10px #38BDF8",
            }}
          />
          <span style={{ color: "#38BDF8" }}>{activeFlightModeTag}</span>
          <span>•</span>
          <span style={{ color: colors.textPrimary }}>← ARAH MAJU</span>
        </div>
        <div style={{ color: colors.accentBadge }}>
          PITCH θ = {currentPitchDeg.toFixed(1)}°
        </div>
      </div>

      {/* Main Engineering SVG Canvas */}
      <svg width="880" height="465" viewBox="0 0 880 465">
        <defs>
          <marker
            id="arrowThrustRed"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="5"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 Z" fill="#EF4444" />
          </marker>
          <marker
            id="arrowLiftCyan"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="5"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 Z" fill="#38BDF8" />
          </marker>
          <marker
            id="arrowFwdGold"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="5"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 Z" fill="#FACC15" />
          </marker>
          <marker
            id="arrowGravitySlate"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="5"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 Z" fill="#94A3B8" />
          </marker>

          <linearGradient id="gimbalFovGrad" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.44" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* CAD Crosshair & Horizon Reference Line */}
        <line
          x1="40"
          y1={cgY}
          x2="840"
          y2={cgY}
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1.5"
          strokeDasharray="8 8"
        />
        <line
          x1={activeX}
          y1="30"
          x2={activeX}
          y2="435"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1.5"
          strokeDasharray="8 8"
        />
        <text
          x="825"
          y={cgY - 10}
          textAnchor="end"
          fill="#64748B"
          fontFamily={typography.monoFont}
          fontSize="15"
          fontWeight="700"
        >
          HORIZON 0.0°
        </text>

        {/* Pitch Angle Arc */}
        {currentPitchDeg > 2 && (
          <g>
            <path
              d={`M ${activeX} ${cgY - 75} A 75 75 0 0 0 ${activeX - 75 * Math.sin(pitchRad)} ${cgY - 75 * Math.cos(pitchRad)}`}
              fill="none"
              stroke="#FACC15"
              strokeWidth="3"
            />
            <text
              x={activeX - 38 * Math.sin(pitchRad / 2) - 18}
              y={cgY - 88}
              fill="#FACC15"
              fontFamily={typography.monoFont}
              fontSize="18"
              fontWeight="800"
            >
              θ={Math.round(currentPitchDeg)}°
            </text>
          </g>
        )}

        {/* FORCE VECTORS */}
        {showVectors && (
          <g>
            {currentPitchDeg > 3 && (
              <g
                stroke="rgba(250, 204, 21, 0.35)"
                strokeWidth="2"
                strokeDasharray="5 5"
              >
                <line
                  x1={activeX}
                  y1={cgY - liftLen}
                  x2={activeX - forwardLen}
                  y2={thrustTipY}
                />
                <line
                  x1={activeX - forwardLen}
                  y1={cgY}
                  x2={activeX - forwardLen}
                  y2={thrustTipY}
                />
              </g>
            )}

            {/* Gravity Vector (W = m·g) */}
            <line
              x1={activeX}
              y1={cgY}
              x2={activeX}
              y2={cgY + 145}
              stroke="#94A3B8"
              strokeWidth="4"
              markerEnd="url(#arrowGravitySlate)"
            />
            <text
              x={activeX + 14}
              y={cgY + 140}
              fill="#94A3B8"
              fontFamily={typography.monoFont}
              fontSize="17"
              fontWeight="700"
            >
              GRAVITASI (W = m·g)
            </text>

            {/* Vertical Lift Component (Ty = T·cosθ) */}
            <line
              x1={activeX}
              y1={cgY}
              x2={activeX}
              y2={cgY - liftLen}
              stroke="#38BDF8"
              strokeWidth={beatIndex % 3 === 1 ? "6.5" : "5"}
              markerEnd="url(#arrowLiftCyan)"
            />
            <text
              x={activeX + 14}
              y={cgY - liftLen + 16}
              fill="#38BDF8"
              fontFamily={typography.monoFont}
              fontSize="18"
              fontWeight="800"
            >
              LIFT (T·cosθ)
            </text>

            {/* Horizontal Forward Force Component (Tx = T·sinθ) */}
            {forwardLen > 12 && (
              <g>
                <line
                  x1={activeX}
                  y1={cgY}
                  x2={activeX - forwardLen - 16}
                  y2={cgY}
                  stroke="#FACC15"
                  strokeWidth={beatIndex % 3 === 2 ? "7.5" : "6"}
                  markerEnd="url(#arrowFwdGold)"
                />
                <text
                  x={activeX - forwardLen - 10}
                  y={cgY + 30}
                  textAnchor="middle"
                  fill="#FACC15"
                  fontFamily={typography.monoFont}
                  fontSize="18"
                  fontWeight="800"
                >
                  DORONG MAJU (T·sinθ)
                </text>
              </g>
            )}

            {/* Total Tilted Thrust Vector (T) */}
            {currentPitchDeg > 2 && (
              <g>
                <line
                  x1={activeX}
                  y1={cgY}
                  x2={activeX - forwardLen}
                  y2={thrustTipY}
                  stroke="#EF4444"
                  strokeWidth={beatIndex % 3 === 0 ? "6.5" : "5.5"}
                  markerEnd="url(#arrowThrustRed)"
                />
                <text
                  x={activeX - forwardLen - 14}
                  y={thrustTipY - 12}
                  textAnchor="end"
                  fill="#EF4444"
                  fontFamily={typography.monoFont}
                  fontSize="19"
                  fontWeight="800"
                >
                  TOTAL THRUST (T)
                </text>
              </g>
            )}
          </g>
        )}

        {/* AERODYNAMIC DRAG WIND STREAMLINES */}
        {showDrag && (
          <g>
            {[155, 215, 285, 345].map((yWind, idx) => {
              const offset = (frame * 11 + idx * 55) % 230;
              return (
                <line
                  key={idx}
                  x1={40 + offset}
                  y1={yWind}
                  x2={145 + offset}
                  y2={yWind}
                  stroke="#EF4444"
                  strokeWidth="3"
                  strokeDasharray="16 8"
                  markerEnd="url(#arrowThrustRed)"
                  opacity="0.82"
                />
              );
            })}
            <rect
              x="36"
              y="108"
              width="225"
              height="34"
              rx="8"
              fill="rgba(239, 68, 68, 0.2)"
              stroke="#EF4444"
              strokeWidth="1.5"
            />
            <text
              x="148"
              y="130"
              textAnchor="middle"
              fill="#EF4444"
              fontFamily={typography.monoFont}
              fontSize="16"
              fontWeight="800"
            >
              HAMBATAN ANGIN (DRAG) →
            </text>
          </g>
        )}

        {/* TECHNICAL SIDE-PROFILE DJI QUADCOPTER SCHEMATIC */}
        <g transform={`translate(${activeX}, ${cgY}) rotate(${svgTiltDeg})`}>
          <path
            d={`M -165 -26 L -185 ${55 + (liveFrontRpm - 5000) * 0.02} L -125 ${55 + (liveFrontRpm - 5000) * 0.02} Z`}
            fill="rgba(56, 189, 248, 0.14)"
          />
          <path
            d={`M 135 -26 L 115 ${65 + (liveRearRpm - 5000) * 0.04} L 185 ${65 + (liveRearRpm - 5000) * 0.04} Z`}
            fill="rgba(239, 68, 68, 0.24)"
          />

          <path
            d="M -155 -24 L -40 -6 L 40 -6 L 155 -24"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M -155 -24 L -40 -6 L 40 -6 L 155 -24"
            fill="none"
            stroke="#475569"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M -115 -14 L -128 38 M 115 -14 L 128 38"
            stroke="#94A3B8"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M -92 -4 C -75 -28, -20 -34, 48 -28 L 88 -14 L 78 14 C 30 22, -45 20, -82 8 Z"
            fill="#1E293B"
            stroke="#E2E8F0"
            strokeWidth="3"
          />
          <path
            d="M -38 -27 L 38 -25 L 44 -8 L -44 -8 Z"
            fill="#334155"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <line x1="-18" y1="-16" x2="22" y2="-16" stroke="#38BDF8" strokeWidth="2.5" />

          {/* FRONT MOTOR (M1/M2) */}
          <g transform="translate(-155, -26)">
            <rect x="-12" y="-14" width="24" height="16" rx="4" fill="#38BDF8" />
            <ellipse
              cx="0"
              cy="-18"
              rx={52 + Math.sin(frame * 1.8) * 6}
              ry="4.5"
              fill="#38BDF8"
              opacity="0.88"
            />
            <text
              x="0"
              y="-32"
              textAnchor="middle"
              fill="#38BDF8"
              fontFamily={typography.monoFont}
              fontSize="15"
              fontWeight="800"
            >
              DEPAN ({liveFrontRpm} RPM)
            </text>
          </g>

          {/* REAR MOTOR (M3/M4) */}
          <g transform="translate(155, -26)">
            <rect x="-12" y="-14" width="24" height="16" rx="4" fill="#EF4444" />
            <ellipse
              cx="0"
              cy="-18"
              rx={58 + Math.cos(frame * 2.3) * 6}
              ry="5.5"
              fill="#EF4444"
              opacity="0.95"
            />
            <text
              x="0"
              y="-32"
              textAnchor="middle"
              fill="#EF4444"
              fontFamily={typography.monoFont}
              fontSize="15"
              fontWeight="800"
            >
              BELAKANG ({liveRearRpm} RPM)
            </text>
          </g>

          {/* 3-AXIS CAMERA GIMBAL AT NOSE */}
          <g transform="translate(-92, 6)">
            <path
              d="M 10 -6 L -6 -6 L -6 12"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="3.5"
            />
            <g transform={`rotate(${-svgTiltDeg})`}>
              {showGimbalCone && (
                <g>
                  <polygon
                    points="-12,0 -340,-105 -340,105"
                    fill="url(#gimbalFovGrad)"
                  />
                  <line
                    x1="-12"
                    y1="0"
                    x2="-340"
                    y2="0"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeDasharray="8 6"
                  />
                  <text
                    x="-210"
                    y="-14"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontFamily={typography.monoFont}
                    fontSize="17"
                    fontWeight="800"
                  >
                    KAMERA DATAR 0.0° (+{Math.round(currentPitchDeg)}° GIMBAL)
                  </text>
                </g>
              )}

              <rect
                x="-18"
                y="-10"
                width="22"
                height="20"
                rx="5"
                fill="#0F172A"
                stroke={showGimbalCone ? "#38BDF8" : "#F8FAFC"}
                strokeWidth="2.5"
              />
              <circle cx="-18" cy="0" r="5" fill="#38BDF8" />
            </g>

            {showGimbalCone && (
              <circle
                cx="-8"
                cy="0"
                r={26 + Math.sin(frame / 6) * 4}
                fill="none"
                stroke="#FACC15"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
            )}
          </g>

          <circle cx="0" cy="0" r="8" fill="#FACC15" stroke="#09090B" strokeWidth="2.5" />
        </g>

        {/* BOTTOM RPM DIFFERENTIAL COMPARISON BARS */}
        {showRpmBars && (
          <g transform="translate(45, 368)">
            <rect
              x="0"
              y="0"
              width="790"
              height="76"
              rx="14"
              fill="rgba(9, 9, 11, 0.85)"
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="1.5"
            />
            <text
              x="20"
              y="30"
              fill="#38BDF8"
              fontFamily={typography.monoFont}
              fontSize="16"
              fontWeight="800"
            >
              MOTOR DEPAN (M1/M2): {liveFrontRpm} RPM
            </text>
            <rect
              x="20"
              y="42"
              width={frontBarWidth}
              height="16"
              rx="6"
              fill="#38BDF8"
            />

            <text
              x="415"
              y="30"
              fill="#EF4444"
              fontFamily={typography.monoFont}
              fontSize="16"
              fontWeight="800"
            >
              MOTOR BELAKANG (M3/M4): {liveRearRpm} RPM
            </text>
            <rect
              x="415"
              y="42"
              width={rearBarWidth}
              height="16"
              rx="6"
              fill="#EF4444"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
