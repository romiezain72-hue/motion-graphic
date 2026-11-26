import React from "react";
import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { audioTimestamps } from "../projectLoader";

/**
 * <AudioLayer /> (Multi-Project v2):
 * 1. Plays master Voice Over from active project (`projects/<slug>/media/vo_master.mp3` or `audio/vo_master.mp3`)
 * 2. Triggers frame-accurate SFX events from `03_audio_timestamps.json` (`assets/global/sfx/...`)
 * 3. Plays ambient BGM (`assets/global/bgm/...`, looped seamlessly) with automatic volume ducking when VO speaks
 */
export const AudioLayer: React.FC = () => {
  const frame = useCurrentFrame();

  const words = (audioTimestamps.words || []) as Array<{
    startFrame: number;
    endFrame: number;
  }>;
  const firstVoFrame = words.length > 0 ? words[0].startFrame : 4;
  const lastVoFrame =
    words.length > 0
      ? words[words.length - 1].endFrame
      : audioTimestamps.totalDurationFrames - 15;

  const normalVol = audioTimestamps.bgm?.normalVolume ?? 0.22;
  const duckedVol = audioTimestamps.bgm?.duckedVolume ?? 0.06;

  // Auto-ducking envelope: ducks 8 frames before VO starts, restores 12 frames after VO ends
  const bgmVolume = interpolate(
    frame,
    [
      0,
      Math.max(1, firstVoFrame - 8),
      firstVoFrame + 4,
      lastVoFrame,
      lastVoFrame + 12,
    ],
    [normalVol, normalVol, duckedVol, duckedVol, normalVol],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const sfxEvents = (audioTimestamps.sfxEvents || []) as Array<{
    type: string;
    file: string;
    frame: number;
    volume?: number;
  }>;

  return (
    <>
      {/* Master Voice Over */}
      <Audio src={staticFile(audioTimestamps.masterAudioPath)} volume={1.0} />

      {/* Auto-Ducked Looped BGM */}
      {audioTimestamps.bgm?.trackPath && (
        <Audio
          loop
          src={staticFile(audioTimestamps.bgm.trackPath)}
          volume={bgmVolume}
        />
      )}

      {/* Frame-Accurate SFX Events */}
      {sfxEvents.map((sfx, idx) => (
        <Sequence
          key={`${sfx.type}-${sfx.frame}-${idx}`}
          from={sfx.frame}
          durationInFrames={90}
          layout="none"
        >
          <Audio src={staticFile(sfx.file)} volume={sfx.volume ?? 0.48} />
        </Sequence>
      ))}
    </>
  );
};
