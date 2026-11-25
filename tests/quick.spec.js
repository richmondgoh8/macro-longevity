import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("the six destinations work with keyboard and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("link")).toHaveText([
    "Overview",
    "Food",
    "Food Labels",
    "Health",
    "Supplements",
    "Skin Care",
  ]);
  for (const [label, heading] of [
    ["Food", "Weekday meals"],
    ["Food Labels", "Read food labels"],
    ["Health", "Screening and results"],
    ["Supplements", "Supplements"],
    ["Skin Care", "Skin care"],
    ["Overview", "Live healthier for longer"],
  ]) {
    const link = nav.getByRole("link", { name: label, exact: true });
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeVisible();
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("navigation", { name: "On this page" }),
    ).toBeVisible();
    if (label === "Supplements") {
      await expect(page.getByRole("heading", { level: 3 })).toHaveText([
        "Folic acid",
        "Vitamin D3",
        "Omega-3",
        "Creatine monohydrate",
        "Magnesium glycinate",
      ]);
    }
    if (label === "Skin Care") {
      await expect(page.getByRole("heading", { level: 3 })).toHaveText([
        "Morning",
        "Evening",
        "Sunscreen",
        "Moisturiser",
        "Gentle cleanser",
      ]);
      await page.getByRole("link", { name: "Ingredient checks" }).click();
      await expect(
        page.getByRole("heading", { name: "What to look for on the label" }),
      ).toBeInViewport();
      await expect(page.getByText("Watch for", { exact: true })).toHaveCount(3);
      await expect(
        page.getByRole("link", { name: "HSA · Adulterated cosmetic products" }),
      ).toBeVisible();
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize().width);
  }
  await page
    .getByRole("link", { name: "Skin care routine", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Skin care" }),
  ).toBeVisible();
  await nav.getByRole("link", { name: "Overview", exact: true }).click();
  await page
    .getByRole("link", { name: "Illness and recovery", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Illness prevention and recovery" }),
  ).toBeInViewport();
  const illness = page.getByRole("region", {
    name: "Illness prevention and recovery",
  });
  await expect(
    illness.getByRole("link", { name: "995", exact: true }),
  ).toHaveAttribute("href", "tel:995");
  await page.getByRole("link", { name: "Weekday meals guide" }).click();
  await page.getByRole("link", { name: "Quick meals", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Quick meals for lunch or dinner" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("heading", { name: "Chickpea and cucumber salad" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Salmon, lentils and greens" }),
  ).toBeVisible();
  const plate = page.locator(".meal-plate");
  await expect(plate.getByRole("listitem")).toHaveText([
    "½ Greens",
    "¼ Cooked lentils",
    "¼ Fish",
  ]);
  await page
    .getByRole("link", { name: "Glucose and HbA1c", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Build meals for steadier glucose" }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Review dated HbA1c results" }).click();
  await expect(
    page.getByRole("heading", { name: "Dated HbA1c results" }),
  ).toBeInViewport();
  await expect(
    page.getByText("Open the HbA1c log", { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await page.getByRole("link", { name: "Hydration", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Drink water regularly" }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Overnight oats", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Overnight oats" }),
  ).toBeInViewport();
  await expect(page.getByText("Soak the chia seeds overnight.")).toBeVisible();
  await page.getByRole("link", { name: "Psyllium husk and safe use" }).click();
  await expect(
    page.getByRole("heading", { name: "Psyllium husk", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByText("Mix it with water.", { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await page.getByRole("link", { name: "Food Labels", exact: true }).click();
  await page.getByRole("link", { name: "Sugar claims", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "“No added sugar” can still contain sugar",
    }),
  ).toBeInViewport();
  await expect(page.getByText("40 g sugar", { exact: true })).toBeVisible();
});

test("page shortcuts stay in the desktop rail and health records stay together", async ({
  page,
}) => {
  await page.goto("/pages/blood.html");
  const nav = page.getByRole("navigation", { name: "Primary" });
  const shortcuts = page.getByRole("navigation", { name: "On this page" });
  const title = page.getByRole("heading", { level: 1 });
  const history = page.getByRole("heading", {
    name: "Dated HbA1c results",
    exact: true,
  });
  const core = page.getByRole("region", { name: "Core results" });
  const screening = page.getByRole("heading", { name: "Singapore screening" });
  const desktop = page.viewportSize().width >= 1024;
  const [
    navBounds,
    shortcutsBounds,
    titleBounds,
    historyBounds,
    coreBounds,
    screeningBounds,
  ] = await Promise.all(
    [nav, shortcuts, title, history, core, screening].map((element) =>
      element.boundingBox(),
    ),
  );
  const recordsGap = historyBounds.y - (coreBounds.y + coreBounds.height);
  expect(recordsGap).toBeGreaterThan(0);
  expect(recordsGap).toBeLessThan(55);
  if (desktop) {
    expect(navBounds.y + navBounds.height).toBeLessThan(shortcutsBounds.y);
    expect(shortcutsBounds.x + shortcutsBounds.width).toBeLessThan(
      titleBounds.x,
    );
    expect(historyBounds.x).toBeLessThan(screeningBounds.x);
  } else {
    expect(navBounds.y + navBounds.height).toBeCloseTo(
      page.viewportSize().height,
    );
    expect(shortcutsBounds.y).toBeGreaterThan(
      titleBounds.y + titleBounds.height,
    );
    expect(historyBounds.y).toBeLessThan(screeningBounds.y);
  }

  await page
    .getByRole("heading", { name: "Adult vaccinations" })
    .scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const screeningShortcut = shortcuts.getByRole("link", {
    name: "Check screening",
  });
  if (desktop) {
    await expect(screeningShortcut).toBeInViewport();
    await expect(
      shortcuts.getByRole("link", { name: "Dated HbA1c results" }),
    ).toBeInViewport();
    await expect(nav.getByRole("link", { name: "Overview" })).toBeInViewport();
  } else {
    await expect(nav.getByRole("link", { name: "Overview" })).toBeInViewport();
  }
  await screeningShortcut.click();
  await expect(screening).toBeInViewport();
  await nav.getByRole("link", { name: "Food", exact: true }).click();
  await expect(
    nav.getByRole("link", { name: "Food", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("prevention and the worked label are reachable from the first screen", async ({
  page,
}) => {
  await page.goto("/");
  const prevention = page.getByRole("link", {
    name: "Choose a prevention habit",
  });
  await expect(prevention).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "Urgent help", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Moderate aerobic activity each week"),
  ).toBeInViewport();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(prevention).toHaveCSS("transition-duration", "0.14s");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(prevention).toHaveCSS("transition-duration", "0s");
  await prevention.click();
  await expect(
    page.getByRole("heading", { name: "High-impact priorities" }),
  ).toBeInViewport();

  await page
    .getByRole("link", { name: "Singapore screening guide", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Singapore screening" }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page.getByRole("link", { name: "Food Labels", exact: true }).click();
  const label = page.getByRole("table", { name: "Example nutrition panel" });
  await expect(
    label.getByRole("rowheader", { name: "Total sugars" }),
  ).toBeVisible();
  await expect(label.getByRole("cell", { name: "8 g" })).toBeVisible();
  await expect(page.getByText("40 g sugar", { exact: true })).toBeVisible();
  await expect(page.getByText("Whole 500 mL bottle")).toBeVisible();
});

test("page shortcuts follow scrolling and preserve native links and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const shortcuts = page.getByRole("navigation", { name: "On this page" });
  const vinegar = shortcuts.getByRole("link", { name: "Apple cider vinegar" });
  const vinegarGuide = page.getByRole("heading", {
    name: "Apple cider vinegar and diabetes prevention",
  });
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "smooth");
  await vinegar.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#apple-cider-vinegar$/);
  await expect(vinegarGuide).toBeInViewport();
  await expect(vinegarGuide).toBeFocused();
  await expect(vinegar).toHaveAttribute("aria-current", "location");

  const recovery = shortcuts.getByRole("link", {
    name: "Illness and recovery",
  });
  await recovery.scrollIntoViewIfNeeded();
  await shortcuts.evaluate((nav) => {
    window.__currentHistory = [];
    new MutationObserver(() => {
      const active = nav.querySelector(
        '[aria-current="location"]',
      )?.textContent;
      if (active && window.__currentHistory.at(-1) !== active)
        window.__currentHistory.push(active);
    }).observe(nav, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-current"],
    });
  });
  await recovery.click();
  await expect(
    page.getByRole("heading", { name: "Illness prevention and recovery" }),
  ).toBeInViewport();
  await expect(recovery).toHaveAttribute("aria-current", "location");
  expect(await page.evaluate(() => window.__currentHistory)).toEqual([
    "Illness and recovery",
  ]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await page
    .getByRole("heading", { name: "Sleep better and manage insomnia" })
    .evaluate((heading) => {
      heading.scrollIntoView({ block: "start" });
    });
  await expect(
    shortcuts.getByRole("link", { name: "Sleep and insomnia" }),
  ).toHaveAttribute("aria-current", "location");
  await expect(vinegar).not.toHaveAttribute("aria-current", "location");
  await expect(shortcuts.locator('[aria-current="location"]')).toHaveCount(1);
});

test("the prevention guides lead to cardio, strength, and first-line insomnia care", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("link", { name: "Cardio and home strength plan" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Build fitness and strength" }),
  ).toBeInViewport();
  const movement = page.getByRole("region", {
    name: "Build fitness and strength",
  });
  await expect(
    movement.getByText(/three 10-minute brisk\s+walks/i),
  ).toBeVisible();
  await expect(
    movement.getByText("Chair sit-to-stand · 5 reps."),
  ).toBeVisible();
  const targets = page
    .getByRole("region", { name: "Live healthier for longer" })
    .locator(".target-board");
  await expect(targets.locator("svg").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await targets
    .getByRole("link", { name: "Strength training each week" })
    .click();
  await expect(
    movement.getByRole("heading", {
      name: "Simple bodyweight strength at home",
    }),
  ).toBeInViewport();

  const sleepShortcut = page.getByRole("link", {
    name: "Sleep and insomnia guide",
    exact: true,
  });
  await sleepShortcut.focus();
  await page.keyboard.press("Enter");
  const sleep = page.getByRole("heading", {
    name: "Sleep better and manage insomnia",
  });
  await expect(sleep).toBeInViewport();
  await expect(
    page.getByText(/first-line treatment for chronic insomnia/),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Chamomile, glycine and taurine" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tea and supplements for sleep" }),
  ).toBeInViewport();
  await expect(
    page.getByText(
      /human evidence is insufficient to\s+recommend it for insomnia/i,
    ),
  ).toBeVisible();
  await sleepShortcut.click();
  await expect(sleep).toBeInViewport();
});

test("all navigation destinations reflow on a narrow screen with large text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const name of [
    "Overview",
    "Food",
    "Food Labels",
    "Health",
    "Supplements",
    "Skin Care",
  ]) {
    const destination = nav.getByRole("link", { name, exact: true });
    await destination.click();
    await expect(destination).toHaveAttribute("aria-current", "page");
    await page.evaluate(async () => {
      document.documentElement.style.fontSize = "200%";
      await document.fonts.ready;
    });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBe(0);
    for (const link of await nav.getByRole("link").all()) {
      const bounds = await link.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    }
  }
  const routine = page.getByRole("region", { name: "Your daily routine" });
  await expect(routine.getByRole("listitem")).toHaveCount(5);
});

test("results keep report units and allow download of retired records", async ({
  page,
}) => {
  await page.goto("/pages/blood.html");
  await page.evaluate(() => {
    localStorage.setItem(
      "sg-health-baseline-v1",
      JSON.stringify({
        age: "32",
        values: { ldl: "102", lpa: "30", egfr: "89" },
        units: { ldl: "mg/dL", lpa: "mg/dL" },
      }),
    );
    localStorage.setItem("passiveIncome", '[{"amount":100}]');
    localStorage.setItem("ml-daily-current", "original contents");
    localStorage.setItem(
      "macro-longevity-checklist-v1",
      '{"completed":["oats"]}',
    );
    localStorage.setItem("unrelated", "leave this out");
  });
  await page.reload();
  const ldl = page.getByLabel("LDL cholesterol", { exact: true });
  const lpa = page.getByLabel("Lipoprotein(a) (Lp(a))", { exact: true });
  const lpaUnit = page.getByLabel("Lipoprotein(a) (Lp(a)) report unit");
  const bp = page.getByLabel("Blood pressure", { exact: true });
  const save = page.getByRole("button", { name: "Save results" });
  await expect(ldl).toHaveValue("102");
  await expect(page.getByLabel("LDL cholesterol report unit")).toHaveValue(
    "mg/dL",
  );
  await expect(lpaUnit).toHaveValue("mg/dL");
  await bp.fill("recheck");
  await save.click();
  await expect(bp).toBeFocused();
  await expect(bp).toHaveAttribute("aria-invalid", "true");
  await bp.fill("122/78");
  await page
    .getByLabel("Apolipoprotein B (ApoB)", { exact: true })
    .fill("<0.5");
  await lpaUnit.selectOption("nmol/L");
  await expect(lpa).toHaveValue("30");
  await save.click();
  const confirmUnit = page.getByRole("checkbox", {
    name: /confirmed this unit for Lipoprotein/,
  });
  await expect(confirmUnit).toBeFocused();
  await expect(
    page.getByText(
      "Check the unit against your report and confirm the correction.",
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("sg-health-baseline-v1")).units.lpa,
    ),
  ).toBe("mg/dL");
  await confirmUnit.check();
  await save.click();
  await expect(page.getByText("Results saved on this device.")).toBeVisible();
  await page.reload();
  await expect(bp).toHaveValue("122/78");
  await expect(lpa).toHaveValue("30");
  await expect(lpaUnit).toHaveValue("nmol/L");

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download full archive" }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("macro-longevity-data.json");
  const { records } = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(JSON.parse(records["sg-health-baseline-v1"])).toEqual({
    age: "32",
    values: { bp: "122/78", ldl: "102", lpa: "30", egfr: "89", apob: "<0.5" },
    units: { ldl: "mg/dL", lpa: "nmol/L", apob: "g/L" },
  });
  expect(records.passiveIncome).toBe('[{"amount":100}]');
  expect(records["ml-daily-current"]).toBe("original contents");
  expect(records["macro-longevity-checklist-v1"]).toBe(
    '{"completed":["oats"]}',
  );
  expect(records).not.toHaveProperty("unrelated");

  const [healthDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download health results" }).click(),
  ]);
  expect(healthDownload.suggestedFilename()).toBe(
    "macro-longevity-health-results.json",
  );
  const health = JSON.parse(
    await readFile(await healthDownload.path(), "utf8"),
  );
  expect(health.records).toEqual({
    "sg-health-baseline-v1": records["sg-health-baseline-v1"],
  });
});

test("a stale tab cannot overwrite a newer reading and keeps its draft", async ({
  page,
  context,
}) => {
  await page.goto("/pages/blood.html");
  const reading = page.getByLabel("HbA1c", { exact: true });
  const save = page.getByRole("button", { name: "Save results" });
  await reading.fill("5.7");
  await save.click();
  await expect(page.getByText("Results saved on this device.")).toBeVisible();
  const newer = await context.newPage();
  await newer.goto("/pages/blood.html");
  await reading.fill("5.8");
  await newer.getByLabel("HbA1c", { exact: true }).fill("6.1");
  await newer.getByRole("button", { name: "Save results" }).click();
  await expect(newer.getByText("Results saved on this device.")).toBeVisible();
  await save.click();
  await expect(page.getByText(/A result changed in another tab/)).toBeVisible();
  await expect(reading).toHaveValue("5.8");
  await newer.reload();
  await expect(newer.getByLabel("HbA1c", { exact: true })).toHaveValue("6.1");
});

test("dated HbA1c entries retain dates and report units across reloads", async ({
  page,
}) => {
  await page.goto("/pages/blood.html#hba1c-history");
  const openLog = page.getByText("Open the HbA1c log", { exact: true });
  await openLog.click();
  const log = page.getByRole("region", { name: "Dated HbA1c results" });
  const charts = log.getByText("Recorded HbA1c over time");
  await expect(charts).toBeHidden();
  for (const [date, value, unit] of [
    ["2026-11-10", "42", "mmol/mol"],
    ["2026-08-10", "5.7", "%"],
    ["2026-09-01", "5,8", "%"],
    ["2026-08-01", "6.0", "%"],
    ["2026-08-01", "42", "mmol/mol"],
  ]) {
    await page.getByLabel("Date on the report").fill(date);
    await page.getByLabel("HbA1c result on the report").fill(value);
    await page
      .getByLabel("Unit on the report", { exact: true })
      .selectOption(unit);
    await page.getByRole("button", { name: "Save dated HbA1c result" }).click();
    await expect(log.getByText("Dated HbA1c result saved.")).toBeVisible();
  }
  await page.reload();
  await openLog.click();
  await expect(log.getByRole("listitem")).toHaveText([
    "2026-11-10 · 42 mmol/mol",
    "2026-09-01 · 5,8 %",
    "2026-08-10 · 5.7 %",
    "2026-08-01 · 6.0 %",
    "2026-08-01 · 42 mmol/mol",
  ]);
  await expect(charts).toBeVisible();
  const figures = log.locator(".history-chart");
  await expect(figures.locator("figcaption")).toHaveText([
    "HbA1c (mmol/mol)",
    "HbA1c (%)",
  ]);
  const mmol = figures.nth(0).locator("circle");
  await expect(mmol).toHaveCount(2);
  await expect(mmol.first()).toHaveAttribute("cy", "56");
  await expect(mmol.last()).toHaveAttribute("cy", "56");
  const percent = figures.nth(1).locator("circle");
  await expect(percent).toHaveCount(3);
  const middleX = Number(await percent.nth(1).getAttribute("cx"));
  expect(middleX).toBeCloseTo(8 + (304 * 9) / 31);
  await expect(percent.last().locator("title")).toHaveText(
    "2026-09-01 · 5,8 %",
  );
  await expect(page.getByLabel("HbA1c", { exact: true })).toHaveValue("");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download health results" }).click(),
  ]);
  const { records } = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(JSON.parse(records["macro-longevity-a1c-history-v1"])).toHaveLength(5);
});

test("result unit corrections respect newer reports and unsaved edits", async ({
  page,
}) => {
  await page.goto("/pages/blood.html");
  const ldl = page.getByLabel("LDL cholesterol", { exact: true });
  const unit = page.getByLabel("LDL cholesterol report unit");
  const confirmation = page.getByRole("checkbox", {
    name: /confirmed this unit for LDL cholesterol/,
  });
  const save = page.getByRole("button", { name: "Save results" });
  await ldl.fill("3");
  await save.click();
  await unit.selectOption("mg/dL");
  await confirmation.check();
  await unit.selectOption("mmol/L");
  await unit.selectOption("mg/dL");
  await expect(confirmation).not.toBeChecked();

  await confirmation.check();
  await page.evaluate(() => {
    const key = "sg-health-baseline-v1";
    const next = JSON.parse(localStorage.getItem(key));
    next.values.ldl = "4";
    localStorage.setItem(key, JSON.stringify(next));
  });
  await save.click();
  await expect(page.getByText(/A result changed in another tab/)).toBeVisible();

  const warning = page.waitForEvent("dialog").then(async (dialog) => {
    expect(dialog.type()).toBe("beforeunload");
    await dialog.dismiss();
  });
  await Promise.all([
    warning,
    page.getByRole("link", { name: "Overview", exact: true }).click(),
  ]);
  await expect(ldl).toHaveValue("3");
  await expect(unit).toHaveValue("mg/dL");
});

test("food safety and optional recovery guidance link to their next action", async ({
  page,
}) => {
  await page.goto("/pages/stack.html");
  await page.getByRole("link", { name: "Cook and store safely" }).click();
  await expect(
    page.getByRole("heading", { name: "Keep your meals safe" }),
  ).toBeInViewport();
  await expect(
    page.getByText(
      /Discard cooked food left at room temperature for more than two\s+hours/,
    ),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Choose a reheating container" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Match the container to the heat" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("heading", { name: /Microplastics/ }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Allergens and recalls", exact: true })
    .click();
  await expect(
    page.getByText("Suspect a severe allergic reaction?"),
  ).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "995", exact: true }),
  ).toHaveAttribute("href", "tel:995");
  await expect(
    page.getByText("During pregnancy, avoid these predatory fish"),
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Suspected mercury or heavy-metal exposure" })
    .click();
  await expect(page).toHaveURL(/food-labels\.html#metal-exposure$/);
  const exposure = page.getByRole("region", {
    name: "Suspected mercury or heavy-metal exposure",
  });
  await exposure
    .getByText("What to do after suspected exposure", { exact: true })
    .click();
  await expect(
    exposure.getByRole("link", { name: "995", exact: true }),
  ).toHaveAttribute("href", "tel:995");
  await expect(exposure.getByText("Skip home “detox” products.")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Overview", exact: true })
    .click();
  await page
    .getByRole("link", {
      name: "Optional sauna and cold plunge safety",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sauna and cold plunges" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("heading", { name: "Cold plunge", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Health", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Singapore screening" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", {
      name: "Suspected mercury or heavy-metal exposure",
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Sauna and cold plunges" }),
  ).toHaveCount(0);
});

test("blocked storage leaves result edits usable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto("/pages/blood.html");
  const waist = page.getByLabel("Waist circumference", { exact: true });
  await waist.fill("82");
  await page.getByRole("button", { name: "Save results" }).click();
  await expect(page.getByText(/Could not save results/)).toBeVisible();
  await expect(waist).toHaveValue("82");
  await page.getByRole("button", { name: "Download full archive" }).click();
  await expect(page.getByText(/Could not download your data/)).toBeVisible();
});
