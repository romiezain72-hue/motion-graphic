import React from "react";
import { Composition } from "remotion";
import { ReelsComposition } from "./ReelsComposition";
import { audioTimestamps } from "./projectLoader";

export const RemotionRoot: React.FC = () => {
  const durationInFrames = Math.max(
    audioTimestamps.totalDurationFrames || 1200,
    180
  );

  return (
    <>
      <Composition
        id="ReelsComposition"
        component={ReelsComposition}
        durationInFrames={durationInFrames}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
