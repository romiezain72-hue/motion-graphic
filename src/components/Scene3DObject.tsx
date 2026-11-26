import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { evalSpringPreset } from "../motionCurves";
import { themeConfig } from "../projectLoader";

export type Scene3DVariant =
  | "wireframe_globe"
  | "lowpoly_planet"
  | "floating_chip_3d"
  | "neural_core_3d"
  | "torus_knot_3d";

export interface Scene3DObjectProps {
  enabled?: boolean;
  variant?: Scene3DVariant;
  x?: number;
  y?: number;
  size?: number;
  opacity?: number;
  rotationSpeed?: number;
  enterAtRelativeFrame?: number;
}

/**
 * <Scene3DObject /> (v3 Smooth 60fps 3D Studio Engine via @remotion/three):
 * - 100% deterministic frame-driven quaternion/Euler rotation & spring scale
 * - 5 Procedural 3D Variants for Science, Tech, AI, Hardware, and Editorial explainers:
 *   1. `wireframe_globe`: Geodesic wireframe Earth/sphere + glowing core + dual orbital rings
 *   2. `lowpoly_planet`: Faceted planetary body with flat-shaded studio lighting
 *   3. `floating_chip_3d`: Isometric 3D silicon processor slab with metallic sheen & pin grid
 *   4. `neural_core_3d`: 3-axis counter-rotating gyroscope rings around an octahedral AI core
 *   5. `torus_knot_3d`: High-precision mathematical torus knot for physics/paradox scenes
 */
export const Scene3DObject: React.FC<Scene3DObjectProps> = ({
  enabled = true,
  variant = "wireframe_globe",
  x = 800,
  y = 660,
  size = 460,
  opacity = 0.32,
  rotationSpeed = 1.0,
  enterAtRelativeFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = themeConfig;

  if (!enabled) {
    return null;
  }

  const relFrame = Math.max(0, frame - enterAtRelativeFrame);
  const popScale = evalSpringPreset(relFrame, fps, "satSetSnap");

  const rotY = frame * 0.016 * rotationSpeed;
  const rotX = 0.32 + Math.sin(frame / 36) * 0.12;
  const floatY = Math.sin(frame / 24) * 0.12;
  const meshScale = interpolate(popScale, [0, 1], [0.25, 1.42]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        opacity: interpolate(relFrame, [0, 14], [0, opacity], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        zIndex: 8,
        pointerEvents: "none",
      }}
    >
      <ThreeCanvas width={size} height={size}>
        {/* 3-Point Studio Lighting Setup */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 7, 6]} intensity={1.45} />
        <directionalLight
          position={[-6, -4, -3]}
          intensity={0.65}
          color={colors.accentSecondary}
        />

        <group
          position={[0, floatY, 0]}
          rotation={[rotX, rotY, -0.16]}
          scale={[meshScale, meshScale, meshScale]}
        >
          {/* VARIANT 1 & 2: GLOBE / PLANET */}
          {(variant === "wireframe_globe" || variant === "lowpoly_planet") && (
            <>
              <mesh>
                <sphereGeometry args={[1.15, 24, 18]} />
                <meshStandardMaterial
                  color={colors.accentHighlight}
                  wireframe
                  transparent
                  opacity={0.78}
                />
              </mesh>
              {variant === "lowpoly_planet" && (
                <mesh>
                  <icosahedronGeometry args={[0.94, 2]} />
                  <meshStandardMaterial
                    color={colors.bgSecondary}
                    roughness={0.5}
                    metalness={0.25}
                    flatShading
                  />
                </mesh>
              )}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.42, 0.016, 14, 72]} />
                <meshStandardMaterial color={colors.accentHighlight} />
              </mesh>
              <mesh rotation={[0.48, 0.35, 0]}>
                <torusGeometry args={[1.56, 0.012, 12, 72]} />
                <meshStandardMaterial color={colors.accentBadge} />
              </mesh>
            </>
          )}

          {/* VARIANT 3: 3D SILICON CHIP / HARDWARE MONOLITH */}
          {variant === "floating_chip_3d" && (
            <>
              {/* Outer Substrate Slab */}
              <mesh>
                <boxGeometry args={[1.65, 0.18, 1.65]} />
                <meshStandardMaterial
                  color={colors.surfaceCard || "#14151C"}
                  metalness={0.65}
                  roughness={0.3}
                />
              </mesh>
              {/* Inner Glowing Die */}
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.95, 0.08, 0.95]} />
                <meshStandardMaterial
                  color={colors.accentHighlight}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Wireframe Bounding Cage */}
              <mesh>
                <boxGeometry args={[1.82, 0.32, 1.82]} />
                <meshStandardMaterial
                  color={colors.accentSecondary}
                  wireframe
                  transparent
                  opacity={0.45}
                />
              </mesh>
            </>
          )}

          {/* VARIANT 4: 3D NEURAL GYROSCOPE CORE */}
          {variant === "neural_core_3d" && (
            <>
              <mesh rotation={[rotY * 1.4, -rotY, 0]}>
                <octahedronGeometry args={[0.72, 0]} />
                <meshStandardMaterial
                  color={colors.accentBadge}
                  metalness={0.5}
                  roughness={0.2}
                  flatShading
                />
              </mesh>
              <mesh rotation={[rotY, 0, 0]}>
                <torusGeometry args={[1.15, 0.025, 16, 80]} />
                <meshStandardMaterial color={colors.accentHighlight} />
              </mesh>
              <mesh rotation={[0, rotY * 1.3, Math.PI / 3]}>
                <torusGeometry args={[1.38, 0.02, 16, 80]} />
                <meshStandardMaterial color={colors.accentSecondary} />
              </mesh>
              <mesh rotation={[Math.PI / 4, -rotY * 0.9, 0]}>
                <torusGeometry args={[1.58, 0.015, 14, 80]} />
                <meshStandardMaterial color={colors.accentBadge} />
              </mesh>
            </>
          )}

          {/* VARIANT 5: MATHEMATICAL TORUS KNOT */}
          {variant === "torus_knot_3d" && (
            <mesh>
              <torusKnotGeometry args={[0.88, 0.24, 128, 24]} />
              <meshStandardMaterial
                color={colors.accentHighlight}
                wireframe
                transparent
                opacity={0.82}
              />
            </mesh>
          )}
        </group>
      </ThreeCanvas>
    </div>
  );
};
