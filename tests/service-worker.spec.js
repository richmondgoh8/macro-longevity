import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "allow" });

for (const scope of ["/", "/macro-longevity/"]) {
  test(`installed app serves all six destinations offline at ${scope}`, async ({
    page,
    context,
  }) => {
    await page.goto(scope);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await expect(page.getByRole("button", { name: "Update app" })).toBeHidden();
    await context.setOffline(true);
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [label, heading] of [
      ["Food", "Weekday meals"],
      ["Food Labels", "Read food labels"],
      ["Health", "Screening and results"],
      ["Supplements", "Supplements"],
      ["Skin Care", "Skin care"],
      ["Overview", "Live healthier for longer"],
    ]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      expect(new URL(page.url()).pathname.startsWith(scope)).toBe(true);
      if (label === "Food") {
        expect(
          await page
            .locator(".food-image")
            .evaluate((img) => img.decode().then(() => img.naturalWidth)),
        ).toBeGreaterThan(0);
        const plate = page.locator(".meal-plate img");
        await plate.scrollIntoViewIfNeeded();
        expect(
          await plate.evaluate((img) =>
            img.decode().then(() => img.naturalWidth),
          ),
        ).toBeGreaterThan(0);
        await page
          .getByRole("link", { name: "Glucose and HbA1c", exact: true })
          .click();
        await expect(
          page.getByRole("heading", {
            name: "Build meals for steadier glucose",
          }),
        ).toBeInViewport();
        await expect(
          page.getByRole("link", { name: "Glucose and HbA1c", exact: true }),
        ).toHaveAttribute("aria-current", "location");
        await page
          .getByRole("link", { name: "Hydration", exact: true })
          .click();
        await expect(
          page.getByRole("heading", { name: "Drink water regularly" }),
        ).toBeInViewport();
      }
      if (label === "Food Labels") {
        await expect(
          page.getByRole("heading", { name: "Spot ultra-processed foods" }),
        ).toBeVisible();
        const scale = page.locator(".sugar-comparison img");
        await scale.scrollIntoViewIfNeeded();
        expect(
          await scale.evaluate((img) =>
            img.decode().then(() => img.naturalWidth),
          ),
        ).toBeGreaterThan(0);
      }
      if (label === "Supplements") {
        await expect(
          page.getByRole("heading", { name: "Creatine monohydrate" }),
        ).toBeVisible();
        await page
          .getByRole("link", { name: "Psyllium husk", exact: true })
          .click();
        await expect(
          page.getByRole("heading", { name: "Psyllium husk", exact: true }),
        ).toBeInViewport();
      }
      if (label === "Skin Care") {
        await expect(
          page.getByRole("heading", {
            name: "Singapore cosmetic safety warnings",
          }),
        ).toBeVisible();
        await page
          .getByRole("link", { name: "What to do after suspected exposure" })
          .click();
        expect(new URL(page.url()).pathname).toBe(
          `${scope}pages/food-labels.html`,
        );
        await expect(
          page.getByRole("heading", {
            name: "Suspected mercury or heavy-metal exposure",
          }),
        ).toBeInViewport();
      }
      if (label === "Health") {
        await expect(
          page.getByRole("button", { name: "Save results" }),
        ).toBeEnabled();
        expect(
          await page
            .locator(".report-example img")
            .evaluate((img) => img.decode().then(() => img.naturalWidth)),
        ).toBeGreaterThan(0);
        await page.getByText("Open the HbA1c log", { exact: true }).click();
        await expect(page.getByLabel("Date on the report")).toBeVisible();
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.getByRole("button", { name: "Download health results" }).click(),
        ]);
        expect(download.suggestedFilename()).toBe(
          "macro-longevity-health-results.json",
        );
      }
    }
    await expect(
      page.getByRole("heading", { name: "Illness prevention and recovery" }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Moderate aerobic activity each week" })
      .click();
    const walkingWeek = page.locator(".walking-plan img");
    await walkingWeek.scrollIntoViewIfNeeded();
    expect(
      await walkingWeek.evaluate((img) =>
        img.decode().then(() => img.naturalWidth),
      ),
    ).toBeGreaterThan(0);
    await page
      .getByRole("link", { name: "Sleep and insomnia guide", exact: true })
      .click();
    await page
      .getByRole("link", { name: "Chamomile, glycine and taurine" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Tea and supplements for sleep" }),
    ).toBeInViewport();
    expect(new URL(page.url()).pathname).toBe(`${scope}pages/supplements.html`);
    await page.goto(`${scope}pages/workout.html`);
    await expect(
      page.getByRole("heading", { name: "This page is unavailable offline" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Overview" }).click();
    await expect(
      page.getByRole("heading", { name: "High-impact priorities" }),
    ).toBeVisible();
  });
}

test("an open app checks for releases without a reload", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    window.updateChecks = 0;
    const update = ServiceWorkerRegistration.prototype.update;
    ServiceWorkerRegistration.prototype.update = function () {
      window.updateChecks += 1;
      return update.call(this);
    };
  });
  await page.goto("/macro-longevity/");
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  const initial = await page.evaluate(() => window.updateChecks);
  await page.clock.fastForward(121_000);
  await expect
    .poll(() => page.evaluate(() => window.updateChecks))
    .toBeGreaterThan(initial);
  await expect(page.getByRole("button", { name: "Update app" })).toBeHidden();
});

