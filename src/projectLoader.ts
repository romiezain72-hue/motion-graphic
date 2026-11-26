/**
 * Multi-Project Dynamic Loader (`src/projectLoader.ts`)
 * Auto-generated & synchronized by `scripts/build_reel.py`.
 * Reads `active_project.json` at the root of the workspace and resolves the active
 * project's JSON contracts (`03_audio_timestamps.json`, `04_storyboard.json`, `theme_config.json`).
 */
import activeProjectConfig from "../active_project.json";

import p_001_cat_righting_reflex_Audio from "../projects/001_cat-righting-reflex/03_audio_timestamps.json";
import p_001_cat_righting_reflex_Storyboard from "../projects/001_cat-righting-reflex/04_storyboard.json";
import p_001_cat_righting_reflex_Theme from "../projects/001_cat-righting-reflex/theme_config.json";
import p__template_Audio from "../projects/_template/03_audio_timestamps.json";
import p__template_Storyboard from "../projects/_template/04_storyboard.json";
import p__template_Theme from "../projects/_template/theme_config.json";

const PROJECT_REGISTRY = {
  "001_cat-righting-reflex": {
    audioTimestamps: p_001_cat_righting_reflex_Audio,
    storyboard: p_001_cat_righting_reflex_Storyboard,
    themeConfig: p_001_cat_righting_reflex_Theme,
  },
  "_template": {
    audioTimestamps: p__template_Audio,
    storyboard: p__template_Storyboard,
    themeConfig: p__template_Theme,
  },
} as const;

export type ProjectSlug = keyof typeof PROJECT_REGISTRY;

export const activeProjectSlug: ProjectSlug =
  activeProjectConfig.activeProject in PROJECT_REGISTRY
    ? (activeProjectConfig.activeProject as ProjectSlug)
    : "001_cat-righting-reflex";

const activeBundle = PROJECT_REGISTRY[activeProjectSlug];

export const audioTimestamps = activeBundle.audioTimestamps;
export const storyboard = activeBundle.storyboard;
export const themeConfig = activeBundle.themeConfig;
