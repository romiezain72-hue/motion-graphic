import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { audioTimestamps, themeConfig } from "../projectLoader";

export interface WordSyncCaptionProps {
  y?: number;
}

interface WordItem {
  word: string;
  sceneId: string;
  startMs: number;
  endMs: number;
  startFrame: number;
  endFrame: number;
  isHighlighted: boolean;
}

interface CaptionChunk {
  sceneId: string;
  text?: string;
  startMs: number;
  endMs: number;
  startFrame?: number;
  endFrame?: number;
  words: WordItem[];
}

const FORBIDDEN_DANGLING = new Set([
  "di",
  "ke",
  "dari",
  "pada",
  "untuk",
  "dengan",
  "yang",
  "dan",
  "atau",
  "saat",
  "agar",
  "karena",
  "hingga",
  "demi",
  "seperti",
]);

/**
 * <WordSyncCaption /> (v3 Phrase-Aware Semantic Chunking + Zero-Drift Acoustic Sync):
 * - Consumes `audioTimestamps.captionChunks` generated from `02_script.json` semanticChunks
 *   (2–5 words per group that form a complete grammatical phrase/clause, NEVER splitting
 *   phrases like "menunduk miring ke depan," across two different caption screens).
 * - Syncs directly to frame-accurate acoustic speech-burst timestamps with snappy spring physics.
 */
export const WordSyncCaption: React.FC<WordSyncCaptionProps> = ({ y = 1420 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, typography } = themeConfig;

  const currentTimeMs = (frame / fps) * 1000;

  const chunks = useMemo<CaptionChunk[]>(() => {
    const prebuilt = (
      audioTimestamps as unknown as { captionChunks?: CaptionChunk[] }
    ).captionChunks;

    if (prebuilt && prebuilt.length > 0) {
      const cloned = prebuilt.map((c) => ({
        ...c,
        endMs: c.endMs + 140,
      }));
      for (let i = 0; i < cloned.length - 1; i++) {
        cloned[i].endMs = Math.min(cloned[i].endMs, cloned[i + 1].startMs);
      }
      return cloned;
    }

    // Fallback grammar-aware semantic chunker if captionChunks is not pre-populated
    const rawWords = (audioTimestamps.words || []) as WordItem[];
    if (rawWords.length === 0) return [];

    const result: CaptionChunk[] = [];
    let currentScene = rawWords[0].sceneId;
    let buffer: WordItem[] = [];

    const flushBuffer = () => {
      if (buffer.length === 0) return;
      result.push({
        sceneId: buffer[0].sceneId,
        startMs: buffer[0].startMs,
        endMs: buffer[buffer.length - 1].endMs + 140,
        words: [...buffer],
      });
      buffer = [];
    };

    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      if (w.sceneId !== currentScene) {
        flushBuffer();
        currentScene = w.sceneId;
      }
      buffer.push(w);
      const clean = w.word.toLowerCase().replace(/[^\w]/g, "");
      const hasPunct = /[,.;:?!]$/.test(w.word);
      if (
        (hasPunct && buffer.length >= 2) ||
        (buffer.length >= 4 && !FORBIDDEN_DANGLING.has(clean)) ||
        buffer.length >= 5
      ) {
        flushBuffer();
      }
    }
    flushBuffer();

    for (let i = 0; i < result.length - 1; i++) {
      result[i].endMs = Math.min(result[i].endMs, result[i + 1].startMs);
    }

    return result;
  }, []);

  const activeChunk = chunks.find(
    (c) => currentTimeMs >= c.startMs - 30 && currentTimeMs < c.endMs
  );

  if (!activeChunk) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 85,
        right: 85,
        top: y,
        transform: "translateY(-50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        columnGap: 18,
        rowGap: 10,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      {activeChunk.words.map((item, idx) => {
        const isSpokenNow =
          currentTimeMs >= item.startMs - 15 && currentTimeMs <= item.endMs + 25;
        const isPast = currentTimeMs > item.endMs + 25;

        const popProgress = isSpokenNow
          ? spring({
              frame: Math.max(0, frame - item.startFrame),
              fps,
              config: { damping: 20, stiffness: 320, mass: 0.5 },
            })
          : 0;

        const scaleVal = isSpokenNow
          ? interpolate(popProgress, [0, 1], [1.0, 1.11])
          : 1.0;

        const liftY = isSpokenNow
          ? interpolate(popProgress, [0, 1], [0, -4])
          : 0;

        const textColor = isSpokenNow
          ? item.isHighlighted
            ? colors.accentBadge
            : colors.accentHighlight
          : item.isHighlighted && isPast
            ? colors.accentHighlight
            : colors.textPrimary;

        const wordOpacity = isSpokenNow ? 1 : isPast ? 0.96 : 0.72;

        return (
          <span
            key={`${item.startMs}-${idx}`}
            style={{
              display: "inline-block",
              fontFamily: typography.displayFont,
              fontSize: 50,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: textColor,
              opacity: wordOpacity,
              scale: String(scaleVal),
              translate: `0px ${liftY}px`,
              WebkitTextStroke: "2px rgba(4, 14, 22, 0.88)",
              paintOrder: "stroke fill",
              textShadow: isSpokenNow
                ? `0 0 24px rgba(56, 189, 248, 0.55), 0 6px 16px rgba(0, 0, 0, 0.9), 0 14px 28px rgba(0, 0, 0, 0.7)`
                : "0 5px 14px rgba(0, 0, 0, 0.9), 0 12px 24px rgba(0, 0, 0, 0.65)",
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