test("Update app activates the waiting release and preserves saved results", async ({
  page,
  context,
}) => {
  const prefix = "/macro-longevity/";
  const worker = `${prefix}sw.js`;
  await page.goto(`${prefix}offline.html`);
  await page.evaluate(async (worker) => {
    localStorage.setItem(
      "sg-health-baseline-v1",
      JSON.stringify({
        values: { ldl: "98" },
        units: { ldl: "mg/dL" },
      }),
    );
    await navigator.serviceWorker.register(`${worker}?legacy`);
  }, worker);
  await page.waitForFunction(() =>
    navigator.serviceWorker.controller?.scriptURL.endsWith("?legacy"),
  );
  await page.goto(`${prefix}pages/finance.html`);
  await expect(
    page.getByRole("heading", { name: "Finance & FIRE" }),
  ).toBeVisible();
  await page.goto(`${prefix}pages/blood.html`);
  await expect
    .poll(() =>
      page.evaluate(
        async () =>
          (await navigator.serviceWorker.getRegistration())?.waiting?.state,
      ),
    )
    .toBe("installed");

  const update = page.getByRole("button", { name: "Update app" });
  await expect(update).toBeVisible();
  const viewport = page.viewportSize();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(viewport.width);
  await page.setViewportSize({ ...viewport, width: 768 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(768);
  await page.setViewportSize(viewport);

  const otherTab = await context.newPage();
  await otherTab.goto(`${prefix}pages/blood.html`);
  await expect(
    otherTab.getByRole("button", { name: "Update app" }),
  ).toBeVisible();
  const otherReading = otherTab.getByLabel("LDL cholesterol", { exact: true });
  await otherReading.fill("100");
  const reading = page.getByLabel("LDL cholesterol", { exact: true });
  await reading.fill("101");

  // The waiting worker has already cached the release, so the update works offline.
  await context.setOffline(true);
  await Promise.all([
    page.waitForEvent("dialog").then(async (dialog) => {
      expect(dialog.type()).toBe("beforeunload");
      await dialog.dismiss();
    }),
    update.click(),
  ]);
  await expect(reading).toHaveValue("101");
  await expect(update).toBeEnabled();
  await Promise.all([
    page.waitForEvent("dialog").then(async (dialog) => {
      expect(dialog.type()).toBe("beforeunload");
      await dialog.accept();
    }),
    page.waitForEvent("framenavigated", (frame) => frame === page.mainFrame()),
    update.click(),
  ]);
  await page.waitForFunction(
    (worker) => navigator.serviceWorker.controller?.scriptURL.endsWith(worker),
    worker,
  );
  await expect(update).toBeHidden();
  await expect(page.getByLabel("LDL cholesterol", { exact: true })).toHaveValue(
    "98",
  );
  await expect(page.getByLabel("LDL cholesterol report unit")).toHaveValue(
    "mg/dL",
  );
  expect(await page.evaluate(() => caches.keys())).toEqual([
    "macro-longevity:/macro-longevity/:v27",
  ]);
  expect(
    await page.evaluate(
      async () =>
        (
          await (
            await navigator.serviceWorker.getRegistration()
          ).navigationPreload.getState()
        ).enabled,
    ),
  ).toBe(false);

  // Applying the update in one tab leaves other open tabs and their drafts in place.
  await expect(otherReading).toHaveValue("100");
  const otherUpdate = otherTab.getByRole("button", { name: "Update app" });
  await Promise.all([
    otherTab.waitForEvent("dialog").then(async (dialog) => {
      expect(dialog.type()).toBe("beforeunload");
      await dialog.accept();
    }),
    otherTab.waitForEvent(
      "framenavigated",
      (frame) => frame === otherTab.mainFrame(),
    ),
    otherUpdate.click(),
  ]);
  await expect(otherUpdate).toBeHidden();
  await expect(otherReading).toHaveValue("98");
  await context.setOffline(false);
  for (const path of ["finance", "protocol", "avoid", "workout"]) {
    expect((await page.goto(`${prefix}pages/${path}.html`)).status()).toBe(404);
  }
});
