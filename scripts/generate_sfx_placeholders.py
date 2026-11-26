#!/usr/bin/env python3
"""
Generates clean, procedural synthesized SFX (.wav) and ambient BGM bed (.wav)
in both assets/ and public/assets/ using Python's built-in wave & math modules,
so Remotion's staticFile() can load them directly during preview and render.
"""

import math
import random
import shutil
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            frames.extend(struct.pack("<h", int(clamped * 32767)))
        wf.writeframes(bytes(frames))


def gen_pop(duration: float = 0.09) -> list[float]:
    n = int(SAMPLE_RATE * duration)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        freq = 140 + 380 * math.exp(-t * 45)
        env = math.sin(math.pi * min(1.0, t / 0.006)) * math.exp(-t * 35)
        out.append(math.sin(2 * math.pi * freq * t) * env * 0.85)
    return out


def gen_whoosh(duration: float = 0.26) -> list[float]:
    n = int(SAMPLE_RATE * duration)
    out = []
    random.seed(42)
    lp = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        norm = t / duration
        env = math.sin(math.pi * norm) ** 1.8
        noise = random.uniform(-1.0, 1.0)
        alpha = 0.04 + 0.18 * math.sin(math.pi * norm)
        lp = lp + alpha * (noise - lp)
        tone = math.sin(2 * math.pi * (90 + 180 * norm) * t) * 0.25
        out.append((lp * 0.9 + tone) * env * 0.75)
    return out


def gen_tick(duration: float = 0.035) -> list[float]:
    n = int(SAMPLE_RATE * duration)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 110)
        val = (math.sin(2 * math.pi * 1200 * t) + 0.5 * math.sin(2 * math.pi * 2400 * t)) * env * 0.6
        out.append(val)
    return out


def gen_riser(duration: float = 0.75) -> list[float]:
    n = int(SAMPLE_RATE * duration)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        norm = t / duration
        freq = 110 + 520 * (norm ** 2.2)
        phase += 2 * math.pi * freq / SAMPLE_RATE
        env = (norm ** 1.6) * (1.0 - max(0.0, (norm - 0.92) / 0.08))
        out.append(math.sin(phase) * env * 0.65)
    return out


def gen_highlight(duration: float = 0.32) -> list[float]:
    n = int(SAMPLE_RATE * duration)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 10)
        val = (math.sin(2 * math.pi * 1046.5 * t) * 0.6 + math.sin(2 * math.pi * 1567.98 * t) * 0.4) * env * 0.7
        out.append(val)
    return out


def gen_ambient_bgm(duration: float = 15.0) -> list[float]:
    """Warm oceanic editorial ambient pad (A minor / C major9 gentle pulse)."""
    n = int(SAMPLE_RATE * duration)
    out = []
    freqs = [110.0, 164.81, 220.0, 261.63, 329.63]
    for i in range(n):
        t = i / SAMPLE_RATE
        pulse = 0.75 + 0.25 * math.sin(2 * math.pi * 0.5 * t)
        val = 0.0
        for idx, f in enumerate(freqs):
            val += math.sin(2 * math.pi * f * t + idx * 0.7) * (0.28 / (idx + 1))
        # Fade in/out
        fade = min(1.0, t / 0.5, (duration - t) / 0.5)
        out.append(val * pulse * fade * 0.7)
    return out


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    assets_dir = root / "assets"
    public_assets = root / "public" / "assets"

    files = {
        "sfx/pop/pop_clean.wav": gen_pop(),
        "sfx/whoosh/whoosh_fast.wav": gen_whoosh(),
        "sfx/tick/tick_counter.wav": gen_tick(),
        "sfx/riser/riser_short.wav": gen_riser(),
        "sfx/highlight/chime_clean.wav": gen_highlight(),
        "bgm/curiosity_editorial.wav": gen_ambient_bgm(),
    }

    for rel, samples in files.items():
        src_path = assets_dir / rel
        pub_path = public_assets / rel
        write_wav(src_path, samples)
        pub_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src_path, pub_path)

    print("[OK] Generated SFX and ambient BGM in assets/ and public/assets/")


if __name__ == "__main__":
    main()
