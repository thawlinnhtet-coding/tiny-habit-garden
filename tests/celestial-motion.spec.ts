import { test, expect } from "@playwright/test";

// Exercise the rendered scene's CSS independently of hosted auth hydration.
// Preference persistence and the public switch are covered in lighting.spec.ts.
test("day and night crossfade with crisp sun and moon travel", async ({
  page,
}) => {
  await page.goto("/");
  const scene = page.locator(".garden-scene");
  await expect(scene).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.dataset.themeReady = "false";
    document.documentElement.dataset.gardenTheme = "day";
  });
  await expect(scene.locator(".sun-orbit")).toHaveCSS("opacity", "1");
  await page.evaluate(() => {
    // Flush the initial state before enabling and exercising transitions.
    getComputedStyle(document.querySelector(".sun-orbit")!).getPropertyValue(
      "transform",
    );
    document.documentElement.dataset.themeReady = "true";
    document.documentElement.dataset.gardenTheme = "night";
    getComputedStyle(document.querySelector(".sun-orbit")!).getPropertyValue(
      "transform",
    );
  });

  for (const selector of [".sun-orbit", ".moon-orbit"]) {
    const midpoint = await page.locator(selector).evaluate((element) => {
      const transitions = element.getAnimations();
      for (const animation of transitions) {
        animation.pause();
        animation.currentTime = 700;
      }
      const style = getComputedStyle(element);
      return {
        transitions: transitions.length,
        y: new DOMMatrixReadOnly(style.transform).m42,
        opacity: Number(style.opacity),
        rendering: getComputedStyle(element.querySelector("img")!)
          .imageRendering,
      };
    });
    expect(midpoint.transitions).toBeGreaterThan(0);
    expect(midpoint.y).toBeGreaterThan(0);
    expect(midpoint.y).toBeLessThan(112);
    expect(Number.isInteger(midpoint.y)).toBe(true);
    expect(midpoint.opacity).toBeGreaterThan(0);
    expect(midpoint.opacity).toBeLessThan(1);
    expect(midpoint.rendering).toBe("pixelated");
  }
  await scene.screenshot({ path: test.info().outputPath("twilight.png") });
  await page.evaluate(() => {
    for (const element of document.querySelectorAll(
      ".sun-orbit, .moon-orbit",
    )) {
      for (const animation of element.getAnimations()) animation.finish();
    }
  });
  await expect(scene.locator(".sun-orbit")).toHaveCSS("opacity", "0");
  await expect(scene.locator(".moon-orbit")).toHaveCSS("opacity", "1");
  await expect(scene).toHaveCSS("background-color", "rgb(33, 54, 75)");
  await scene.screenshot({ path: test.info().outputPath("night.png") });

  await page.evaluate(() => {
    document.documentElement.dataset.gardenTheme = "day";
  });
  await expect(scene.locator(".sun-orbit")).toHaveCSS("opacity", "1");
  await expect(scene.locator(".moon-orbit")).toHaveCSS("opacity", "0");
  await scene.screenshot({ path: test.info().outputPath("day.png") });
  for (const width of [280, 320, 390, 680, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    const fit = await scene.locator(".sun-orbit").evaluate((element) => {
      const orbit = element.getBoundingClientRect();
      const sky = element.closest(".scene-sky")!.getBoundingClientRect();
      return (
        orbit.left >= sky.left &&
        orbit.right <= sky.right &&
        orbit.bottom <= sky.bottom
      );
    });
    expect(fit, `sun fits the sky at ${width}px`).toBe(true);
  }
});

test("reduced motion fades celestial sprites without travel", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".sun-orbit")).toBeAttached();
  await page.evaluate(() => {
    document.documentElement.dataset.themeReady = "true";
    document.documentElement.dataset.gardenTheme = "night";
  });
  await expect(page.locator(".moon-orbit")).toHaveCSS("opacity", "1");
  for (const selector of [".sun-orbit", ".moon-orbit"]) {
    await expect(page.locator(selector)).toHaveCSS("transform", "none");
  }
  await expect(page.locator(".pixel-moon")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".moon-orbit")).toHaveCSS(
    "transition-duration",
    "0.2s",
  );
});
