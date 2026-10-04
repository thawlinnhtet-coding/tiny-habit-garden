export type LightingPreference = "auto" | "day" | "night";
export type Lighting = "day" | "night";
export const lightingStorageKey = "tiny-habit-garden:lighting:v1";

export function readLightingPreference(
  value: string | null,
): LightingPreference {
  return value === "day" || value === "night" ? value : "auto";
}

export function resolveLighting(
  preference: LightingPreference,
  hour: number,
): Lighting {
  return preference === "auto"
    ? hour >= 6 && hour < 18
      ? "day"
      : "night"
    : preference;
}

// Fixed code only: share the same rules with the provider without a first-paint flash.
export const lightingBootstrap = `(() => {
  const read = (${readLightingPreference.toString()});
  const resolve = (${resolveLighting.toString()});
  let preference = "auto";
  try { preference = read(localStorage.getItem(${JSON.stringify(lightingStorageKey)})); } catch {}
  document.documentElement.dataset.gardenTheme = resolve(preference, new Date().getHours());
})();`;
