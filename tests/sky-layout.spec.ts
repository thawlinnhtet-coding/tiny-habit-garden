import { test, expect } from "@playwright/test";

test("sun and moon have clear space through every cloud drift on small screens", async ({
  page,
}) => {
  // This regression covers rendered CSS, so prevent hosted-auth hydration from
  // changing the manually pinned lighting while viewport sizes are sampled.
  await page.route(/\/_next\/.*\.js(?:\?|$)/, (route) => route.abort());
  await page.goto("/");
  const scene = page.locator(".garden-scene");
  await expect(scene).toBeVisible();
  await scene.scrollIntoViewIfNeeded();
  await scene.evaluate((element) => {
    for (const sprite of element.querySelectorAll("img"))
      sprite.loading = "eager";
  });
  await expect
    .poll(() =>
      scene.evaluate((element) =>
        [...element.querySelectorAll(".scene-sky img")].every(
          (sprite) =>
            (sprite as HTMLImageElement).complete &&
            (sprite as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);

  for (const compact of [false, true]) {
    await scene.evaluate((element, value) => {
      element.classList.toggle("compact-scene", value);
      const main = element.closest("main")!;
      if (value) {
        main.querySelector(".landing-world")!.append(element);
        main.querySelector("#full-scene-harness")?.remove();
      } else {
        const host = document.createElement("div");
        host.id = "full-scene-harness";
        main.append(host);
        host.append(element);
      }
    }, compact);
    for (const width of [
      390, 280, 320, 360, 430, 600, 680, 768, 900, 1280, 1920,
    ]) {
      await page.setViewportSize({ width, height: 844 });
      for (const theme of ["night", "day"] as const) {
        await page.evaluate((value) => {
          document.documentElement.dataset.themeReady = "false";
          document.documentElement.dataset.gardenTheme = value;
          // Pin the celestial body while sampling the full cloud animation.
          for (const element of document.querySelectorAll(
            ".sun-orbit, .moon-orbit",
          )) {
            for (const animation of element.getAnimations()) animation.cancel();
          }
          for (const animation of document.getAnimations()) {
            if (animation instanceof CSSTransition) animation.finish();
          }
        }, theme);
        await expect(
          scene.locator(theme === "day" ? ".sun-orbit" : ".moon-orbit"),
        ).toHaveCSS("opacity", "1");
        await expect(
          scene.locator(theme === "day" ? ".sun-orbit" : ".moon-orbit"),
        ).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
        const samples = await scene.evaluate((element, value) => {
          const sky = element.querySelector<HTMLElement>(".scene-sky")!;
          const body = sky.querySelector<HTMLImageElement>(
            value === "day" ? ".pixel-sun" : ".pixel-moon",
          )!;
          const decorations = [
            ...sky.querySelectorAll<HTMLImageElement>(
              value === "night" ? ".cloud, .night-star img" : ".cloud",
            ),
          ].filter((cloud) => cloud.getClientRects().length > 0);
          const bounds = (image: HTMLImageElement) => {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext("2d")!;
            context.drawImage(image, 0, 0);
            const pixels = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            ).data;
            let left = canvas.width,
              top = canvas.height,
              right = 0,
              bottom = 0;
            for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                if (pixels[(y * canvas.width + x) * 4 + 3] > 0) {
                  left = Math.min(left, x);
                  top = Math.min(top, y);
                  right = Math.max(right, x + 1);
                  bottom = Math.max(bottom, y + 1);
                }
              }
            }
            const box = image.getBoundingClientRect();
            return {
              left: box.left + (left / canvas.width) * box.width,
              right: box.left + (right / canvas.width) * box.width,
              top: box.top + (top / canvas.height) * box.height,
              bottom: box.top + (bottom / canvas.height) * box.height,
            };
          };
          for (const animation of body.getAnimations()) {
            animation.pause();
            animation.currentTime = 0;
          }
          const bodyBox = bounds(body);
          const skyBox = sky.getBoundingClientRect();
          const result: { cloud: string; phase: number; overlap: boolean }[] = [
            {
              cloud: "celestial body must fit inside sky",
              phase: 0,
              overlap:
                bodyBox.left < skyBox.left ||
                bodyBox.right > skyBox.right ||
                bodyBox.top < skyBox.top ||
                bodyBox.bottom > skyBox.bottom,
            },
          ];
          for (const cloud of decorations) {
            const animations = cloud.getAnimations();
            for (let step = 0; step <= 10; step++) {
              const phase = step / 10;
              for (const animation of animations) {
                animation.pause();
                const timing = animation.effect!.getTiming();
                animation.currentTime =
                  Number(timing.duration) * phase + (timing.delay ?? 0);
              }
              const cloudBox = bounds(cloud);
              result.push({
                cloud: cloud.className,
                phase,
                overlap:
                  cloudBox.left < bodyBox.right &&
                  cloudBox.right > bodyBox.left &&
                  cloudBox.top < bodyBox.bottom &&
                  cloudBox.bottom > bodyBox.top,
              });
            }
          }
          return result;
        }, theme);
        for (const sample of samples) {
          expect(
            sample.overlap,
            `${compact ? "compact" : "full"} ${theme} at ${width}px: ${sample.cloud} phase ${sample.phase}`,
          ).toBe(false);
        }
        if ([390, 768].includes(width)) {
          await scene.screenshot({
            path: test
              .info()
              .outputPath(
                `${compact ? "compact" : "full"}-${theme}-${width}.png`,
              ),
          });
        }
      }
    }
  }
});
