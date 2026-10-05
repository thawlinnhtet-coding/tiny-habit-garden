# Pixel art and celestial motion

User-requested refinements on 2026-10-05:

- Improve the resolution and clarity of all garden sprites: every growth stage, seeds, trees, clouds, rocks, grass, soil, fences, butterflies, watering effects, sun, moon, and night decorations.
- Preserve actual pixel art with transparent PNGs, reproducible generation, and nearest-neighbor rendering. Keep moving sprites sharp without stretching or rotating their pixel grids.
- Prevent plant and label overlap on phones and tablets. Fit the garden from narrow phones through wide desktop screens, retaining usable plots.
- Replace the awkward sun with a round natural-looking pixel disk, warm shading, and distinct rays.
- Animate changes in both directions between day and night: the sun sets or rises, the moon rises or sets, and the scene palette changes smoothly. Keep reduced-motion feedback with a brief fade and no celestial travel.
- Preserve device-time Auto mode, manual lighting preferences, authentication, habit persistence, daily completion, streaks, and permanent plant growth.

Verification uses the rendered garden CSS for geometry and celestial transitions, independently of hosted authentication. Existing public lighting tests cover the switch and preference behavior. No new product feature or growth rule is introduced.
