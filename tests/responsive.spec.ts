import { test, expect } from "@playwright/test";

test("phone header fits beside the logo with comfortable control targets", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.locator("header");
  const night = header.getByRole("switch", { name: "Night mode" });
  await expect(night).toBeEnabled();

  for (const width of [320, 360, 375, 390, 430, 600]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    const brand = await header
      .getByRole("link", { name: "Tiny Habit Garden." })
      .boundingBox();
    const tools = await page.locator(".header-tools").boundingBox();
    const nav = await header.getByRole("navigation").boundingBox();
    expect(brand).not.toBeNull();
    expect(tools).not.toBeNull();
    expect(nav).not.toBeNull();
    if (!brand || !tools || !nav) throw new Error("Header is not visible.");
    expect(
      Math.abs(brand.y + brand.height / 2 - tools.y - tools.height / 2),
    ).toBeLessThan(2);
    expect(brand.x + brand.width).toBeLessThanOrEqual(tools.x);
    expect(nav.y).toBeGreaterThanOrEqual(tools.y + tools.height);
    expect(tools.x + tools.width).toBeLessThanOrEqual(width);

    for (const target of [
      night,
      header.getByRole("button", { name: "Auto", exact: true }),
      header.getByRole("button", { name: "Account menu" }),
      header.getByRole("link", { name: "My Garden", exact: true }),
      header.getByRole("link", { name: "Today", exact: true }),
    ]) {
      await expect(async () => {
        const box = await target.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }).toPass({ timeout: 5000 });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 320, height: 844 });
  await night.click();
  await header.getByRole("button", { name: "Auto", exact: true }).click();
  await expect(
    header.getByRole("button", { name: "Auto", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await header.getByRole("link", { name: "Today", exact: true }).click();
  await page.waitForURL("**/today");
});

test("primary pages reflow at 320px with doubled text size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of [
    "/",
    "/login",
    "/signup",
    "/garden",
    "/today",
    "/habits/new",
  ]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth), {
        message: `The ${route} page must reflow without horizontal scrolling`,
      })
      .toBeLessThanOrEqual(320);
  }
});

test("garden plots and pixel sprites fit from narrow phones through wide screens", async ({
  page,
}) => {
  await page.goto("/");
  const scene = page.locator(".garden-scene.compact-scene");
  await expect(scene).toBeVisible();
  // Promote the server-rendered landing preview to the full-scene layout and
  // fill its beds. This keeps the geometry check independent of account auth.
  await scene.evaluate((element) => {
    element.classList.remove("compact-scene");
    const beds = element.querySelector<HTMLElement>(".garden-beds");
    if (!beds) throw new Error("Landing garden has no beds.");
    beds.replaceChildren(
      ...Array.from({ length: 8 }, (_, index) => {
        const plot = document.createElement("button");
        plot.className = "garden-plot planted-plot";
        plot.type = "button";
        const sprite = document.createElement("img");
        sprite.className = "pixel-sprite plant-sprite";
        sprite.src = `/sprites/${index % 2 ? "sunflower-5" : "oak-5"}.png`;
        sprite.width = 144;
        sprite.height = 144;
        const label = document.createElement("span");
        label.className = "plant-name-tag";
        label.textContent = `A wonderfully long plant name ${index + 1}`;
        plot.append(sprite, label);
        return plot;
      }),
    );
  });
  const fullScene = page.locator(".garden-scene:not(.compact-scene)");
  await expect(fullScene).toBeVisible();
  await fullScene.scrollIntoViewIfNeeded();
  await fullScene.evaluate((element) => {
    for (const sprite of element.querySelectorAll("img"))
      sprite.loading = "eager";
  });
  await expect
    .poll(() =>
      fullScene.evaluate((element) =>
        [...element.querySelectorAll("img")].every(
          (sprite) => sprite.complete && sprite.naturalWidth === 144,
        ),
      ),
    )
    .toBe(true);

  for (const width of [
    280, 320, 340, 360, 390, 430, 600, 601, 680, 681, 768, 900, 1050, 1280,
    1920,
  ]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const sceneElement = document.querySelector<HTMLElement>(
        ".garden-scene:not(.compact-scene)",
      );
      const beds = document.querySelector<HTMLElement>(".garden-beds");
      if (!sceneElement || !beds) return null;
      const sceneBox = sceneElement.getBoundingClientRect();
      const plots = [...document.querySelectorAll<HTMLElement>(".garden-plot")];
      const sprites = [
        ...sceneElement.querySelectorAll<HTMLImageElement>("img"),
      ];
      const columns = getComputedStyle(beds)
        .gridTemplateColumns.split(" ")
        .filter(Boolean).length;
      return {
        documentWidth: document.documentElement.scrollWidth,
        sceneLeft: sceneBox.left,
        sceneRight: sceneBox.right,
        columns,
        plots: plots.map((plot) => {
          const box = plot.getBoundingClientRect();
          const tag = plot
            .querySelector<HTMLElement>(".plant-name-tag")
            ?.getBoundingClientRect();
          const sprite = plot
            .querySelector<HTMLImageElement>("img")
            ?.getBoundingClientRect();
          return {
            left: box.left,
            right: box.right,
            tagLeft: tag?.left,
            tagRight: tag?.right,
            spriteLeft: sprite?.left,
            spriteRight: sprite?.right,
          };
        }),
        sprites: sprites.map((sprite) => ({
          loaded: sprite.complete && sprite.naturalWidth === 144,
          rendering: getComputedStyle(sprite).imageRendering,
          source: new URL(sprite.currentSrc || sprite.src, document.baseURI)
            .pathname,
        })),
      };
    });

    expect(layout, `garden should render at ${width}px`).not.toBeNull();
    if (!layout) throw new Error("Garden scene did not render.");
    expect(
      layout.documentWidth,
      `page must fit at ${width}px`,
    ).toBeLessThanOrEqual(width);
    expect(layout.columns, `plot columns at ${width}px`).toBe(
      width <= 340 ? 2 : width <= 680 ? 3 : 4,
    );
    for (const plot of layout.plots) {
      expect(plot.left, `plot left edge at ${width}px`).toBeGreaterThanOrEqual(
        layout.sceneLeft,
      );
      expect(plot.right, `plot right edge at ${width}px`).toBeLessThanOrEqual(
        layout.sceneRight,
      );
      if (plot.spriteLeft !== undefined && plot.spriteRight !== undefined) {
        expect(
          plot.spriteLeft,
          `plant left edge at ${width}px`,
        ).toBeGreaterThanOrEqual(plot.left);
        expect(
          plot.spriteRight,
          `plant right edge at ${width}px`,
        ).toBeLessThanOrEqual(plot.right);
      }
      if (plot.tagLeft !== undefined && plot.tagRight !== undefined) {
        expect(
          plot.tagLeft,
          `plant label left edge at ${width}px`,
        ).toBeGreaterThanOrEqual(plot.left);
        expect(
          plot.tagRight,
          `plant label right edge at ${width}px`,
        ).toBeLessThanOrEqual(plot.right);
      }
    }
    expect(layout.sprites.length).toBeGreaterThan(0);
    for (const sprite of layout.sprites) {
      expect(
        sprite.loaded,
        `${sprite.source} should load at 144px source resolution`,
      ).toBe(true);
      expect(sprite.rendering).toBe("pixelated");
    }
  }
});
